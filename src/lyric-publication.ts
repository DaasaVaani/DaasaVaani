import Ajv2020 from "ajv/dist/2020";
import sourceSchema from "../shared/schemas/lyric-publication.schema.json";
import type { LyricDescriptor, LyricItem, LyricManifest } from "../shared/types/lyrics";
import { fetchBytes, parse, record, validateReference, verified } from "./artifacts";

const schema = structuredClone(sourceSchema);
function allowOptionalFields(value: unknown): void {
  if (Array.isArray(value)) value.forEach(allowOptionalFields);
  else if (record(value)) {
    if (value.additionalProperties === false) value.additionalProperties = true;
    Object.values(value).forEach(allowOptionalFields);
  }
}
allowOptionalFields(schema);
const ajv = new Ajv2020({ strict: true });
const descriptorValid = ajv.compile<LyricDescriptor>({ ...schema, $ref: "#/$defs/descriptor" });
const manifestValid = ajv.compile<LyricManifest>({ ...schema, $ref: "#/$defs/manifest" });
const itemValid = ajv.compile<LyricItem>({ ...schema, $ref: "#/$defs/item" });
function text(value: string) {
  if (/[\ud800-\udfff\r\n\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f\u2028\u2029]/u.test(value)) {
    throw new Error("Lyric contains malformed Unicode or unsupported controls");
  }
}
export class PreparedLyrics {
  constructor(readonly catalog: LyricManifest["catalog"], private readonly items: ReadonlyMap<string, LyricItem>,
    readonly manifestSha256: string) {}
  item(id: string) { return this.items.get(id); }
}
export async function prepareLyrics(signal?: AbortSignal, progress?: (done: number, total: number) => void,
  settings: WebConfig["lyricPreview"] = __WEB_CONFIG__.lyricPreview): Promise<PreparedLyrics> {
  signal?.throwIfAborted();
  const controller = new AbortController();
  const abort = () => controller.abort(signal?.reason);
  signal?.addEventListener("abort", abort, { once: true });
  try {
    const descriptorUrl = new URL(settings.descriptorUrl);
    const base = new URL(".", descriptorUrl);
    const bytes = await fetchBytes(descriptorUrl, __BOUNDS__.maxDescriptorBytes, controller.signal, "no-store");
    const descriptor = parse(bytes);
    if (!descriptorValid(descriptor)) throw new Error("Unsupported lyric descriptor");
    let encoded = bytes.length, decoded = bytes.length;
    function account(encodedBytes: number, decodedBytes: number) {
      if (encodedBytes > settings.maxEncodedBytes - encoded || decodedBytes > settings.maxDecodedBytes - decoded) {
        throw new Error("Complete lyric library exceeds configured preparation byte limits");
      }
      encoded += encodedBytes; decoded += decodedBytes;
    }
    validateReference(descriptor.manifest, __BOUNDS__.maxManifestEncodedBytes, __BOUNDS__.maxManifestDecodedBytes);
    account(descriptor.manifest.encodedBytes, descriptor.manifest.decodedBytes);
    const manifest = await verified(base, descriptor.manifest, __BOUNDS__.maxManifestEncodedBytes, __BOUNDS__.maxManifestDecodedBytes, controller.signal, "no-store");
    if (!manifestValid(manifest)) throw new Error("Unsupported lyric manifest or required capability");
    if (manifest.catalog.length > settings.maxItems) throw new Error("Complete lyric library exceeds configured item count");
    const ids = new Set<string>();
    for (const summary of manifest.catalog) {
      if (ids.has(summary.lyricId)) throw new Error("Duplicate lyric catalog identity");
      ids.add(summary.lyricId); text(summary.title); summary.tags.forEach(text);
      validateReference(summary.item, __BOUNDS__.maxItemEncodedBytes, __BOUNDS__.maxItemDecodedBytes);
      account(summary.item.encodedBytes, summary.item.decodedBytes);
    }
    controller.signal.throwIfAborted();
    progress?.(0, manifest.catalog.length);
    const items = new Map<string, LyricItem>();
    let next = 0;
    const workers = Array.from({ length: Math.min(settings.concurrentRequests, manifest.catalog.length) }, async () => {
      for (;;) {
        controller.signal.throwIfAborted();
        const summary = manifest.catalog[next++];
        if (!summary) return;
        const item = await verified(base, summary.item, __BOUNDS__.maxItemEncodedBytes, __BOUNDS__.maxItemDecodedBytes, controller.signal, "no-store");
        controller.signal.throwIfAborted();
        if (!itemValid(item)) throw new Error("Invalid lyric item");
        if (item.lyricId !== summary.lyricId || item.title !== summary.title ||
            item.tags.length !== summary.tags.length || item.tags.some((tag, index) => tag !== summary.tags[index])) {
          throw new Error("Lyric item does not match its catalog summary");
        }
        let kannada = false, lines = 0;
        for (const line of item.lines) {
          text(line.text);
          if (line.kind === "layout") {
            if ("lineId" in line) throw new Error("Layout must not have a lyric line identity");
          } else {
            if (ids.has(line.lineId) || /^[ \t]*$/u.test(line.text)) throw new Error("Duplicate, conflicting or blank lyric line identity");
            ids.add(line.lineId); lines++;
            kannada ||= /\p{Script=Kannada}/u.test(line.text);
          }
        }
        if (!lines || !kannada) throw new Error("Lyric has no canonical Kannada lines");
        items.set(item.lyricId, item);
        progress?.(items.size, manifest.catalog.length);
      }
    });
    try { await Promise.all(workers); }
    catch (error) { controller.abort(error); await Promise.allSettled(workers); throw error; }
    controller.signal.throwIfAborted();
    return new PreparedLyrics(manifest.catalog, items, descriptor.manifest.sha256);
  } finally { signal?.removeEventListener("abort", abort); }
}
