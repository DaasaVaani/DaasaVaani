import { useId, useState } from "react";
import type messages from "../shared/generated/web/ui.json";
import { deleteList } from "./personal";
import { listSnapshot, newList, type ListRecord, type PersonalStore, type Revision } from "./personal-model";
import { listNameHint, personalMessage, useListSave } from "./ListSave";
import styles from "./App.module.css";

export function Lists({ labels, personal }: { labels: typeof messages.en; personal: PersonalStore }) {
  const id = useId();
  const [name, setName] = useState("");
  const [newName, setNewName] = useState("");
  const [selected, setSelected] = useState<{ record: ListRecord; expected: Revision }>();
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const save = useListSave(labels, () => setSelected(undefined));
  const working = busy || save.busy;
  function choose(record: ListRecord) {
    save.reset(); setError(""); setDeleting(false);
    setSelected({ record, expected: personal.control }); setName(record.name);
  }
  async function remove() {
    if (!selected) return;
    setBusy(true); setError("");
    try { await deleteList(selected.record.id, selected.expected); setSelected(undefined); setDeleting(false); }
    catch (reason) { setError(personalMessage(reason, labels)); setDeleting(false); }
    finally { setBusy(false); }
  }
  return <section className={styles.reader}><h1>{labels.lists}</h1>
    {!personal.lists.length && <p>{labels.emptyLists}</p>}
    <form aria-label={labels.createList} onSubmit={event => {
      event.preventDefault();
      void save.run(() => newList({ format: "daasavaani-list", formatVersion: 1, name: newName, entries: [] }), personal.control);
    }}>
      <label htmlFor={`${id}-name`}>{labels.listName}</label>
      <p id={`${id}-hint`}>{listNameHint(labels)}</p>
      <input id={`${id}-name`} value={newName} disabled={working} aria-describedby={`${id}-hint`}
        onChange={event => { setNewName(event.target.value); save.reset(); setDeleting(false); }} />
      <button disabled={working} type="submit">{labels.createList}</button>
    </form>
    <ul aria-label={labels.lists}>{personal.lists.map(record => <li key={record.id}>
      <button className={styles.secondary} disabled={working} onClick={() => choose(record)}>{record.name}</button>
    </li>)}</ul>
    {selected && <section aria-label={selected.record.name}>
      <h2>{selected.record.name}</h2>
      <form aria-label={labels.renameList} onSubmit={event => {
        event.preventDefault();
        void save.run(() => ({ ...selected.record, name }), selected.expected, true);
      }}>
        <label htmlFor={`${id}-edit`}>{labels.listName}</label>
        <p id={`${id}-edit-hint`}>{listNameHint(labels)}</p>
        <input id={`${id}-edit`} value={name} disabled={working} aria-describedby={`${id}-edit-hint`}
          onChange={event => { setName(event.target.value); save.reset(); setDeleting(false); }} />
        <button disabled={working} type="submit">{labels.renameList}</button>
      </form>
      <p>{labels.transferUnresolved}</p>
      {!selected.record.entries.length ? <p>{labels.transferEmpty}</p> : <ol>
        {selected.record.entries.map(entry => <li key={entry.id}>
          <span>{entry.kind === "item" ? labels.transferReference : labels.transferPlaceholder}: </span>
          {entry.kind === "item" ? <><code>{entry.videoId}</code>{entry.fallback !== undefined && <p>{entry.fallback}</p>}</>
            : <span>{entry.text}</span>}
        </li>)}
      </ol>}
      <button disabled={working} onClick={() => void save.run(() => newList(listSnapshot(selected.record), name), selected.expected)}>{labels.duplicateList}</button>
      <button disabled={working} onClick={() => { save.reset(); setDeleting(true); }}>{labels.deleteList}</button>
      {deleting && <section aria-label={labels.deleteNotice}><p>{labels.deleteNotice}</p>
        <button disabled={working} onClick={() => void remove()}>{labels.confirmDelete}</button>
        <button disabled={working} onClick={() => setDeleting(false)}>{labels.cancel}</button>
      </section>}
    </section>}
    {save.feedback}
    {error && <p role="alert">{error}</p>}
  </section>;
}
