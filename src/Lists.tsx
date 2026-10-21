import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type messages from "../shared/generated/web/ui.json";
import { deleteList, saveList } from "./personal";
import { editEntry, listSnapshot, moveEntry, newList, removeEntry, type ListEntry, type ListRecord, type PersonalStore, type Revision } from "./personal-model";
import { listNameHint, personalMessage, useListSave } from "./ListSave";
import styles from "./App.module.css";
import { ListExport, type ExportSource } from "./ListExport";
import type { Publication } from "./artifacts";
import { ListEntryView } from "./ListEntryView";

interface EntryDraft { id?: string; kind: "item" | "placeholder"; videoId: string; text: string; fallback: string }

export function Lists({ labels, personal, publication }: { labels: typeof messages.en; personal: PersonalStore; publication?: Publication }) {
  const id = useId();
  const [name, setName] = useState("");
  const [newName, setNewName] = useState("");
  const [selected, setSelected] = useState<{ record: ListRecord; expected: Revision }>();
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [editor, setEditor] = useState<EntryDraft>();
  const [entrySaved, setEntrySaved] = useState(false);
  const [exportBusy, setExportBusy] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const entryGroups = useRef(new Map<string, HTMLDivElement>());
  const focus = useRef<string | null | undefined>(undefined);
  const save = useListSave(labels, () => { focus.current = null; setSelected(undefined); });
  const working = busy || save.busy || exportBusy;
  const source = useMemo<ExportSource | undefined>(() => selected
    ? { kind: "stored", id: selected.record.id, expected: selected.expected } : undefined, [selected]);
  useLayoutEffect(() => {
    if (focus.current !== undefined) {
      (focus.current === null ? heading.current : entryGroups.current.get(focus.current) ?? heading.current)?.focus();
      focus.current = undefined;
    }
  }, [selected, editor]);
  function choose(record: ListRecord) {
    save.reset(); setError(""); setDeleting(false);
    setEditor(undefined); setEntrySaved(false);
    setSelected({ record, expected: personal.control }); setName(record.name);
  }
  function startEntry(kind: EntryDraft["kind"], entry?: ListEntry) {
    save.reset(); setError(""); setDeleting(false); setEntrySaved(false);
    setEditor({ id: entry?.id, kind, videoId: entry?.kind === "item" ? entry.videoId : "",
      text: entry?.kind === "placeholder" ? entry.text : "",
      fallback: entry?.kind === "item" ? entry.fallback ?? "" : entry?.text ?? "" });
  }
  async function mutate(make: (record: ListRecord) => ListRecord, focusId?: string) {
    if (!selected) return;
    setBusy(true); setError(""); setEntrySaved(false); save.reset(); setDeleting(false);
    try {
      const record = make(selected.record);
      const expected = await saveList(record, selected.expected, true);
      focus.current = focusId ?? record.entries.at(-1)?.id ?? null;
      setSelected({ record, expected }); setEditor(undefined); setEntrySaved(true);
    } catch (reason) { setError(personalMessage(reason, labels)); }
    finally { setBusy(false); }
  }
  async function remove() {
    if (!selected) return;
    setBusy(true); setError("");
    try { await deleteList(selected.record.id, selected.expected); focus.current = null; setSelected(undefined); setDeleting(false); }
    catch (reason) { setError(personalMessage(reason, labels)); setDeleting(false); }
    finally { setBusy(false); }
  }
  return <section className={styles.reader}><h1 ref={heading} tabIndex={-1}>{labels.lists}</h1>
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
      <p>{labels.catalogNotice}</p>
      {!selected.record.entries.length ? <p>{labels.transferEmpty}</p> : <ol>
        {selected.record.entries.map((entry, index) => <li key={entry.id}>
          <ListEntryView entry={entry} labels={labels} publication={publication} readable />
          <div role="group" tabIndex={-1} ref={element => {
            if (element) entryGroups.current.set(entry.id, element);
            else entryGroups.current.delete(entry.id);
          }} aria-label={labels.entryNumber.replace("{position}", String(index + 1)).replace("{total}", String(selected.record.entries.length))}>
            <button disabled={working} onClick={() => startEntry(entry.kind, entry)}>{labels.editEntry}</button>
            {entry.kind === "placeholder" && <button disabled={working} onClick={() => startEntry("item", entry)}>{labels.replaceEntry}</button>}
            <button disabled={working || index === 0} onClick={() => void mutate(record => moveEntry(record, entry.id, -1), entry.id)}>{labels.moveUp}</button>
            <button disabled={working || index === selected.record.entries.length - 1} onClick={() => void mutate(record => moveEntry(record, entry.id, 1), entry.id)}>{labels.moveDown}</button>
            <button disabled={working} onClick={() => void mutate(record => removeEntry(record, entry.id),
              selected.record.entries[index + 1]?.id ?? selected.record.entries[index - 1]?.id)}>{labels.removeEntry}</button>
          </div>
        </li>)}
      </ol>}
      <button disabled={working} onClick={() => startEntry("item")}>{labels.addReference}</button>
      <button disabled={working} onClick={() => startEntry("placeholder")}>{labels.addPlaceholder}</button>
      {editor && <form aria-label={labels.editEntry} onSubmit={event => {
        event.preventDefault();
        const value = editor.kind === "placeholder" ? { kind: "placeholder" as const, text: editor.text }
          : { kind: "item" as const, videoId: editor.videoId, ...(editor.fallback === "" ? {} : { fallback: editor.fallback }) };
        void mutate(record => editEntry(record, editor.id, value), editor.id);
      }}>
        <p id={`${id}-entry-hint`}>{labels.entryTextHint.replace("{limit}", String(__PERSONAL_LIMITS__.maxEntryTextCodePoints))}</p>
        {editor.kind === "placeholder" ? <>
          <label htmlFor={`${id}-text`}>{labels.placeholderText}</label>
          <input id={`${id}-text`} value={editor.text} disabled={working} aria-describedby={`${id}-entry-hint`}
            onChange={event => setEditor({ ...editor, text: event.target.value })} />
        </> : <>
          <label htmlFor={`${id}-video`}>{labels.videoId}</label>
          <input id={`${id}-video`} value={editor.videoId} disabled={working}
            onChange={event => setEditor({ ...editor, videoId: event.target.value })} />
          <label htmlFor={`${id}-fallback`}>{labels.fallbackLabel}</label>
          <input id={`${id}-fallback`} value={editor.fallback} disabled={working} aria-describedby={`${id}-entry-hint`}
            onChange={event => setEditor({ ...editor, fallback: event.target.value })} />
        </>}
        <button disabled={working} type="submit">{labels.saveEntry}</button>
        <button disabled={working} type="button" onClick={() => { focus.current = editor.id ?? null; setEditor(undefined); }}>{labels.cancel}</button>
      </form>}
      <button disabled={working} onClick={() => void save.run(() => newList(listSnapshot(selected.record), name), selected.expected)}>{labels.duplicateList}</button>
      <p>{labels.transferNotice}</p>
      {source && <ListExport source={source} labels={labels} disabled={busy || save.busy} onBusyChange={setExportBusy} onStart={save.reset} />}
      <button disabled={working} onClick={() => { save.reset(); setEditor(undefined); setEntrySaved(false); setDeleting(true); }}>{labels.deleteList}</button>
      {deleting && <section aria-label={labels.deleteNotice}><p>{labels.deleteNotice}</p>
        <button disabled={working} onClick={() => void remove()}>{labels.confirmDelete}</button>
        <button disabled={working} onClick={() => setDeleting(false)}>{labels.cancel}</button>
      </section>}
    </section>}
    {save.feedback}
    {entrySaved && <p role="status">{labels.listUpdated}</p>}
    {error && <p role="alert">{error}</p>}
  </section>;
}
