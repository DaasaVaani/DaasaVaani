import { describe, expect, test } from "vitest";
import {
  defaultPersonal, jsonBytes, listNameKey, listSnapshot, newControl, newList, nextRevision, parseStore,
  PersonalError, saveRecord, storageBytes, validatePersonal, validateStore, type PersonalStore,
} from "./personal-model";
import type { ListSnapshot } from "./list-transfer-types";

const snapshot: ListSnapshot = { format: "daasavaani-list", formatVersion: 1, name: "  Synthetic  ", entries: [
  { kind: "item", videoId: "fixture_ref", fallback: "  User label  " },
  { kind: "placeholder", text: "<b>Plain text</b>" }, { kind: "item", videoId: "fixture_ref" },
] };
const empty = (): PersonalStore => ({ control: newControl(), lists: [] });
function code(action: () => unknown, expected: string) {
  try { action(); throw new Error("Expected an explicit personal error"); }
  catch (reason) {
    expect(reason).toBeInstanceOf(PersonalError);
    if (reason instanceof PersonalError) expect(reason.code).toBe(expected);
  }
}
describe("transactional personal model", () => {
  test("new independent identities and minimal export preserve every ordered occurrence and user character", () => {
    const first = newList(snapshot), second = newList(snapshot);
    expect(listSnapshot(first)).toEqual(snapshot);
    expect(listSnapshot(second)).toEqual(snapshot);
    const ids = [first.id, second.id, ...first.entries.map(entry => entry.id), ...second.entries.map(entry => entry.id)];
    expect(new Set(ids).size).toBe(ids.length);
    expect(JSON.stringify(listSnapshot(first))).not.toContain(first.id);
    const state = empty(), before = structuredClone(state);
    const next = saveRecord(state, first, state.control, false);
    expect(next.control.revision).toBe(1);
    expect(next.lists).toEqual([first]);
    expect(state).toEqual(before);
  });
  test("duplicate-name comparison uses NFC and full default Unicode case folding without rewriting names", () => {
    expect(listNameKey("Straße")).toBe(listNameKey("STRASSE"));
    expect(listNameKey("Σ")).toBe(listNameKey("ς"));
    expect(listNameKey("CAFÉ")).toBe(listNameKey("cafe\u0301"));
    expect(listNameKey("I")).not.toBe(listNameKey("ı"));
    expect(listNameKey("É")).not.toBe(listNameKey("e"));
    const first = newList(snapshot, "Straße"), second = newList(snapshot, "STRASSE");
    const state = { ...empty(), lists: [first] }, before = structuredClone(state);
    code(() => saveRecord(state, second, state.control, false), "duplicate");
    expect(state).toEqual(before);
    const next = saveRecord(state, second, state.control, false, true);
    expect(next.lists.map(list => list.name)).toEqual(["Straße", "STRASSE"]);
    expect(listNameKey(" Name ")).not.toBe(listNameKey("Name"));
  });
  test("stale revisions, epochs, missing edit targets and revision overflow are explicit without mutation", () => {
    const state = empty(), record = newList(snapshot), before = structuredClone(state);
    code(() => saveRecord(state, record, { ...state.control, revision: 1 }, false), "stale");
    code(() => saveRecord(state, record, { ...state.control, epoch: crypto.randomUUID() }, false), "stale");
    code(() => saveRecord(state, record, state.control, true), "invalid");
    const full = { ...state, control: { ...state.control, revision: Number.MAX_SAFE_INTEGER } };
    code(() => nextRevision(full, full.control), "capacity");
    expect(state).toEqual(before);
  });
  test("list and occurrence UUID uniqueness is global while repeated references remain valid", () => {
    const first = newList(snapshot), second = newList(snapshot);
    const state = { ...empty(), lists: [first, second] };
    expect(() => validateStore(state)).not.toThrow();
    code(() => validateStore({ ...state, lists: [first, first] }), "invalid");
    const firstEntry = first.entries[0], secondEntry = second.entries[0];
    if (!firstEntry || !secondEntry) throw new Error("Missing repeated-reference fixture");
    const collision = { ...second, entries: [{ ...secondEntry, id: firstEntry.id }] };
    code(() => validateStore({ ...state, lists: [first, collision] }), "invalid");
    code(() => validateStore(state, { ...__PERSONAL_LIMITS__, maxLists: 1 }), "capacity");
    code(() => validateStore(state, { ...__PERSONAL_LIMITS__, maxTotalEntries: 5 }), "capacity");
    code(() => validateStore(state, { ...__PERSONAL_LIMITS__, maxEntriesPerList: 2 }), "capacity");
  });
  test("strict stored envelopes reject corruption rather than discarding unknown records or fields", () => {
    const state = empty(), personal = defaultPersonal();
    expect(parseStore([state.control], [], []).personal).toBeUndefined();
    expect(parseStore([state.control], [personal], []).personal).toEqual(personal);
    for (const bad of [{ ...personal, ignored: true }, { ...personal, favorites: ["same", "same"] },
      { ...personal, favorites: ["../unsafe"] }, { ...personal, favorites: new Array(1) },
      { ...personal, id: "another" }, { ...personal, language: "other" }]) {
      code(() => validatePersonal(bad), "invalid");
    }
    code(() => parseStore([], [], []), "invalid");
    code(() => parseStore([state.control], [personal, personal], []), "invalid");
    code(() => parseStore([{ ...state.control, revision: -1 }], [], []), "invalid");
    code(() => parseStore([{ ...state.control, ignored: true }], [], []), "invalid");
  });
  test("deterministic UTF8 accounting includes escaping, metadata, revision digits and exact capacity boundaries", () => {
    for (const text of ["", "\u0000", "é", "ಕ", "😀", "e\u0301", "\ud800", "\n", '"\\']) {
      expect(jsonBytes(text)).toBe(new TextEncoder().encode(JSON.stringify(text)).length);
    }
    const state = { ...empty(), personal: defaultPersonal(), lists: [newList(snapshot)] };
    const bytes = storageBytes(state);
    expect(() => validateStore(state, { ...__PERSONAL_LIMITS__, maxPersonalStoredBytes: bytes })).not.toThrow();
    code(() => validateStore(state, { ...__PERSONAL_LIMITS__, maxPersonalStoredBytes: bytes - 1 }), "capacity");
    const reordered = { ...state, lists: state.lists.map(list => ({ entries: list.entries, name: list.name, id: list.id })) };
    expect(storageBytes(reordered)).toBe(bytes);
    const nine = { ...state, control: { ...state.control, revision: 9 } };
    expect(storageBytes(nextRevision(nine, nine.control))).toBe(storageBytes(nine) + 1);
    const transferBytes = jsonBytes(snapshot);
    expect(() => validateStore(state, { ...__PERSONAL_LIMITS__, maxListDecodedBytes: transferBytes })).not.toThrow();
    code(() => validateStore(state, { ...__PERSONAL_LIMITS__, maxListDecodedBytes: transferBytes - 1 }), "capacity");
  });
  test("actual production personal byte ceiling accepts a complete valid envelope and rejects exactly one more byte", () => {
    const state = empty();
    const total = 40000;
    let identity = 0;
    const id = () => `00000000-0000-4000-8000-${(++identity).toString(16).padStart(12, "0")}`;
    state.lists = Array.from({ length: 20 }, () => ({ id: id(), name: "Synthetic capacity", entries:
      Array.from({ length: total / 20 }, () => ({ id: id(), kind: "placeholder" as const, text: "" })) }));
    const ceiling = __PERSONAL_LIMITS__.maxPersonalStoredBytes;
    const base = storageBytes(state);
    const characters = Math.floor((ceiling - base) / (4 * total));
    expect(characters).toBeGreaterThan(0);
    expect(characters).toBeLessThan(__PERSONAL_LIMITS__.maxEntryTextCodePoints);
    let remainder = ceiling - base - 4 * characters * total;
    for (const list of state.lists) for (const entry of list.entries) {
      if (entry.kind !== "placeholder") throw new Error("Invalid capacity fixture");
      const extra = Math.min(remainder, __PERSONAL_LIMITS__.maxEntryTextCodePoints - characters);
      entry.text = "😀".repeat(characters) + "x".repeat(extra);
      remainder -= extra;
    }
    expect(remainder).toBe(0);
    expect(storageBytes(state)).toBe(ceiling);
    expect(() => validateStore(state)).not.toThrow();
    const entry = state.lists.at(-1)?.entries.at(-1);
    if (!entry || entry.kind !== "placeholder") throw new Error("Missing capacity occurrence");
    entry.text += "x";
    expect(storageBytes(state)).toBe(ceiling + 1);
    code(() => validateStore(state), "capacity");
  }, 30000);
});
