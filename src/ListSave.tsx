import { useState } from "react";
import type messages from "../shared/generated/web/ui.json";
import { saveList } from "./personal";
import { PersonalError, type ListRecord, type Revision } from "./personal-model";

type Labels = typeof messages.en;
export const listNameHint = (labels: Labels) => labels.listNameHint.replace("{limit}", String(__PERSONAL_LIMITS__.maxListNameCodePoints));
export const personalMessage = (reason: unknown, labels: Labels) =>
  reason instanceof PersonalError
    ? reason.code === "invalid" ? labels.personalInvalid
      : reason.code === "listInvalid" ? labels.listInvalid
      : reason.code === "capacity" ? labels.personalCapacity
      : reason.code === "stale" ? labels.personalStale : labels.duplicateName
    : labels.personalFailed;

export function useListSave(labels: Labels, onSaved?: (record: ListRecord) => void) {
  const [pending, setPending] = useState<{ record: ListRecord; expected: Revision; existing: boolean }>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  function reset() { setPending(undefined); setError(""); setSaved(false); }
  async function run(make: () => ListRecord, expected: Revision, existing = false, confirmed = false) {
    reset(); setBusy(true);
    try {
      const record = make();
      try { await saveList(record, expected, existing, confirmed); }
      catch (reason) {
        if (reason instanceof PersonalError && reason.code === "duplicate" && !confirmed) {
          setPending({ record, expected, existing }); return;
        }
        throw reason;
      }
      setSaved(true); onSaved?.(record);
    } catch (reason) { setError(personalMessage(reason, labels)); }
    finally { setBusy(false); }
  }
  const feedback = <>
    {error && <p role="alert">{error}</p>}
    {saved && <p role="status">{labels.listSaved}</p>}
    {pending && <section aria-label={labels.duplicateName}>
      <p>{labels.duplicateName}</p>
      <button disabled={busy} onClick={() => void run(() => pending.record, pending.expected, pending.existing, true)}>{labels.confirmDuplicate}</button>
      <button disabled={busy} onClick={reset}>{labels.cancel}</button>
    </section>}
  </>;
  return { run, reset, busy, saved, feedback };
}
