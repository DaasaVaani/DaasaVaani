import Ajv2020 from "ajv/dist/2020";
import {
  ZStream, GZheader, Z_OK, Z_STREAM_END, Z_FINISH, Z_NO_FLUSH,
  zlibInflateInit2, zlibInflate, zlibInflateEnd,
  zlibDeflateInit2, zlibDeflateSetHeader, zlibDeflate, zlibDeflateEnd,
} from "pako";
import schema from "../shared/schemas/list-transfer.schema.json";
import schemaV2 from "../shared/schemas/list-transfer-v2.schema.json";
import { TransferError, type ListSnapshot, type TransferConfig } from "./list-transfer-types";
const ajv = new Ajv2020({ strict: true });
const validV1 = ajv.compile<ListSnapshot>(schema), validV2 = ajv.compile<ListSnapshot>(schemaV2);
const validate = (value: unknown): value is ListSnapshot => validV1(value) || validV2(value);
const encoder = new TextEncoder();
function base64url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}
function rejectDuplicateKeys(text: string) {
  const stack: (Set<string> | null)[] = [];
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (char === "{") stack.push(new Set());
    else if (char === "[") stack.push(null);
    else if (char === "}" || char === "]") stack.pop();
    else if (char === '"') {
      const start = index++;
      while (index < text.length && text[index] !== '"') {
        if (text[index] === "\\") index++;
        index++;
      }
      let next = index + 1;
      while (/\s/.test(text[next] ?? "")) next++;
      const keys = stack.at(-1);
      if (text[next] === ":" && keys) {
        const key: unknown = JSON.parse(text.slice(start, index + 1));
        if (typeof key !== "string" || keys.has(key)) throw new TransferError("invalid");
        keys.add(key);
      }
    }
  }
}

function combine(chunks: Uint8Array[], length: number) {
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return bytes;
}

export class ListCodec {
  constructor(readonly config: TransferConfig) {}
  private transform(input: Uint8Array, gzip: boolean, decoding: boolean): Uint8Array {
    const limit = decoding ? this.config.maxListDecodedBytes : this.config.maxListEncodedBytes;
    const stream = new ZStream();
    const initialized = decoding ? zlibInflateInit2(stream, gzip ? 31 : -15)
      : zlibDeflateInit2(stream, this.config.listCompressionLevel, 8, gzip ? 31 : -15, 8, 0);
    if (initialized !== Z_OK) throw new TransferError("failed");
    const chunks: Uint8Array[] = [];
    let length = 0;
    try {
      if (!decoding && gzip) {
        const header = new GZheader();
        header.os = 255;
        header.time = 0;
        if (zlibDeflateSetHeader(stream, header) !== Z_OK) throw new TransferError("failed");
      }
      stream.input = input;
      stream.next_in = 0;
      stream.avail_in = input.length;
      for (;;) {
        const before = stream.next_in;
        stream.output = new Uint8Array(Math.min(this.config.transferChunkBytes, limit - length + 1));
        stream.next_out = 0;
        stream.avail_out = stream.output.length;
        const status = decoding ? zlibInflate(stream, Z_NO_FLUSH) : zlibDeflate(stream, Z_FINISH);
        length += stream.next_out;
        if (length > limit) throw new TransferError(decoding ? "decodedLimit" : "encodedLimit");
        if (stream.next_out) chunks.push(stream.output.subarray(0, stream.next_out));
        if (status === Z_STREAM_END) {
          if (stream.avail_in !== 0) throw new TransferError("invalid");
          return combine(chunks, length);
        }
        if (status !== Z_OK || (before === stream.next_in && !stream.next_out)) throw new TransferError("invalid");
      }
    } finally {
      if (decoding) zlibInflateEnd(stream);
      else zlibDeflateEnd(stream);
    }
  }
  private parse(bytes: Uint8Array): ListSnapshot {
    let value: unknown;
    let text: string;
    try {
      text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      value = JSON.parse(text);
    }
    catch { throw new TransferError("invalid"); }
    rejectDuplicateKeys(text);
    if (!validate(value)) throw new TransferError("invalid");
    return value;
  }
  private serialize(value: unknown): Uint8Array {
    if (!validate(value)) throw new TransferError("invalid");
    const text = JSON.stringify(value);
    const limit = this.config.maxListDecodedBytes;
    if (text.length > limit) throw new TransferError("decodedLimit");
    const output = new Uint8Array(Math.min(text.length * 3, limit + 1));
    const encoded = encoder.encodeInto(text, output);
    if (encoded.read !== text.length || encoded.written > limit) throw new TransferError("decodedLimit");
    return output.slice(0, encoded.written);
  }
  decodeFile(bytes: Uint8Array): ListSnapshot {
    if (bytes.length > this.config.maxListEncodedBytes) throw new TransferError("encodedLimit");
    return this.parse(this.transform(bytes, true, true));
  }
  encodeFile(value: unknown): Uint8Array { return this.transform(this.serialize(value), true, false); }
  encodeLink(value: unknown): string {
    const bytes = this.transform(this.serialize(value), false, false);
    const url = new URL(this.config.listLinkPath, this.config.canonicalBaseUrl);
    url.hash = "/list/";
    if (url.href.length + Math.ceil(bytes.length * 4 / 3) > this.config.maxSharedUrlAscii) throw new TransferError("linkLimit");
    url.hash += base64url(bytes);
    if (url.href.length > this.config.maxSharedUrlAscii) throw new TransferError("linkLimit");
    return url.href;
  }
  decodeLink(link: string): ListSnapshot {
    if (link.length > this.config.maxSharedUrlAscii) throw new TransferError("linkLimit");
    if (!/^[\x21-\x7e]+$/.test(link)) throw new TransferError("invalid");
    let url: URL;
    try { url = new URL(link); } catch { throw new TransferError("invalid"); }
    const base = new URL(this.config.canonicalBaseUrl);
    const open = new URL(this.config.listLinkPath, base);
    if (url.protocol !== "https:" || url.origin !== base.origin || url.username || url.password || url.search ||
        (url.pathname !== base.pathname && url.pathname !== open.pathname) || !url.hash.startsWith("#/list/")) {
      throw new TransferError("invalid");
    }
    const payload = url.hash.slice("#/list/".length);
    if (!/^[A-Za-z0-9_-]+$/.test(payload) || payload.length % 4 === 1) throw new TransferError("invalid");
    const bytes = Uint8Array.from(atob(payload.replaceAll("-", "+").replaceAll("_", "/")), char => char.charCodeAt(0));
    const canonical = base64url(bytes);
    if (canonical !== payload) throw new TransferError("invalid");
    if (bytes.length > this.config.maxListEncodedBytes) throw new TransferError("encodedLimit");
    return this.parse(this.transform(bytes, false, true));
  }
}
