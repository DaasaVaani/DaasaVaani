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
Personal-storage errors remain explicit. Explicit reader controls save typed
lyric favorites and new independent list occurrences; merely preparing/reading
never changes personal data. A lyric reference uses `kind:"lyric",lyricId`;
legacy fixture/video references retain `kind:"legacyVideo",videoId`, even for
UUID-looking old values. No reference is matched or rewritten from a title,
attached video or catalog coincidence.

Favorites retain unresolved lyric IDs across reload without preparation or
automatic requests. Exact titles appear only from the available verified map.
Real Favorites use independent configured-size pages, with the same literal
title filter available after preparation, query-reset and new-page focus rules
as the real catalog. Filtering/paging never writes personal data; unresolved
references remain available when the filter is cleared. Legacy search is labeled
separately and does not pretend to search canonical lyrics.
Unresolved legacy favorites remain visible/removable, not silently discarded.
List forms offer explicit lyric-ID versus legacy-ID creation and placeholder
replacement, preserving occurrence IDs/order/user text. A real-reference Read
can reach the consent gate before preparation; neither preview/save/export nor
opening that gate downloads lyrics. Reading after explicit preparation continues
to the requested UUID, not a guessed substitute. List/Favorites origins restore
available focus/scroll and the selected unsaved list editor in the same session.

The [personal v4 protocol](architecture.md#web-typed-personal-storage-v4) validates
and structurally upgrades old local schemas atomically without changing existing
list/occurrence IDs or raw legacy values. Transport families remain independent:
v1 previews can re-export unchanged; confirmed v1 imports adapt to typed legacy
records, and all saved-list exports use minimal v2 without local IDs/lyric copies.

## Coverage and open work

This slice provides partial DATA-01/02/04/05, UX-07/13, OFF-02 and SET-01/02
coverage, with partial LIB-01/02/03/04/05/08/09/10/11 and XFER-01/02/03/04/05/06/08
for the Website typed personal slice. See [validation commands and obligations](testing-and-release.md) and
the [roadmap](implementation-roadmap.md). The native application independently
implements full-preparation reading with the same media independence, typed
favorites and durable lists/occurrences. Preparation remains memory-only in both
clients; local collections do not establish persistent offline content readiness.

Still open: production individual PWA item reading, bookmarks/recents/learning/
recitation for real UUIDs, full personal backups, full linguistic search/
profiles/helpers, populated classification/context/verse/media/eligible-Latin
public adapters, rights/registry closure, persistent offline activation/repair,
publication ledger/date/ZIP protocols and release/platform acceptance.

Owner originals remain local and uncommitted. Library's
[import guide](https://github.com/DaasaVaani/library/blob/main/docs/source-import.md)
owns the conservative footer adapter and explicit unchanged-input retry.
Ambiguous content, controls and undecodable inputs stay held; text review does
not authorize guessing missing encodings, video associations or metadata.
