# Real canonical lyric preview

## Scope and contracts

The separate `#/lyrics` route reads Library's public `lyric-preview-v1` family.
The [Shared lyric identity contract](https://github.com/DaasaVaani/shared/blob/main/docs/lyric-identity.md)
and [public schema](../shared/schemas/lyric-publication.schema.json) own permanent
UUIDs, line/layout records and capability/version semantics. Videos, thumbnails,
images and Latin text are not prerequisites for canonical Kannada reading.
Clients consume published artifacts only, never original text files or Library
Markdown. Source approval/publication does not imply reviewed transliteration,
registry completeness, rights metadata or release readiness.

This is a bounded prelaunch slice, not a change to the approved production PWA
individual on-demand reading path or optional durable offline lifecycle. The
preview requires a complete consented download and retains it only in memory.
Reload discards preparation; there is no service-worker/offline snapshot,
background refresh, replacement UI, resume or persistent content cache here.

## Preparation and failure behavior

- Opening the route does not fetch the owner publication. The explicit preparation
  button requests consent to the complete download; fixture metadata may still
  load independently elsewhere in the application.
- Strict build-time [web settings](../settings/web.yml) and their
  [schema](../settings/web.schema.json) own `lyricPreview.descriptorUrl`, page
  size, item/aggregate encoded/decoded ceilings and worker concurrency. The URL
  must be absolute, credential-free HTTPS. Shared publication safety owns
  per-artifact byte and request-time limits.
- Transport requests use `no-store`. Descriptor, manifest and every referenced
  item participate in total accounting. The complete count/byte plan must fit
  before any item request; the client never silently truncates a publication.
- Gzip bytes, SHA256, encoded/decoded sizes, paths, format/capabilities, summary/
  item UUID/title/tags agreement, meaningful Kannada lines, controls/scalars and
  global lyric/line identities validate before a prepared catalog is exposed.
  Layout rows cannot acquire line IDs. Compatible unknown optional fields are
  accepted; required unknown capabilities or future versions are not.
- Bounded workers abort and settle on failure/cancellation. No partial result is
  activated. An explicit error or cancellation status allows a fresh retry;
  stale requests cannot replace newer state. A failed fixture endpoint does not
  block real preparation or reading.

## Browsing and reading

After preparation, the catalog's literal case-sensitive title substring filter
and explicit configured-size pages expose every matching item. This is not the
production Kannada/Latin linguistic search/index. Show more focuses the first
newly revealed result; changing the query resets expansion.

`#/lyrics/<lyricId>` performs exact UUID lookup in the verified prepared map.
Unknown IDs display unavailable rather than inferring another lyric/video.
Reading makes no additional lyric request and preserves canonical text, whitespace,
line identities and blank layout rows. UI language/theme do not alter the lyrics.
The catalog/query/expanded page and available focus/scroll survive in-session
reader return and Back/Forward. Reload resets this context and needs consent again.

The real route hides fixture notices/errors and synthetic preparation messages.
Personal-storage errors remain explicit. Existing fixture personal/transfer
formats remain separate: there are no real-lyric favorite/list/save controls,
UUIDs written to `videoId`, inferred legacy mappings or personal migrations.

## Coverage and open work

This slice provides partial DATA-01/02/04/05, UX-07/13, OFF-02 and SET-01/02
coverage. See [validation commands and obligations](testing-and-release.md) and
the [roadmap](implementation-roadmap.md). The native application independently
implements a read-only full-preparation preview with the same media independence.

Still open: production individual PWA item reading, typed personal references/
transfers, favorites/bookmarks/recitation for real UUIDs, full linguistic search/
profiles/helpers, populated classification/context/verse/media/eligible-Latin
public adapters, rights/registry closure, persistent offline activation/repair,
publication ledger/date/ZIP protocols and release/platform acceptance.

Owner originals remain local and uncommitted. Library's
[import guide](https://github.com/DaasaVaani/library/blob/main/docs/source-import.md)
owns the conservative footer adapter and explicit unchanged-input retry.
Ambiguous content, controls and undecodable inputs stay held; text review does
not authorize guessing missing encodings, video associations or metadata.
