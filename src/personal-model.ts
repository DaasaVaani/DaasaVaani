import Ajv2020 from "ajv/dist/2020";
import legacyRecordSchema from "../shared/schemas/list-record.schema.json";
import recordSchema from "../shared/schemas/list-record-v2.schema.json";
import transferSchema from "../shared/schemas/list-transfer.schema.json";
import transferSchemaV2 from "../shared/schemas/list-transfer-v2.schema.json";
import referenceSchema from "../shared/schemas/personal-reference.schema.json";
import historySchema from "../shared/schemas/recent-history.schema.json";
import type { RecentHistoryV1 } from "../shared/types/personal";
export type { RecentHistoryV1 } from "../shared/types/personal";
import { typedEntry, type ListSnapshot, type ListSnapshotV1, type ListEntryV2, type ListTransferV2, type PersonalReference } from "./list-transfer-types";
import { unicodeNameKey as listNameKey } from "./unicode-names";
export { unicodeNameKey as listNameKey, unicodeNameProfile } from "./unicode-names";

export interface Personal {
  id: "personal"; favorites: PersonalReference[]; language: "en" | "kn"; theme: WebConfig["defaultTheme"];
}
export type ListEntry = ListEntryV2 & { id: string };
export interface ListRecord { id: string; name: string; entries: ListEntry[] }
export interface Revision { epoch: string; revision: number }
export interface Control extends Revision { id: "state"; formatVersion: 5 }
export interface PersonalStore { control: Control; personal?: Personal; lists: ListRecord[]; history: RecentHistoryV1 }
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
type LegacyPersonal = Omit<Personal, "favorites"> & { favorites: string[] };
type LegacyList = Omit<ListRecord, "entries"> & { entries: (ListSnapshotV1["entries"][number] & { id: string })[] };
const validLegacyList = ajv.compile<LegacyList>(legacyRecordSchema);
const validReference = ajv.compile<PersonalReference>(referenceSchema);
const validHistory = ajv.compile<RecentHistoryV1>(historySchema);
const validSnapshotV1 = ajv.compile<ListSnapshotV1>(transferSchema), validSnapshotV2 = ajv.compile<ListTransferV2>(transferSchemaV2);
const validSnapshot = (value: unknown): value is ListSnapshot => validSnapshotV1(value) || validSnapshotV2(value);
const uuid = new RegExp(recordSchema.properties.id.pattern, "u");
const object = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const keys = (value: Record<string, unknown>, expected: string[]) =>
  Object.keys(value).length === expected.length && expected.every(key => Object.hasOwn(value, key));
export function referenceKey(reference: PersonalReference): string {
  return reference.kind === "lyric" ? `lyric:${reference.lyricId}` : `legacyVideo:${reference.videoId}`;
}
export function hasFavorite(personal: Personal, reference: PersonalReference): boolean {
  const key = referenceKey(reference);
  return personal.favorites.some(value => referenceKey(value) === key);
}
export function toggleFavorite(personal: Personal, reference: PersonalReference): Personal {
  const key = referenceKey(reference);
  return { ...personal, favorites: hasFavorite(personal, reference)
    ? personal.favorites.filter(value => referenceKey(value) !== key) : [...personal.favorites, reference] };
}
export function defaultHistory(): RecentHistoryV1 {
  return { enabled: __WEB_CONFIG__.defaultRecentHistoryEnabled, entries: [] };
}
export function validateHistory(value: unknown, limits = __PERSONAL_LIMITS__): asserts value is RecentHistoryV1 {
  if (!object(value) || !Array.isArray(value.entries)) throw new PersonalError("invalid");
  if (value.entries.length > limits.maxRecents) throw new PersonalError("capacity");
  if (Object.keys(value.entries).length !== value.entries.length || !validHistory(value)) throw new PersonalError("invalid");
}
export function promoteRecent(history: RecentHistoryV1, reference: PersonalReference, limits = __PERSONAL_LIMITS__): RecentHistoryV1 {
  validateHistory(history, limits);
  if (!validReference(reference)) throw new PersonalError("invalid");
  const key = referenceKey(reference);
  if (!history.enabled || (history.entries[0] && referenceKey(history.entries[0]) === key)) return history;
  return { ...history, entries: [reference, ...history.entries.filter(value => referenceKey(value) !== key)].slice(0, limits.maxRecents) };
}

