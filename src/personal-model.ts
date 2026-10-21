import Ajv2020 from "ajv/dist/2020";
import recordSchema from "../shared/schemas/list-record.schema.json";
import transferSchema from "../shared/schemas/list-transfer.schema.json";
import type { ListSnapshot } from "./list-transfer-types";
import { caseFold } from "unicode-case-folding";

export interface Personal {
  id: "personal"; favorites: string[]; language: "en" | "kn"; theme: "light" | "dark";
}
export type ListEntry = ListSnapshot["entries"][number] & { id: string };
export interface ListRecord { id: string; name: string; entries: ListEntry[] }
export interface Revision { epoch: string; revision: number }
export interface Control extends Revision { id: "state"; formatVersion: 2 }
export interface PersonalStore { control: Control; personal?: Personal; lists: ListRecord[] }
export type PersonalErrorCode = "invalid" | "listInvalid" | "capacity" | "stale" | "duplicate";
export class PersonalError extends Error {
  constructor(readonly code: PersonalErrorCode) {
    super(code === "invalid" ? "Invalid personal database record; existing data was not replaced."
      : code === "listInvalid" ? "Invalid list name or entry."
      : code === "capacity" ? "Personal storage or collection limit reached."
      : code === "stale" ? "Personal data changed; review it and try again."
      : "Another list already uses this name; explicit confirmation is required.");
  }
}
const ajv = new Ajv2020({ strict: true });
const validList = ajv.compile<ListRecord>(recordSchema);
const validSnapshot = ajv.compile<ListSnapshot>(transferSchema);
const uuid = new RegExp(recordSchema.properties.id.pattern, "u");
const object = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const keys = (value: Record<string, unknown>, expected: string[]) =>
  Object.keys(value).length === expected.length && expected.every(key => Object.hasOwn(value, key));

