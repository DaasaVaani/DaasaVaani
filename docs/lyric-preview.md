# Real canonical online reading

## Scope and contracts

The separate `#/lyrics` route reads Library's public `lyric-preview-v1` family.
The [Shared lyric identity contract](https://github.com/DaasaVaani/shared/blob/main/docs/lyric-identity.md)
and [public schema](../shared/schemas/lyric-publication.schema.json) own permanent
UUIDs, line/layout records and capability/version semantics. Videos, thumbnails,
images and Latin text are not prerequisites for canonical Kannada reading.
Clients consume published artifacts only, never original text files or Library
Markdown. Source approval/publication does not imply reviewed transliteration,
registry completeness, rights metadata or release readiness.

This bounded prelaunch slice implements the Website's selected individual
online-reading direction, not the complete production publication/search or
optional durable offline lifecycle. Metadata and verified requested items stay
only in memory. Reload discards them and loads the current publication for the
new online session; there is no service-worker/offline snapshot, background
refresh, replacement UI, resume or persistent content cache here.

## Online loading and failure behavior

- Opening `#/lyrics` or an explicit lyric reader link fetches only the descriptor
  and its hash-pinned catalog manifest initially. Browsing requires no complete
  download. Reading requests only the selected catalog item's immutable object.
  This does not download an index or establish offline readiness.
- Settings, Favorites, lists/list previews and Recently opened do not implicitly
  fetch owner content. An explicit Read link is an online-reading action and may
  load the catalog and selected item. Fixture metadata loads independently.
- Strict build-time [web settings](../settings/web.yml) and their
  [schema](../settings/web.schema.json) own `lyricPreview.descriptorUrl`, page
  size, catalog item count and aggregate in-memory encoded/decoded ceilings. The URL
  must be absolute, credential-free HTTPS. Shared publication safety owns
  per-artifact byte and request-time limits.
- Transport uses `no-store`. Validate the complete catalog schema/capabilities,
  unique identities, literal metadata and every declared object reference before
  exposing it. An exposed catalog is not a claim that every item's text was
  downloaded or validated.
- Cache accounting includes descriptor/manifest bytes and successful/in-flight
  requested items. Reserve the selected item's declared encoded/decoded bytes
  before requesting it; refuse excess explicitly, release failed/cancelled or
  duplicate reservations and preserve prior verified content. Do not silently
  evict, trim a catalog, fetch unrelated items or raise limits from remote data.
- Each selected item validates gzip, SHA256, encoded/decoded sizes, paths,
  format/capabilities, summary/item UUID/title/tags agreement, meaningful Kannada
  lines, controls/scalars and conflicts with catalog/loaded line identities before
  exposure. Layout rows cannot acquire line IDs. Compatible unknown optional
  fields are accepted; required unknown capabilities/future versions are not.
- Metadata errors expose no partial catalog. Item errors retain the verified
  catalog and report an explicit error; retry requests the same pinned object
  without refreshing metadata or guessing a replacement. Verified cached items
  are reused within the session, not silently replaced with a newer publication.
- Cancellation aborts the active request, exposes a cancelled status and allows
  explicit retry. Leaving the route cancels its read. Late responses cannot
  activate abandoned content, fill its cache or record an open. A failed fixture
  endpoint does not block real catalog loading or reading.
- The complete-preparation conformance helper separately retains whole-plan
  validation before item requests and bounded `concurrentRequests` workers with
  abort/settle behavior. The Website online UI does not invoke that helper or
  claim a persistent offline download.

## Browsing and reading

After metadata loading, the catalog's literal case-sensitive title substring filter
and explicit configured-size pages expose every matching item. This is not the
production Kannada/Latin linguistic search/index. Show more focuses the first
newly revealed result; changing the query resets expansion.

`#/lyrics/<lyricId>` performs exact UUID lookup in the verified catalog.
Unknown IDs display unavailable rather than inferring another lyric/video.
Unknown IDs request no item. A known uncached item is downloaded and verified
before canonical text or save controls appear; cached reads make no new request.
Reading preserves canonical text, whitespace, line identities and blank layout
rows. UI language/theme do not alter the lyrics.
The catalog/query/expanded page and available focus/scroll survive in-session
reader return and Back/Forward. Reload resets this context and performs a fresh
online metadata/selected-item load, without a complete-download gate.

The real route hides fixture notices/errors and synthetic preparation messages.
Personal-storage errors remain explicit. Explicit reader controls save typed
lyric favorites and new independent list occurrences; merely loading/reading
never changes favorites/lists/preferences. Successful explicit reading records
optional device-only recent history; disabled recording makes reading fully
no-write. A lyric reference uses `kind:"lyric",lyricId`;
legacy fixture/video references retain `kind:"legacyVideo",videoId`, even for
UUID-looking old values. No reference is matched or rewritten from a title,
attached video or catalog coincidence.

Favorites retain unresolved lyric IDs across reload without automatic requests.
Exact titles appear only from the available verified catalog, without item reads.
Real Favorites use independent configured-size pages, with the same literal
title filter available after catalog loading, query-reset and new-page focus rules
as the real catalog. Filtering/paging never writes personal data; unresolved
references remain available when the filter is cleared. Legacy search is labeled
separately and does not pretend to search canonical lyrics.
Unresolved legacy favorites remain visible/removable, not silently discarded.
List forms offer explicit lyric-ID versus legacy-ID creation and placeholder
replacement, preserving occurrence IDs/order/user text. A real-reference Read
loads the requested UUID online, not a guessed substitute. Preview/save/export
alone never downloads lyrics. List/Favorites origins restore
available focus/scroll and the selected unsaved list editor in the same session.

The [personal v6 protocol](architecture.md#web-typed-personal-storage-v6) validates
and structurally upgrades old local schemas atomically without changing existing
list/occurrence IDs or raw legacy values. Transport families remain independent:
v1 previews can re-export unchanged; confirmed v1 imports adapt to typed legacy
records, and all saved-list exports use minimal v2 without local IDs/lyric copies.

## Coverage and open work

This slice provides partial DATA-01/02/04/05, UX-07/13, OFF-02 and SET-01/02
coverage, with partial LIB-01/02/03/04/05/06/08/09/10/11 and XFER-01/02/03/04/05/06/08
for the Website typed personal slice. See [validation commands and obligations](testing-and-release.md) and
the [roadmap](implementation-roadmap.md). The native application independently
implements full-preparation reading with the same media independence, typed
favorites, durable lists/occurrences and device-only recent history. Native
complete preparation and Website online loading remain memory-only; local
collections do not establish persistent offline content readiness.

Website Recently opened retains typed references across restarts, with default-on
recording, independent disable/clear controls and no automatic content request.
Only a verified explicitly opened reader updates it; catalog loading and preview
never record. Clear/disable preserve favorites/lists/preferences; unknown
references remain visible. See the [history lifecycle](architecture.md#recently-opened-lifecycle).

Still open: complete production-profile reading, bookmarks/learning/
recitation for real UUIDs, full personal backups, full linguistic search/
profiles/helpers, populated classification/context/verse/media/eligible-Latin
public adapters, rights/registry closure, persistent offline activation/repair,
publication ledger/date/ZIP protocols and release/platform acceptance.

Owner originals remain local and uncommitted. Library's
[import guide](https://github.com/DaasaVaani/library/blob/main/docs/source-import.md)
owns the conservative footer adapter and explicit unchanged-input retry.
Ambiguous content, controls and undecodable inputs stay held; text review does
not authorize guessing missing encodings, video associations or metadata.
