import { useEffect, useId, useRef, useState } from "react";
import type messages from "../shared/generated/web/ui.json";
import { transfer } from "./list-transfer-client";
import { TransferError, type ListSnapshot, type TransferErrorCode } from "./list-transfer-types";
import type { TransferRequest } from "./list-transfer.worker";
import styles from "./App.module.css";
import { Link } from "react-router-dom";
import { newList, type PersonalStore } from "./personal-model";
import { listNameHint, useListSave } from "./ListSave";

export function ListPreview({ labels, initialLink, personal }: { labels: typeof messages.en; initialLink?: string; personal?: PersonalStore }) {
  const id = useId();
  const [link, setLink] = useState("");
  const [snapshot, setSnapshot] = useState<ListSnapshot>();
  const [fileUrl, setFileUrl] = useState("");
  const [exportLink, setExportLink] = useState("");
  const [error, setError] = useState<TransferErrorCode>();
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const save = useListSave(labels);
  const working = busy || save.busy;
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => () => { if (fileUrl) URL.revokeObjectURL(fileUrl); }, [fileUrl]);
  async function run(request: TransferRequest) {
    save.reset();
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    setBusy(true); setError(undefined); setFileUrl(""); setExportLink("");
    if (request.kind === "decodeFile" || request.kind === "decodeLink") setSnapshot(undefined);
    try {
      const result = await transfer(request, current.signal);
      if (current.signal.aborted) return;
      if (result.kind === "snapshot") { setSnapshot(result.snapshot); setName(result.snapshot.name); }
      else if (result.kind === "link") setExportLink(result.link);
      else setFileUrl(URL.createObjectURL(new Blob([new Uint8Array(result.bytes)], { type: "application/gzip" })));
    } catch (reason) {
      if (!current.signal.aborted) setError(reason instanceof TransferError ? reason.code : "failed");
    } finally { if (!current.signal.aborted) setBusy(false); }
  }
  useEffect(() => {
    if (initialLink) void run({ kind: "decodeLink", link: initialLink });
  }, [initialLink]);
  const errorLabel = error === "invalid" ? labels.transferInvalid
    : error === "linkLimit" ? labels.transferLinkTooLong
    : error === "encodedLimit" || error === "decodedLimit" ? labels.transferTooLarge : labels.transferFailed;
  return <section aria-labelledby={`${id}-title`}>
    <h2 id={`${id}-title`}>{labels.transferTitle}</h2>
    <p>{labels.transferNotice}</p>
    <label htmlFor={`${id}-file`}>{labels.transferFile}</label>
    <input id={`${id}-file`} type="file" accept=".gz,application/gzip" disabled={working}
      onChange={event => {
        const file = event.currentTarget.files?.[0];
        event.currentTarget.value = "";
        if (file) void run({ kind: "decodeFile", file });
      }} />
    <form onSubmit={event => { event.preventDefault(); void run({ kind: "decodeLink", link }); }}>
      <label htmlFor={`${id}-link`}>{labels.transferLink}</label>
      <input id={`${id}-link`} type="text" value={link} disabled={working} autoComplete="off" spellCheck={false}
        onChange={event => setLink(event.target.value)} />
      <button disabled={working} type="submit">{labels.transferPreview}</button>
    </form>
    {busy && <><p role="status">{labels.transferWorking}</p>
      <button onClick={() => { controller.current?.abort(); setBusy(false); }}>{labels.cancel}</button></>}
    {error && <p role="alert" className={styles.error}>{errorLabel}</p>}
    {snapshot && <div aria-label={labels.transferTitle}>
      <h3>{snapshot.name}</h3><p>{labels.transferUnresolved}</p>
      {!snapshot.entries.length ? <p>{labels.transferEmpty}</p> : <ol>
        {snapshot.entries.map((entry, position) => <li key={position}>
          <span>{entry.kind === "item" ? labels.transferReference : labels.transferPlaceholder}: </span>
          {entry.kind === "item" ? <><code>{entry.videoId}</code>{entry.fallback !== undefined && <p>{entry.fallback}</p>}</>
            : <span>{entry.text}</span>}
        </li>)}
      </ol>}
      <button disabled={working} onClick={() => void run({ kind: "encodeFile", snapshot })}>{labels.transferDownload}</button>
      <button disabled={working} onClick={() => void run({ kind: "encodeLink", snapshot })}>{labels.transferCreateLink}</button>
      <form onSubmit={event => {
        event.preventDefault();
        if (personal) void save.run(() => newList(snapshot, name), personal.control);
      }}>
        <label htmlFor={`${id}-name`}>{labels.listName}</label>
        <p id={`${id}-name-hint`}>{listNameHint(labels)}</p>
        <input id={`${id}-name`} value={name} disabled={working} aria-describedby={`${id}-name-hint`}
          onChange={event => { setName(event.target.value); save.reset(); }} />
        <button type="submit" disabled={working || !personal}>{labels.saveList}</button>
        {!personal && <p role="status">{labels.personalUnavailable}</p>}
      </form>
      {save.feedback}
      {save.saved && <p><Link to="/lists">{labels.viewLists}</Link></p>}
      {fileUrl && <p><a href={fileUrl} download={__WEB_CONFIG__.listFileName}>{labels.transferDownload}</a></p>}
      {exportLink && <><label htmlFor={`${id}-export`}>{labels.transferLink}</label>
        <input id={`${id}-export`} value={exportLink} readOnly onFocus={event => event.currentTarget.select()} /></>}
    </div>}
  </section>;
}
