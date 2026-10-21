import type { SearchIndex, SearchPolicy } from "../shared/types/publication";
export interface Hit { itemId: string; metadata: boolean; score: number; worst: number; edits: number; lineIds: string[] }
export const normalize = (value: string) => value.normalize("NFC").replace(/[A-Z]/g, letter => letter.toLowerCase());
export function terms(query: string, policy: SearchPolicy) {
  if ([...query].length > policy.maxQueryCodePoints) throw new Error(`Query exceeds ${policy.maxQueryCodePoints} code points`);
  if (/[\p{Cc}\p{Cf}]/u.test(query)) throw new Error("Unsupported control character in query");
  if (/[~^]/u.test(query)) throw new Error("Reviewed technical-profile matching is not implemented in this fixture milestone");
  const result = [...new Set(normalize(query).match(/[\p{L}\p{M}\p{Nd}]+/gu) ?? [])];
  if (result.length > policy.maxTerms) throw new Error(`Query exceeds ${policy.maxTerms} distinct terms`);
  return result;
}
export function osaFragment(query: string, token: string): number {
  const a = [...query], b = [...token];
  let previous = Array.from({ length: a.length + 1 }, (_, i) => i);
  let beforePrevious = previous;
  let best = a.length;
  for (let j = 1; j <= b.length; j++) {
    const current = Array<number>(a.length + 1).fill(0);
    for (let i = 1; i <= a.length; i++) {
      current[i] = Math.min(previous[i]! + 1, current[i - 1]! + 1,
        previous[i - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        current[i] = Math.min(current[i]!, beforePrevious[i - 2]! + 1);
      }
    }
    best = Math.min(best, current[a.length]!);
    beforePrevious = previous;
    previous = current;
  }
  return best;
}
export function candidates(query: string, edits: number, index: SearchIndex): Set<number> {
  const chars = [...query];
  let result: Set<number> | undefined;
  const bounds = [chars.length - edits, chars.length - 1 - 3 * edits, chars.length - 2 - 4 * edits];
  for (let size = 1; size <= 3; size++) {
    const bound = bounds[size - 1]!;
    if (bound <= 0) continue;
    const counts = new Map<string, number>();
    for (let i = 0; i + size <= chars.length; i++) {
      const gram = chars.slice(i, i + size).join("");
      counts.set(gram, (counts.get(gram) ?? 0) + 1);
    }
    const overlaps = new Map<number, number>();
    for (const [gram, count] of counts) {
      for (const [id, available] of index.postings[`${size}:${gram}`] ?? []) {
        overlaps.set(id, (overlaps.get(id) ?? 0) + Math.min(count, available));
      }
    }
    const next = new Set([...overlaps].filter(([, overlap]) => overlap >= bound).map(([id]) => id));
    result = result ? new Set([...result].filter(id => next.has(id))) : next;
  }
  if (!result) throw new Error("Search policy produced no positive candidate bound");
  return result;
}
export function search(query: string, index: SearchIndex, policy: SearchPolicy): Hit[] {
  const queries = terms(query, policy);
  if (!queries.length) return [];
  let hits: Map<string, Hit> | undefined;
  for (const query of queries) {
    const allowance = policy.editBands.find(band => [...query].length <= band.maxLength)?.edits;
    if (allowance === undefined) throw new Error("Query length not covered by search policy");
    const best = new Map<string, { weight: number; edits: number; lineId?: string }>();
    for (const tokenId of candidates(query, allowance, index)) {
      const token = index.tokens[tokenId];
      if (!token) throw new Error("Index posting references missing token");
      const edits = osaFragment(query, token.value);
      if (edits > allowance) continue;
      const weight = policy.weights[token.field];
      if (weight === undefined) throw new Error(`Unknown searchable field: ${token.field}`);
      const previous = best.get(token.itemId);
      if (!previous || weight > previous.weight || (weight === previous.weight && edits < previous.edits)) {
        best.set(token.itemId, { weight, edits, lineId: token.lineId });
      }
    }
    const next = new Map<string, Hit>();
    for (const [itemId, match] of best) {
      const previous = hits?.get(itemId);
      if (hits && !previous) continue;
      next.set(itemId, { itemId, metadata: Boolean(previous?.metadata || match.weight > policy.weights.lyrics!),
        score: (previous?.score ?? 0) + match.weight, worst: Math.max(previous?.worst ?? 0, match.edits),
        edits: (previous?.edits ?? 0) + match.edits,
        lineIds: [...new Set([...(previous?.lineIds ?? []), ...(match.lineId ? [match.lineId] : [])])] });
    }
    hits = next;
  }
  return [...(hits?.values() ?? [])].sort((a, b) => Number(b.metadata) - Number(a.metadata) ||
    b.score - a.score || a.worst - b.worst || a.edits - b.edits || (a.itemId < b.itemId ? -1 : a.itemId > b.itemId ? 1 : 0));
}