export function defaultPersonal(): Personal {
  return { id: "personal", favorites: [], language: __WEB_CONFIG__.defaultUiLanguage, theme: __WEB_CONFIG__.defaultTheme };
}
export function validatePersonal(value: unknown, limits = __PERSONAL_LIMITS__): asserts value is Personal {
  if (!object(value) || !keys(value, ["id", "favorites", "language", "theme"]) || value.id !== "personal" ||
      !Array.isArray(value.favorites) || Object.keys(value.favorites).length !== value.favorites.length ||
      Array.from(value.favorites).some(id => typeof id !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(id)) ||
      new Set(value.favorites).size !== value.favorites.length ||
      (value.language !== "en" && value.language !== "kn") || (value.theme !== "light" && value.theme !== "dark")) {
    throw new PersonalError("invalid");
  }
  if (value.favorites.length > limits.maxFavorites) throw new PersonalError("capacity");
}
export function newControl(): Control {
  return { id: "state", formatVersion: 2, epoch: crypto.randomUUID(), revision: 0 };
}
export function parseStore(controls: unknown[], personal: unknown[], lists: unknown[]): PersonalStore {
  const control = controls[0];
  if (controls.length !== 1 || !object(control) || !keys(control, ["id", "formatVersion", "epoch", "revision"]) ||
      control.id !== "state" || control.formatVersion !== 2 || typeof control.epoch !== "string" || !uuid.test(control.epoch) ||
      typeof control.revision !== "number" || !Number.isSafeInteger(control.revision) || control.revision < 0 ||
      personal.length > 1) throw new PersonalError("invalid");
  const preferences = personal[0];
  if (preferences !== undefined) validatePersonal(preferences);
  const records: ListRecord[] = [];
  for (const list of lists) {
    if (!validList(list)) throw new PersonalError("invalid");
    records.push(list);
  }
  const state: PersonalStore = {
    control: { id: "state", formatVersion: 2, epoch: control.epoch, revision: control.revision },
    personal: preferences, lists: records,
  };
  validateStore(state);
  return state;
}
export function listSnapshot(record: ListRecord): ListSnapshot {
  return { format: "daasavaani-list", formatVersion: 1, name: record.name,
    entries: record.entries.map(entry => entry.kind === "item"
      ? { kind: "item", videoId: entry.videoId, ...(entry.fallback === undefined ? {} : { fallback: entry.fallback }) }
      : { kind: "placeholder", text: entry.text }) };
}
export function newList(snapshot: ListSnapshot, name = snapshot.name): ListRecord {
  if (!validSnapshot(snapshot)) throw new PersonalError("listInvalid");
  const record = { id: crypto.randomUUID(), name, entries: snapshot.entries.map(entry => ({ ...entry, id: crypto.randomUUID() })) };
  if (!validList(record)) throw new PersonalError("listInvalid");
  return record;
}
function entryIndex(record: ListRecord, id: string): number {
  const index = record.entries.findIndex(entry => entry.id === id);
  if (index < 0) throw new PersonalError("stale");
  return index;
}
export function editEntry(record: ListRecord, id: string | undefined, value: ListSnapshot["entries"][number]): ListRecord {
  const index = id === undefined ? record.entries.length : entryIndex(record, id);
  if (id === undefined && record.entries.length >= __PERSONAL_LIMITS__.maxEntriesPerList) throw new PersonalError("capacity");
  const entries = [...record.entries];
  entries.splice(index, id === undefined ? 0 : 1, { ...value, id: id ?? crypto.randomUUID() });
  const next = { ...record, entries };
  if (!validList(next)) throw new PersonalError("listInvalid");
  return next;
}
export function moveEntry(record: ListRecord, id: string, direction: -1 | 1): ListRecord {
  const index = entryIndex(record, id), target = index + direction, entry = record.entries[index];
  if (!entry || target < 0 || target >= record.entries.length) throw new PersonalError("listInvalid");
  const entries = [...record.entries];
  entries.splice(index, 1); entries.splice(target, 0, entry);
  return { ...record, entries };
}
export function removeEntry(record: ListRecord, id: string): ListRecord {
  const index = entryIndex(record, id), entries = [...record.entries];
  entries.splice(index, 1);
  return { ...record, entries };
}
export function jsonBytes(value: unknown, limit = Number.MAX_SAFE_INTEGER): number {
  const text = JSON.stringify(value);
  if (text === undefined) throw new PersonalError("invalid");
  let bytes = 0;
  for (const character of text) {
    const code = character.charCodeAt(0);
    bytes += character.length === 2 ? 4 : code <= 0x7f ? 1 : code <= 0x7ff ? 2 : 3;
    if (bytes > limit) throw new PersonalError("capacity");
  }
  return bytes;
}
export function storageBytes(state: PersonalStore, limit = Number.MAX_SAFE_INTEGER): number {
  const personal = state.personal;
  return jsonBytes({
    format: "fixture-personal-storage", formatVersion: 2,
    control: { id: "state", formatVersion: 2, epoch: state.control.epoch, revision: state.control.revision },
    personal: personal ? [{ id: "personal", favorites: personal.favorites, language: personal.language, theme: personal.theme }] : [],
    lists: [...state.lists].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0).map(list => ({
      id: list.id, name: list.name, entries: list.entries.map(entry => entry.kind === "item"
        ? { id: entry.id, kind: "item", videoId: entry.videoId, ...(entry.fallback === undefined ? {} : { fallback: entry.fallback }) }
        : { id: entry.id, kind: "placeholder", text: entry.text }),
    })),
  }, limit);
}
export function validateStore(state: PersonalStore, limits = __PERSONAL_LIMITS__): void {
  if (state.personal) validatePersonal(state.personal, limits);
  if (state.lists.length > limits.maxLists) throw new PersonalError("capacity");
  const lists = new Set<string>(), occurrences = new Set<string>();
  let total = 0;
  for (const list of state.lists) {
    if (!validList(list) || lists.has(list.id)) throw new PersonalError("invalid");
    lists.add(list.id);
    total += list.entries.length;
    if (list.entries.length > limits.maxEntriesPerList || total > limits.maxTotalEntries) throw new PersonalError("capacity");
    for (const entry of list.entries) {
      if (occurrences.has(entry.id)) throw new PersonalError("invalid");
      occurrences.add(entry.id);
    }
    jsonBytes(listSnapshot(list), limits.maxListDecodedBytes);
  }
  storageBytes(state, limits.maxPersonalStoredBytes);
}
export function nextRevision(state: PersonalStore, expected: Revision): PersonalStore {
  assertRevision(state.control, expected);
  if (state.control.revision === Number.MAX_SAFE_INTEGER) throw new PersonalError("capacity");
  return { ...state, control: { ...state.control, revision: state.control.revision + 1 } };
}
function assertRevision(actual: Revision, expected: Revision): void {
  if (actual.epoch !== expected.epoch || actual.revision !== expected.revision) throw new PersonalError("stale");
}
export function exportListSnapshot(state: PersonalStore, id: string, expected: Revision): ListSnapshot {
  assertRevision(state.control, expected);
  const record = state.lists.find(list => list.id === id);
  if (!record) throw new PersonalError("stale");
  return listSnapshot(record);
}
export const listNameKey = (name: string) => caseFold(name.normalize("NFC")).normalize("NFC");
export function saveRecord(state: PersonalStore, record: ListRecord, expected: Revision, existing: boolean, confirmDuplicate = false): PersonalStore {
  if (!validList(record)) throw new PersonalError("listInvalid");
  const previous = state.lists.find(list => list.id === record.id);
  if (Boolean(previous) !== existing) throw new PersonalError("invalid");
  const next = nextRevision(state, expected);
  const name = listNameKey(record.name);
  if (!confirmDuplicate && (!previous || previous.name !== record.name) &&
      state.lists.some(list => list.id !== record.id && listNameKey(list.name) === name)) {
    throw new PersonalError("duplicate");
  }
  next.lists = existing ? state.lists.map(list => list.id === record.id ? record : list) : [...state.lists, record];
  validateStore(next);
  return next;
}
