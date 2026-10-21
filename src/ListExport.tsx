import { useEffect, useId, useRef, useState } from "react";
import type messages from "../shared/generated/web/ui.json";
import { readListSnapshot } from "./personal";
import { PersonalError, type Revision } from "./personal-model";
import { personalMessage } from "./ListSave";
import { transfer } from "./list-transfer-client";
import { TransferError, type ListSnapshot, type TransferErrorCode } from "./list-transfer-types";
import styles from "./App.module.css";

type Labels = typeof messages.en;
export type ExportSource = { kind: "preview"; snapshot: ListSnapshot } | { kind: "stored"; id: string; expected: Revision };
export const transferMessage = (error: TransferErrorCode | undefined, labels: Labels) =>
  error === "invalid" ? labels.transferInvalid : error === "linkLimit" ? labels.transferLinkTooLong
    : error === "encodedLimit" || error === "decodedLimit" ? labels.transferTooLarge : labels.transferFailed;

export function ListExport({ source, labels, disabled, onBusyChange, onStart }: {
  source: ExportSource; labels: Labels; disabled: boolean; onBusyChange: (busy: boolean) => void; onStart: () => void;
}) {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [link, setLink] = useState("");
  const controller = useRef<AbortController | null>(null);
  useEffect(() => {
    controller.current?.abort(); setBusy(false); onBusyChange(false);
    setError(""); setFileUrl(""); setLink("");
    return () => { controller.current?.abort(); onBusyChange(false); };
  }, [source, onBusyChange]);
  useEffect(() => () => { if (fileUrl) URL.revokeObjectURL(fileUrl); }, [fileUrl]);
  async function run(kind: "encodeFile" | "encodeLink") {
    onStart();
    controller.current?.abort();
    const current = new AbortController(); controller.current = current;
    setBusy(true); onBusyChange(true); setError(""); setFileUrl(""); setLink("");
    try {
      const snapshot = source.kind === "preview" ? source.snapshot : await readListSnapshot(source.id, source.expected);
      if (current.signal.aborted) return;
      const result = await transfer({ kind, snapshot }, current.signal);
      if (current.signal.aborted) return;
      if (source.kind === "stored") await readListSnapshot(source.id, source.expected);
      if (current.signal.aborted) return;
      if (kind === "encodeFile" && result.kind === "file") {
        setFileUrl(URL.createObjectURL(new Blob([new Uint8Array(result.bytes)], { type: "application/gzip" })));
      } else if (kind === "encodeLink" && result.kind === "link") setLink(result.link);
      else throw new TransferError("failed");
    } catch (reason) {
      if (!current.signal.aborted) setError(reason instanceof TransferError ? transferMessage(reason.code, labels)
        : reason instanceof PersonalError || source.kind === "stored" ? personalMessage(reason, labels) : labels.transferFailed);
    } finally { if (!current.signal.aborted) { setBusy(false); onBusyChange(false); } }
  }
  return <div>
    <button disabled={disabled || busy} onClick={() => void run("encodeFile")}>{labels.transferDownload}</button>
    <button disabled={disabled || busy} onClick={() => void run("encodeLink")}>{labels.transferCreateLink}</button>
    {busy && <><p role="status">{labels.transferWorking}</p>
      <button onClick={() => { controller.current?.abort(); setBusy(false); onBusyChange(false); }}>{labels.cancel}</button></>}
    {error && <p role="alert" className={styles.error}>{error}</p>}
    {fileUrl && <p><a href={fileUrl} download={__WEB_CONFIG__.listFileName}>{labels.transferDownload}</a></p>}
    {link && <><label htmlFor={`${id}-export`}>{labels.transferLink}</label>
      <input id={`${id}-export`} value={link} readOnly onFocus={event => event.currentTarget.select()} /></>}
  </div>;
}
