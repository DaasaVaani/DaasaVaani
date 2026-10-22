import { referenceKey, type ListRecord } from "./personal-model";

export function sameRecitationList(left: ListRecord, right: ListRecord | undefined): boolean {
  return right !== undefined && left.id === right.id && left.name === right.name &&
    left.entries.length === right.entries.length && left.entries.every((entry, index) => {
      const other = right.entries[index];
      return other !== undefined && entry.id === other.id && (entry.kind === "placeholder"
        ? other.kind === "placeholder" && entry.text === other.text
        : other.kind !== "placeholder" && referenceKey(entry) === referenceKey(other) && entry.fallback === other.fallback);
    });
}
