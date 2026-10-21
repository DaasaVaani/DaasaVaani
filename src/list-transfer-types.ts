export interface ListSnapshot {
  format: "daasavaani-list"; formatVersion: 1; name: string;
  entries: ({ kind: "item"; videoId: string; fallback?: string } | { kind: "placeholder"; text: string })[];
}
export type TransferErrorCode = "invalid" | "encodedLimit" | "decodedLimit" | "linkLimit" | "failed";
export class TransferError extends Error {
  constructor(readonly code: TransferErrorCode) { super(`List transfer: ${code}`); }
}
export interface TransferConfig {
  maxListEncodedBytes: number; maxListDecodedBytes: number; maxSharedUrlAscii: number;
  transferChunkBytes: number; listCompressionLevel: number; canonicalBaseUrl: string; listLinkPath: string;
}
