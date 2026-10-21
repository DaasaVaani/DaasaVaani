import { useId, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type messages from "../shared/generated/web/ui.json";
import { editEntry, type ListRecord, type PersonalStore, type Revision } from "./personal-model";
import { saveList } from "./personal";
import { personalMessage } from "./ListSave";

export function AddToList({ labels, personal, videoId }: {
  labels: typeof messages.en; personal: PersonalStore; videoId: string;
}) {
  const id = useId();
  const [selected, setSelected] = useState<{ record: ListRecord; expected: Revision }>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const choice = useRef<HTMLSelectElement>(null), focus = useRef(false);
  useLayoutEffect(() => {
    if (!busy && focus.current) { choice.current?.focus(); focus.current = false; }
  }, [busy]);
  async function add() {
    if (!selected) return;
    setBusy(true); setError(""); setSaved(false);
    try {
      await saveList(editEntry(selected.record, undefined, { kind: "item", videoId }), selected.expected, true);
      setSelected(undefined); setSaved(true);
    } catch (reason) { setError(personalMessage(reason, labels)); setSelected(undefined); }
    finally { focus.current = true; setBusy(false); }
  }
  return <section aria-labelledby={`${id}-title`}>
    <h2 id={`${id}-title`}>{labels.addToList}</h2>
    {!personal.lists.length ? <p>{labels.noListsForItem} <Link to="/lists">{labels.lists}</Link></p> : <form
      aria-label={labels.addToList} onSubmit={event => { event.preventDefault(); void add(); }}>
      <label htmlFor={`${id}-choice`}>{labels.chooseList}</label>
      <select ref={choice} id={`${id}-choice`} value={selected?.record.id ?? ""} disabled={busy}
        onChange={event => {
          const record = personal.lists.find(list => list.id === event.currentTarget.value);
          setSelected(record ? { record, expected: personal.control } : undefined); setError(""); setSaved(false);
        }}>
        <option value="">{labels.chooseList}</option>
        {personal.lists.map(list => <option key={list.id} value={list.id}>{list.name} · {list.id}</option>)}
      </select>
      <button disabled={busy || !selected} type="submit">{labels.addOccurrence}</button>
    </form>}
    {error && <p role="alert">{error}</p>}
    {saved && <p role="status">{labels.occurrenceAdded}</p>}
  </section>;
}
