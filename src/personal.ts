import Dexie, { liveQuery, type Transaction } from "dexie";
import {
  defaultPersonal, exportListSnapshot, newControl, nextRevision, parseStore, PersonalError, saveRecord, validatePersonal, validateStore,
  type ListRecord, type Personal, type PersonalStore, type Revision,
} from "./personal-model";
export type { Personal, PersonalStore } from "./personal-model";

const db = new Dexie(__WEB_CONFIG__.databaseName);
db.version(1).stores({ personal: "id" });
db.version(2).stores({ personal: "id", lists: "id", control: "id" });
const nativeVersion = 20;
const newerSchema = () => new Error("A newer personal database schema is present. Use a compatible app; existing data was not changed.");
function inspectNative(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(__WEB_CONFIG__.databaseName, nativeVersion);
    let upgradeFailure: unknown;
    let stopped = false;
    request.onblocked = () => {
      stopped = true;
      upgradeFailure = new Error("Personal database upgrade is blocked. Close other DaasaVaani tabs and try again; do not delete your data.");
      reject(upgradeFailure);
    };
    request.onupgradeneeded = event => {
      const transaction = request.transaction, database = request.result;
      if (!transaction) { reject(new PersonalError("invalid")); return; }
      const abort = (reason: unknown) => { upgradeFailure = reason; transaction.abort(); };
      if (stopped) { transaction.abort(); return; }
      if (event.oldVersion !== 0 && event.oldVersion !== 10) { abort(new PersonalError("invalid")); return; }
      function initialize(legacy: unknown[]) {
        try {
          const header = newControl();
          parseStore([header], legacy, []);
          if (event.oldVersion === 0) database.createObjectStore("personal", { keyPath: "id" });
          database.createObjectStore("lists", { keyPath: "id" });
          database.createObjectStore("control", { keyPath: "id" }).put(header);
        } catch (reason) { abort(reason); }
      }
      if (event.oldVersion === 0) initialize([]);
      else {
        const names = [...database.objectStoreNames];
        if (names.length !== 1 || names[0] !== "personal") { abort(new PersonalError("invalid")); return; }
        const store = transaction.objectStore("personal");
        if (store.keyPath !== "id" || store.autoIncrement || store.indexNames.length) { abort(new PersonalError("invalid")); return; }
        const legacy = store.getAll();
        legacy.onsuccess = () => initialize(legacy.result);
        legacy.onerror = () => abort(legacy.error);
      }
    };
    request.onerror = () => {
      reject(upgradeFailure ?? (request.error?.name === "VersionError" ? newerSchema() : request.error));
    };
    request.onsuccess = () => {
      const database = request.result;
      if (stopped) { database.close(); return; }
      const expected = ["control", "lists", "personal"];
      const stores = [...database.objectStoreNames];
      if (database.version !== nativeVersion || stores.length !== expected.length || expected.some(name => !stores.includes(name))) {
        database.close(); reject(new PersonalError("invalid")); return;
      }
      const transaction = database.transaction(stores);
      if (stores.some(name => {
        const store = transaction.objectStore(name);
        return store.keyPath !== "id" || store.autoIncrement || store.indexNames.length !== 0;
      })) { database.close(); reject(new PersonalError("invalid")); return; }
      resolve(database);
    };
  });
}
async function ready(): Promise<void> {
  const guard = await inspectNative();
  return new Promise((resolve, reject) => {
    function release() { guard?.close(); db.on.blocked.unsubscribe(blocked); }
    const blocked = () => {
      release();
      reject(new Error("Personal database upgrade is blocked. Close other DaasaVaani tabs and try again; do not delete your data."));
    };
    guard.onversionchange = event => {
      db.close(); release();
      reject(event.newVersion !== null && event.newVersion > nativeVersion ? newerSchema() : new PersonalError("stale"));
    };
    db.on("blocked", blocked);
    // Dexie otherwise retries VersionError against the newer schema and may patch it.
    db.open().then(() => {
      if (db.backendDB().version !== nativeVersion) { db.close(); release(); reject(newerSchema()); return; }
      release(); resolve();
    },
      reason => {
        release();
        reject(reason instanceof Error && reason.name === "VersionError" ? newerSchema() : reason);
      });
  });
}
const personal = db.table<unknown, string>("personal");
const lists = db.table<unknown, string>("lists");
const control = db.table<unknown, string>("control");
async function stored(transaction: Transaction): Promise<PersonalStore> {
  const [headers, preferences, records] = await Promise.all([
    transaction.table("control").toArray(), transaction.table("personal").toArray(), transaction.table("lists").toArray(),
  ]);
  return parseStore(headers, preferences, records);
}
export async function readStore(): Promise<PersonalStore> {
  await ready();
  return db.transaction("r", personal, lists, control, stored);
}
export async function readListSnapshot(id: string, expected: Revision) {
  return exportListSnapshot(await readStore(), id, expected);
}
export function watchPersonal(next: (state: PersonalStore) => void, error: (reason: unknown) => void): () => void {
  const subscription = liveQuery(readStore).subscribe({ next, error });
  return () => subscription.unsubscribe();
}
export async function readPersonal(): Promise<Personal> {
  return (await readStore()).personal ?? defaultPersonal();
}
export async function updatePersonal(change: (value: Personal) => Personal): Promise<Personal> {
  await ready();
  return db.transaction("rw", personal, lists, control, async transaction => {
    const state = await stored(transaction);
    const value = change(state.personal ?? defaultPersonal());
    validatePersonal(value);
    const next = { ...nextRevision(state, state.control), personal: value };
    validateStore(next);
    await personal.put(value);
    await control.put(next.control);
    return value;
  });
}
export async function saveList(record: ListRecord, expected: Revision, existing = false, confirmDuplicate = false): Promise<Revision> {
  await ready();
  return db.transaction("rw", personal, lists, control, async transaction => {
    const next = saveRecord(await stored(transaction), record, expected, existing, confirmDuplicate);
    await lists.put(record);
    await control.put(next.control);
    return next.control;
  });
}
export async function deleteList(id: string, expected: Revision): Promise<void> {
  await ready();
  return db.transaction("rw", personal, lists, control, async transaction => {
    const state = await stored(transaction);
    if (!state.lists.some(list => list.id === id)) throw new PersonalError("stale");
    const next = { ...nextRevision(state, expected), lists: state.lists.filter(list => list.id !== id) };
    validateStore(next);
    await lists.delete(id);
    await control.put(next.control);
  });
}
