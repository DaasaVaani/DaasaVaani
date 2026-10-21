import { TransferError } from "./list-transfer-types";
import type { TransferRequest, TransferResponse, TransferResult } from "./list-transfer.worker";

export function transfer(request: TransferRequest, signal: AbortSignal): Promise<TransferResult> {
  return new Promise((resolve, reject) => {
    signal.throwIfAborted();
    if (request.kind === "decodeFile" && request.file.size > __TRANSFER_LIMITS__.maxListEncodedBytes) throw new TransferError("encodedLimit");
    if (request.kind === "decodeLink" && request.link.length > __TRANSFER_LIMITS__.maxSharedUrlAscii) throw new TransferError("linkLimit");
    const worker = new Worker(new URL("./list-transfer.worker.ts", import.meta.url), { type: "module" });
    const finish = () => { worker.terminate(); signal.removeEventListener("abort", abort); };
    const abort = () => { finish(); reject(signal.reason); };
    signal.addEventListener("abort", abort, { once: true });
    worker.onmessage = (event: MessageEvent<TransferResponse>) => {
      finish();
      if ("error" in event.data) reject(new TransferError(event.data.error));
      else resolve(event.data.result);
    };
    worker.onerror = () => { finish(); reject(new TransferError("failed")); };
    worker.onmessageerror = () => { finish(); reject(new TransferError("failed")); };
    try { worker.postMessage(request); }
    catch { finish(); reject(new TransferError("failed")); }
  });
}
