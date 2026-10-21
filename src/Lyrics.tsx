import { useEffect, useId, useRef, useState } from "react";
import { Link, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import messages from "../shared/generated/web/ui.json";
import { prepareLyrics, type PreparedLyrics } from "./lyric-publication";
import styles from "./App.module.css";

type Labels = typeof messages.en;
function LyricReader({ publication, labels }: { publication: PreparedLyrics; labels: Labels }) {
  const { id } = useParams();
  const location = useLocation(), navigate = useNavigate();
  const state: unknown = location.state;
  const fromCatalog = state !== null && typeof state === "object" && "browseFrom" in state && state.browseFrom === "/lyrics";
  const item = id ? publication.item(id) : undefined;
  return <section className={styles.reader}>
    <Link to="/lyrics" className={styles.back} onClick={event => {
      if (fromCatalog && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
        event.preventDefault(); navigate(-1);
      }
    }}>← {labels.lyricBack}</Link>
    {!item ? <p role="alert">{labels.lyricsUnavailable}</p> : <>
      <h1 lang="kn">{item.title}</h1>
      <div lang="kn" className={styles.lyrics}>{item.lines.map((line, index) =>
        <p key={line.kind === "line" ? line.lineId : `layout-${index}`}
          {...(line.kind === "line" ? { id: line.lineId } : { "data-layout": true })}>{line.text || <br />}</p>)}</div>
      <p className={styles.muted}>{labels.lyricNoMedia}</p>
    </>}
  </section>;
}
export function Lyrics({ labels }: { labels: Labels }) {
  const location = useLocation();
  const active = /^\/lyrics(?:\/|$)/u.test(location.pathname);
  const catalogActive = /^\/lyrics\/?$/u.test(location.pathname);
  const [publication, setPublication] = useState<PreparedLyrics>();
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [progress, setProgress] = useState<{ done: number; total: number }>();
  const [query, setQuery] = useState(""), [pages, setPages] = useState(1);
  const controller = useRef<AbortController | null>(null), nextFocus = useRef<string | undefined>(undefined);
  const resultsId = useId();
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => { setPages(1); nextFocus.current = undefined; }, [query]);
  useEffect(() => {
    const id = nextFocus.current;
    if (!id) return;
    nextFocus.current = undefined;
    const frame = requestAnimationFrame(() => document.getElementById(`lyric-read-${id}`)?.focus());
    return () => cancelAnimationFrame(frame);
  }, [pages]);
  function prepare() {
    const request = new AbortController();
    controller.current?.abort(); controller.current = request;
    setBusy(true); setError(""); setProgress(undefined);
    void prepareLyrics(request.signal, (done, total) => {
      if (controller.current === request && !request.signal.aborted) setProgress({ done, total });
    }).then(value => {
      if (controller.current === request && !request.signal.aborted) setPublication(value);
    }).catch(reason => {
      if (controller.current === request && !request.signal.aborted) setError(reason instanceof Error ? reason.message : String(reason));
    }).finally(() => {
      if (controller.current === request) { controller.current = null; setBusy(false); setProgress(undefined); }
    });
  }
  const entries = publication?.catalog.filter(entry => entry.title.includes(query)) ?? [];
  const shown = entries.slice(0, pages * __WEB_CONFIG__.lyricPreview.pageSize);
  return <section hidden={!active}>
    <aside className={styles.notice}><p>{labels.lyricPreviewNotice}</p><p>{labels.lyricPreviewLimits}</p></aside>
    {!publication && <section className={styles.reader}>
      <h1>{labels.ownerLyrics}</h1>
      {error && <p className={styles.error} role="alert">{labels.error}: {error}</p>}
      {busy ? <><p role="status">{labels.loading} {progress && `${progress.done} / ${progress.total}`}</p>
        <button onClick={() => { controller.current?.abort(); controller.current = null; setBusy(false); setProgress(undefined); }}>{labels.cancel}</button></>
        : <button onClick={prepare}>{error ? labels.retry : labels.prepareLibrary}</button>}
    </section>}
    {publication && <>
      <div hidden={!catalogActive}>
        <section className={styles.hero}><h1>{labels.ownerLyrics}<span className={styles.count}>{publication.catalog.length}</span></h1>
          <label>{labels.lyricTitleFilter}<input type="search" value={query} onChange={event => setQuery(event.target.value)} /></label>
        </section>
        <section id={resultsId} className={styles.grid} aria-label={labels.ownerLyrics}>
          {shown.map(entry => <article className={styles.card} key={entry.lyricId}>
            <h2 lang="kn">{entry.title}</h2><Link id={`lyric-read-${entry.lyricId}`} className={styles.readLink}
              to={`/lyrics/${entry.lyricId}`} state={{ browseFrom: "/lyrics" }}>{labels.open}</Link>
          </article>)}
        </section>
        {!entries.length && <p role="status">{labels.noResults}</p>}
        {entries.length > __WEB_CONFIG__.lyricPreview.pageSize && <div>
          <p role="status">{labels.resultCount.replace("{shown}", String(shown.length)).replace("{total}", String(entries.length))}</p>
          {shown.length < entries.length && <button aria-controls={resultsId} onClick={() => {
            nextFocus.current = entries[shown.length]?.lyricId; setPages(value => value + 1);
          }}>{labels.showMoreResults}</button>}
        </div>}
      </div>
      <Routes>
        <Route path="/lyrics" element={null} />
        <Route path="/lyrics/:id" element={<LyricReader publication={publication} labels={labels} />} />
        <Route path="/lyrics/*" element={<p role="alert">{labels.unknownRoute}</p>} />
        <Route path="*" element={null} />
      </Routes>
    </>}
  </section>;
}
