import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { strictYaml } from "../shared/tools/generate-catalog.mjs";
import { candidates, osaFragment, search, terms } from "./search";
import type { SearchIndex, SearchPolicy, SearchToken } from "../shared/types/publication";
import Ajv2020 from "ajv/dist/2020";
import schema from "../shared/schemas/search-policy.schema.json";
const value = strictYaml(readFileSync(new URL("../shared/settings/search.yml", import.meta.url), "utf8"));
const validate = new Ajv2020({ strict: true }).compile<SearchPolicy>(schema);
if (!validate(value)) throw new Error("Invalid test policy");
const policy = value;

function makeIndex(tokens: SearchToken[]): SearchIndex {
  const postings: SearchIndex["postings"] = Object.create(null);
  tokens.forEach((token, tokenId) => {
    for (const size of [1, 2, 3]) {
      const letters = Array.from(token.value);
      const grams: string[] = [];
      for (let offset = 0; offset < letters.length - size + 1; offset++) grams.push(letters.slice(offset, offset + size).join(""));
      for (const gram of new Set(grams)) (postings[`${size}:${gram}`] ??= []).push([tokenId, grams.filter(value => value === gram).length]);
    }
  });
  return { formatVersion: 1, policyHash: "a".repeat(64), tokens, postings };
}
function oracle(query: string, target: string) {
  const q = Array.from(query), t = Array.from(target);
  let best = q.length;
  for (let start = 0; start <= t.length; start++) {
    for (let end = start; end <= t.length; end++) {
      const fragment = t.slice(start, end);
      const distances = Array.from({ length: q.length + 1 }, (_, i) =>
        Array.from({ length: fragment.length + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
      for (let i = 1; i <= q.length; i++) for (let j = 1; j <= fragment.length; j++) {
        distances[i]![j] = Math.min(distances[i - 1]![j]! + 1, distances[i]![j - 1]! + 1,
          distances[i - 1]![j - 1]! + (q[i - 1] === fragment[j - 1] ? 0 : 1));
        if (i >= 2 && j >= 2 && q[i - 1] === fragment[j - 2] && q[i - 2] === fragment[j - 1]) {
          distances[i]![j] = Math.min(distances[i]![j]!, distances[i - 2]![j - 2]! + 1);
        }
      }
      best = Math.min(best, distances[q.length]![fragment.length]!);
    }
  }
  return best;
}
describe("indexed code-point OSA fragments", () => {
  it("matches substrings and preserves OSA restrictions", () => {
    expect(osaFragment("dir", "vadiraja")).toBe(0);
    expect(osaFragment("raed", "reading")).toBe(1);
    expect(osaFragment("CA", "ABC")).toBe(1);
    expect(osaFragment("ಕನ್ನಡ", "ಕನ್ನಡ")).toBe(0);
    expect(osaFragment("😀ab", "x😀bay")).toBe(1);
  });
  it("agrees with independently enumerated fragments and never loses valid candidates", () => {
    const words = ["", "a", "b", "aa", "ab", "ba", "aaa", "aab", "aba", "baa", "abcd", "bacd",
      "zzabcdzz", "abcdefghij", "abcedfghij", "aaaaaaa", "😀ab", "ಕನ್ನಡ"];
    for (const query of words.filter(Boolean)) for (const token of words) {
      const expected = oracle(query, token);
      expect(osaFragment(query, token), `${query} / ${token}`).toBe(expected);
      const allowance = policy.editBands.find(band => [...query].length <= band.maxLength)!.edits;
      if (expected <= allowance) {
        expect(candidates(query, allowance, makeIndex([{ value: token, itemId: "test", field: "title" }])).has(0), `${query} / ${token}`).toBe(true);
      }
    }
  });
  it("requires AND, ranks metadata before lyrics and does not boost repeats", () => {
    const index = makeIndex([
      { value: "reading", itemId: "z", field: "title" },
      { value: "words", itemId: "z", field: "lyrics", lineId: "line-z" },
      { value: "reading", itemId: "a", field: "lyrics", lineId: "line-a" },
      { value: "words", itemId: "a", field: "lyrics", lineId: "line-a" },
    ]);
    expect(search("read words", index, policy).map(hit => hit.itemId)).toEqual(["z", "a"]);
    expect(search("read missing", index, policy)).toEqual([]);
    expect(search("read read", index, policy)).toEqual(search("read", index, policy));
  });
  it("enforces query boundaries and explicitly rejects unsupported controls", () => {
    expect(terms("x".repeat(256), policy)).toHaveLength(1);
    expect(() => terms("x".repeat(257), policy)).toThrow();
    expect(() => terms(Array.from({ length: 17 }, (_, i) => `term${i}`).join(" "), policy)).toThrow();
    expect(() => terms("a\u0000b", policy)).toThrow();
  });
});
