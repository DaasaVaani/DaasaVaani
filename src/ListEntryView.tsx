import { Link } from "react-router-dom";
import type messages from "../shared/generated/web/ui.json";
import type { Publication } from "./artifacts";
import type { ListSnapshot } from "./list-transfer-types";

export function ListEntryView({ entry, labels, publication, readable = false }: {
  entry: ListSnapshot["entries"][number]; labels: typeof messages.en; publication?: Publication; readable?: boolean;
}) {
  const summary = entry.kind === "item" ? publication?.summary(entry.videoId) : undefined;
  return <>
    <span>{entry.kind === "item" ? labels.transferReference : labels.transferPlaceholder}: </span>
    {entry.kind === "placeholder" ? <><span>{entry.text}</span><p>{labels.lyricsUnavailable}</p></> : <>
      <code>{entry.videoId}</code>
      {entry.fallback !== undefined && <p>{entry.fallback}</p>}
      {summary ? <>
        <p lang="kn">{summary.title}</p><p>{labels.referenceKnown}</p>
        {readable && <Link to={`/item/${encodeURIComponent(entry.videoId)}`} state={{ browseFrom: "/lists" }}
          onClick={event => event.currentTarget.focus({ preventScroll: true })}>{labels.open}</Link>}
      </> : <p>{publication ? labels.lyricsUnavailable : labels.referencePending}</p>}
    </>}
  </>;
}
