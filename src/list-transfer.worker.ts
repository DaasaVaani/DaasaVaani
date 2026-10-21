import { ListCodec } from "./list-transfer";
import { TransferError, type ListSnapshot, type TransferErrorCode } from "./list-transfer-types";

export type TransferRequest =
  | { kind: "decodeFile"; file: Blob }
  | { kind: "decodeLink"; link: string }
  | { kind: "encodeFile" | "encodeLink"; snapshot: ListSnapshot };
export type TransferResult =
  | { kind: "snapshot"; snapshot: ListSnapshot }
  | { kind: "file"; bytes: Uint8Array }
  | { kind: "link"; link: string };
export type TransferResponse = { result: TransferResult } | { error: TransferErrorCode };

const codec = new ListCodec({ ...__TRANSFER_LIMITS__, ...__WEB_CONFIG__ });
self.onmessage = async (event: MessageEvent<TransferRequest>) => {
  try {
    const request = event.data;
    let result: TransferResult;
    if (request.kind === "decodeFile") {
      if (request.file.size > __TRANSFER_LIMITS__.maxListEncodedBytes) throw new TransferError("encodedLimit");
      result = { kind: "snapshot", snapshot: codec.decodeFile(new Uint8Array(await request.file.arrayBuffer())) };
    } else if (request.kind === "decodeLink") result = { kind: "snapshot", snapshot: codec.decodeLink(request.link) };
    else if (request.kind === "encodeFile") result = { kind: "file", bytes: codec.encodeFile(request.snapshot) };
    else if (request.kind === "encodeLink") result = { kind: "link", link: codec.encodeLink(request.snapshot) };
    else throw new TransferError("invalid");
    self.postMessage({ result } satisfies TransferResponse);
  } catch (error) {
    self.postMessage({ error: error instanceof TransferError ? error.code : "failed" } satisfies TransferResponse);
  }
};