export function defaultPersonal(preferredLanguages: readonly string[] = []): Personal {
  for (const tag of preferredLanguages) {
    const language = __WEB_CONFIG__.uiLanguages.find(value => value === tag.split("-")[0]?.toLowerCase());
    if (language) return { id: "personal", favorites: [], language, theme: __WEB_CONFIG__.defaultTheme };
  }
  return { id: "personal", favorites: [], language: __WEB_CONFIG__.defaultUiLanguage, theme: __WEB_CONFIG__.defaultTheme };
}
export function validatePersonal(value: unknown, limits = __PERSONAL_LIMITS__): asserts value is Personal {
  if (!object(value) || !keys(value, ["id", "favorites", "language", "theme"]) || value.id !== "personal" ||
      !Array.isArray(value.favorites) || Object.keys(value.favorites).length !== value.favorites.length ||
      !Array.from(value.favorites).every(value => validReference(value)) ||
      new Set(value.favorites.map(referenceKey)).size !== value.favorites.length ||
      (value.language !== "en" && value.language !== "kn") ||
      (value.theme !== "light" && value.theme !== "dark" && value.theme !== "warm" && value.theme !== "device")) {
    throw new PersonalError("invalid");
  }
  if (value.favorites.length > limits.maxFavorites) throw new PersonalError("capacity");
}
export function newControl(): Control {
  return { id: "state", formatVersion: 5, epoch: crypto.randomUUID(), revision: 0 };
}
function controlRevision(controls: unknown[], version: number): Revision {
  const control = controls[0];
  if (controls.length !== 1 || !object(control) || !keys(control, ["id", "formatVersion", "epoch", "revision"]) ||
      control.id !== "state" || control.formatVersion !== version || typeof control.epoch !== "string" || !uuid.test(control.epoch) ||
      typeof control.revision !== "number" || !Number.isSafeInteger(control.revision) || control.revision < 0) throw new PersonalError("invalid");
  return { epoch: control.epoch, revision: control.revision };
}
function typedContents(personal: unknown[], lists: unknown[]) {
  if (personal.length > 1) throw new PersonalError("invalid");
  const preferences = personal[0];
  if (preferences === undefined && personal.length !== 0) throw new PersonalError("invalid");
  if (preferences !== undefined) validatePersonal(preferences);
  const records: ListRecord[] = [];
  for (const list of lists) {
    if (!validList(list)) throw new PersonalError("invalid");
    records.push(list);
  }
  return { personal: preferences, lists: records };
}
export function parseStore(controls: unknown[], personal: unknown[], lists: unknown[], histories: unknown[]): PersonalStore {
  const control = controlRevision(controls, 5), row = histories[0];
  if (histories.length !== 1 || !object(row) || !keys(row, ["id", "enabled", "entries"]) || row.id !== "history") {
    throw new PersonalError("invalid");
  }
  const history = { enabled: row.enabled, entries: row.entries };
  validateHistory(history);
  const state: PersonalStore = { control: { id: "state", formatVersion: 5, ...control },
    ...typedContents(personal, lists), history };
  validateStore(state);
  return state;
}
export function migrateStoreV4(controls: unknown[], personal: unknown[], lists: unknown[], limits = __PERSONAL_LIMITS__): PersonalStore {
  const old = { control: controlRevision(controls, 4), ...typedContents(personal, lists) };
  validateCollections(old, limits);
  storedBytes(old, 4, limits.maxPersonalStoredBytes);
  const state: PersonalStore = { ...old, control: newControl(), history: defaultHistory() };
  validateStore(state, limits);
  return state;
}
function legacyPreferences(personal: unknown[], version: 1 | 2 | 3, limits: typeof __PERSONAL_LIMITS__): LegacyPersonal | undefined {
  if (personal.length > 1) throw new PersonalError("invalid");
  if (personal.length === 0) return undefined;
  const value = personal[0];
  if (!object(value) || !keys(value, ["id", "favorites", "language", "theme"]) || value.id !== "personal" ||
      !Array.isArray(value.favorites) || Object.keys(value.favorites).length !== value.favorites.length ||
      (value.language !== "en" && value.language !== "kn") ||
      (value.theme !== "light" && value.theme !== "dark" && !(version === 3 && (value.theme === "warm" || value.theme === "device")))) {
    throw new PersonalError("invalid");
  }
  const favorites: string[] = [];
  for (const id of value.favorites) {
    if (typeof id !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(id)) throw new PersonalError("invalid");
    favorites.push(id);
  }
  if (new Set(favorites).size !== favorites.length) throw new PersonalError("invalid");
  if (favorites.length > limits.maxFavorites) throw new PersonalError("capacity");
  return { id: "personal", favorites, language: value.language, theme: value.theme };
}
export function migratePersonalV1(personal: unknown[]): PersonalStore {
  return migrateLegacy([], personal, [], 1);
}
export function migrateStoreV2(controls: unknown[], personal: unknown[], lists: unknown[]): PersonalStore {
  return migrateLegacy(controls, personal, lists, 2);
}
export function migrateStoreV3(controls: unknown[], personal: unknown[], lists: unknown[], limits = __PERSONAL_LIMITS__): PersonalStore {
  return migrateLegacy(controls, personal, lists, 3, limits);
}
function migrateLegacy(controls: unknown[], personal: unknown[], lists: unknown[], version: 1 | 2 | 3,
  limits = __PERSONAL_LIMITS__): PersonalStore {
  const control = version === 1 ? newControl() : controlRevision(controls, version);
  const preferences = legacyPreferences(personal, version, limits), records: LegacyList[] = [];
  for (const list of lists) {
    if (!validLegacyList(list)) throw new PersonalError("invalid");
    jsonBytes({ format: "daasavaani-list", formatVersion: 1, name: list.name, entries: list.entries.map(wireEntry) },
      limits.maxListDecodedBytes);
    records.push(list);
  }
  if (version !== 1) storedBytes({ control, personal: preferences, lists: records }, version, limits.maxPersonalStoredBytes);
  const state: PersonalStore = { control: newControl(), history: defaultHistory(), personal: preferences && { ...preferences,
    favorites: preferences.favorites.map(videoId => ({ kind: "legacyVideo", videoId })) },
    lists: records.map(list => ({ ...list, entries: list.entries.map(entry => ({ ...typedEntry(entry), id: entry.id })) })) };
  validateStore(state, limits);
  return state;
}
function wireEntry(entry: ListSnapshot["entries"][number]): ListSnapshot["entries"][number] {
  if (entry.kind === "placeholder") return { kind: "placeholder", text: entry.text };
  const fallback = entry.fallback === undefined ? {} : { fallback: entry.fallback };
  return entry.kind === "lyric" ? { kind: "lyric", lyricId: entry.lyricId, ...fallback }
    : entry.kind === "item" ? { kind: "item", videoId: entry.videoId, ...fallback }
    : { kind: "legacyVideo", videoId: entry.videoId, ...fallback };
}
export function listSnapshot(record: ListRecord): ListTransferV2 {
  return { format: "daasavaani-list", formatVersion: 2, name: record.name,
    entries: record.entries.map(entry => typedEntry(wireEntry(entry))) };
}
export function newList(snapshot: ListSnapshot, name = snapshot.name): ListRecord {
  if (!validSnapshot(snapshot)) throw new PersonalError("listInvalid");
  const record = { id: crypto.randomUUID(), name, entries: snapshot.entries.map(entry => ({ ...typedEntry(entry), id: crypto.randomUUID() })) };
  if (!validList(record)) throw new PersonalError("listInvalid");
  return record;
}
function entryIndex(record: ListRecord, id: string): number {
  const index = record.entries.findIndex(entry => entry.id === id);
  if (index < 0) throw new PersonalError("stale");
  return index;
}
export function editEntry(record: ListRecord, id: string | undefined, value: ListEntryV2): ListRecord {
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
  return storedBytes(state, 5, limit, state.history);
}
function storedBytes(state: { control: Revision; personal?: Personal | LegacyPersonal; lists: (ListRecord | LegacyList)[] },
  version: number, limit: number, history?: RecentHistoryV1): number {
  const personal = state.personal;
  return jsonBytes({
    format: version >= 4 ? "daasavaani-personal-storage" : "fixture-personal-storage", formatVersion: version,
    control: { id: "state", formatVersion: version, epoch: state.control.epoch, revision: state.control.revision },
    personal: personal ? [{ id: "personal", favorites: personal.favorites.map(reference => typeof reference === "string" ? reference
      : reference.kind === "lyric" ? { kind: "lyric", lyricId: reference.lyricId } : { kind: "legacyVideo", videoId: reference.videoId }),
      language: personal.language, theme: personal.theme }] : [],
    lists: [...state.lists].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0).map(list => ({
      id: list.id, name: list.name, entries: list.entries.map(entry => ({ id: entry.id, ...wireEntry(entry) })),
    })),
    ...(history ? { recentHistory: [{ id: "history", enabled: history.enabled, entries: history.entries.map(reference =>
      reference.kind === "lyric" ? { kind: "lyric", lyricId: reference.lyricId } : { kind: "legacyVideo", videoId: reference.videoId }) }] } : {}),
  }, limit);
}
function validateCollections(state: Pick<PersonalStore, "personal" | "lists">, limits: PersonalLimits): void {
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
}
export function validateStore(state: PersonalStore, limits = __PERSONAL_LIMITS__): void {
  validateCollections(state, limits);
  validateHistory(state.history, limits);
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
