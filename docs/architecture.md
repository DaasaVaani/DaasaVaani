# Architecture boundaries and decision gates

**Status:** selected directions with incomplete exact contracts and overall design
production closure pending. Staged implementation is authorized; the current
fixture capability is not the complete production contract.
[Requirements](requirements.md) own behavior; [current design](design-decisions.md)
indexes the [Shared specification](https://github.com/DaasaVaani/shared/blob/main/docs/implementation-specification.md).

## Component responsibilities

| Component | Owns | Boundary |
| --- | --- | --- |
| Library sources | Flat reviewed Markdown, registries, assets/catalog settings and stable identities | No client runtime or secrets; migration unauthorized |
| Local ingestion | Full uploads discovery/reconciliation, conservative extraction/held drafts, reviewed assets and source PR | No scheduled/CI ingestion, fabricated metadata or actual PR-generated variants |
| Shared | Normative contracts/fixtures/portable settings/UI catalogs/generator/resources | No lyrics, app runtime or publisher |
| Library publisher | Post-merge global variants/index/artifacts/ledger/policy/ZIP/planner/host validation | No drafts/source-only leakage, item overrides or partial deployment |
| Website/Android | Validated artifact query/reading/local personal state/explicit offline lifecycle | No source Markdown/taxonomy reconstruction, backend/list uploads or silent refresh |
| Owning CI/release | Full applicable checks, validated-only Pages, independent APK/content release | No untrusted secrets, false passes or CI signing key |

Shared is pinned independently by Website, Android and Library. Shared does not
depend on consumers. Website root Pages and Library generated /library/ publication
are independent; clients consume artifacts, never source Git.

## Data flow

```text
manual local API -> proposed Library source/assets/settings -> review PR
-> post-merge global conversion/index/package -> full validation
-> static compatible artifacts -> clients
-> explicit preparation/refresh -> completely validated active snapshot
```

First API ingestion remains blocked pending provider clarification. Offline/
synthetic fixture analysis does not waive that hold. Source PR tooling fixtures
do not authorize generating real item variants/previews.

The initial fixture pipeline has strict metadata/settings parsing, hash-addressed
gzip objects, a policy-bound counted-gram index and independent browser/native
readers. It intentionally has no production ledger/ZIP planner or persistent
offline activation. Those protocols remain gated; fixtures never become reviewed content.
Development/preview transport serves exact encoded object bytes and a fresh
descriptor without automatic HTTP gzip decoding or a long-held static descriptor
handle. Publishing immutable fixture objects must not trigger automatic reader
reloads. Actual deployed hosting still requires byte/hash and browser validation.

## Runtime boundaries

- React/strict TypeScript/Vite static PWA/hash routes; Kotlin/Compose/Material3
  API26+, app -> pure Kotlin core. No runtime backend, accounts, hosted short links,
  analytics or synchronization service. Explicit online YouTube playback allowed.
- Android has no lyrics: initial complete preparation gates lyric use, not
  setup/Settings/recovery/list preview. PWA supports individual online reading
  before optional full preparation. No offline image/video dependency.
- Prepared readers use active snapshot even online until explicit validated
  update. One active+one resumable target; no mixed/partial activation or permanent
  previous snapshot. Failure preserves active/personal state.
- Web Locks/fencing protect writer and reader pins/GC. Corruption retains only
  verified unaffected capabilities with explicit degradation/repair. Current-only
  remote can require explained restart; never silent version substitution.
- Generator UTC dates are soft recommendations, not expiry. Successful no-newer-
  compatible check grants72h suppression, clock anomalies cannot claim freshness.
  Distinguish latest published from latest compatible.
- One Room/Dexie personal database includes preferences, separate from content/
  journals. Typed identities, repeats/unresolved refs, no guessed reanchoring.
  Portable minimal lists are new-list-only; full logical backups same-platform
  replacement with revision/epoch/locale recovery and exact capacity.
- Web list-transfer work runs in a dedicated cancellable worker with no database
  or network adapter. Pinned pako exposes stream-end/remaining-input checks that
  native gzip streams do not reliably enforce. The decoder accepts exactly one
  gzip member or raw-deflate stream, verifies checksum/length, bounds output as
  it is produced, rejects trailing input, decodes fatal UTF8 and validates the
  pinned Shared schema. Duplicate JSON keys are rejected without payload logs.
  Optional BOM counts toward the byte ceiling; user text/order is never normalized
  or truncated. URL input is bounded ASCII, canonical base64url, configured HTTPS
  origin and root/open path; no payload request is sent.
- Settings and list previews do not depend on a successful Library download.
  Personal controls/readers require successful personal-record validation.
  Previews show references/user text, not guessed catalog resolution/readiness,
  until a library-resolution adapter is available. An explicit Save creates only
  a new independent local list; re-export is local and long links require files.
  A static build alias serves the configured open path with the same root assets.
  The production build includes generated third-party dependency license notices.

List transport configuration is build-time, not taken from the incoming payload:

| Setting owner/key | Type/unit | Compatibility/application |
| --- | --- | --- |
| Website `canonicalBaseUrl` | HTTPS base URL | Canonical share origin/base; changing it requires old-link compatibility review |
| Website `listLinkPath` | Safe relative directory | Static open entry; changed paths require handler/hosting compatibility |
| Website `listFileName` | Safe list-file download name | Export filename hint, never input validation |
| Website `transferChunkBytes` | Positive bounded byte count | Codec output allocation quantum; schema owns permitted bounds |
| Website `listCompressionLevel` | Integer compression level | Output encoding cost/size; decoding accepts all valid stream encodings |
| Shared personal-transfer limits | Encoded/decoded bytes and whole-URL ASCII characters | Independent caps; versioned schema supplies text/collection limits |

Actual defaults and numeric bounds live only in the owning settings/schema files.
Personal values never enter repository settings; payloads cannot override limits.
- UI locale, lyric/helper profile, theme/font/density remain independent local
  preferences. System fonts only with explicit rendering limitations/alternatives.
  Preserve literal lines/verses and accessible non-drag controls.
- Global publisher-built counted q-gram index with exact AND/OSA verification,
  deterministic additive ranking and bounded selected-script item excerpts.
  Explicit unprepared index consent; cancellation/stale/IME correctness mandatory.
- Website Library/Favorites views stay mounted but hidden outside their routes,
  retaining independent process-local query/index/result state. History-entry
  scroll/focus records and a per-browsing-route fallback support return navigation;
  weak focus references do not retain detached reader DOM. Removed targets fall
  back to the main content and a valid clamped scroll position. Reader return
  follows its internal origin; directly opened readers return to Library.
  No query/history is written to personal storage or URLs; reload resets it.
- A list-origin reader keeps its existing Lists view mounted but hidden, retaining
  selected snapshot, unsaved edit, occurrence focus and scroll for return. Other
  routes may unmount Lists; a reload does not persist that UI state. Reader return
  recognizes only the explicit Library/Favorites/Lists origins; direct/new-tab
  readers use Library fallback. A hidden list's captured revision is not silently
  advanced by concurrent personal writes.
- Workbox shell resources separate from content. Normal worker activation,
  notify/no forced reload or skipWaiting; preserve active reading/personal state.
- Root /open/ hash links, narrow signed Android association and browser fallback;
  no forced routing or claim that installation guarantees handoff.

## Web fixture personal storage v2

This is the executable fixture-client protocol for favorites/preferences and
logical lists, not the full production personal/backup contract. The
[Shared list record](https://github.com/DaasaVaani/shared/blob/main/docs/list-transfer.md#local-list-record-v1)
owns list/occurrence fields. All three tables share the configured personal DB:

| Table | Exact logical rows |
| --- | --- |
| `personal` | Zero or one `{id:"personal", favorites, language, theme}`; absent row means first supported browser language plus validated configured defaults |
| `lists` | Independently identified Shared list records; entry array order is authoritative |
| `control` | Exactly one `{id:"state", formatVersion:2, epoch, revision}`; fresh local UUIDv4 epoch and nonnegative safe-integer revision |

### Opening and migration

Native IndexedDB version20 is the fixture v2 schema; version10 is the supported
Dexie v1 predecessor. Open at the exact native version **before** opening Dexie,
which can otherwise retry a newer version and patch missing schema parts.
Native upgrade creates only the specified stores/header, validates legacy
preferences/favorites and aggregate capacity before success, and retains the
legacy personal row unchanged. Any failure aborts the entire schema transaction.
New initialization creates metadata only, not a personal preference or list row.
For an absent preference row, inspect `navigator.languages` in preference order
(or `navigator.language` if empty), matching each case-insensitive primary
language subtag against configured supported UI languages. Regional/script tags
select that supported UI language; no match uses the configured fallback English.
The first explicit personal mutation stores the resulting preference with that
mutation, not an automatic initialization write. A stored language always wins
over browser preferences. UI selection never changes canonical Kannada, lyric
script or theme. The pure model accepts preference tags explicitly; only the
browser adapter reads navigator values.

Reject future/unknown versions, extra/missing stores, unexpected indexes/keypaths,
invalid rows, duplicate identities and invalid capacities; do not delete, reset,
coerce or silently repair data. Keep the native guard connection until the
matching Dexie open succeeds, rejecting concurrent future-version changes.
Blocked upgrades report closing other tabs/retrying, not data deletion. Invalid
personal storage disables Save/personal reading controls but does not disable
local transfer preview or re-export. There is no downgrade/reset migration.

### Transactions, names and exact accounting

Every personal mutation uses one read-write transaction spanning all three
tables. Read/validate the complete current state, check captured epoch/revision,
validate the prospective state including the incremented revision, then write
only the intended record and header. Failure rolls back all writes. Creation/
import/duplication allocates fresh cryptographic UUIDv4 list/occurrence IDs;
rename retains identities. List and occurrence UUID sets are checked independently
across the database, preserving repeated references/text and unresolved IDs.
Occurrence edits, moves and explicit placeholder-to-reference replacement retain
the occurrence UUID and authoritative array position except for the requested
move. Removal affects exactly that occurrence; addition allocates a fresh UUID.
Operations copy the ordered array in O(n); the transaction still validates the
entire personal state/accounting before committing. A committed mutation returns
its new revision so subsequent local edits use the same atomic result.

Create/import/rename/duplicate warns on another name's NFC + full default Unicode
case-folded + NFC key. The dependency/Unicode data is pinned by the package
manifest/lock; neither UI locale nor a collation/trim alters this key. Stored names
remain byte-for-byte unchanged. Confirmed reuse still creates independent lists.
The confirmation captures epoch/revision; another tab's mutation forces renewed
review, even if a confirmation was already visible. Live queries refresh
personal views across tabs; they do not overwrite a captured edit/confirmation.
Entry-only edits of a previously confirmed duplicate name do not ask again;
an actual name change still applies the warning. Entry forms render user text
literally, preserve spaces/code points, and remove an optional fallback only when
its field is explicitly empty. Placeholder replacement initially carries its
user-written text into the visible editable fallback field. It never infers an
item match or fills a catalog title. Focus follows the affected occurrence after
save/move/removal and returns to the list heading when no occurrence remains.

Saved-list export reads/validates the three-table state in one read-only
transaction at the selected epoch/revision and projects only the minimal-list
allowlist. After bounded worker encoding, recheck the same epoch/revision before
offering bytes/link. A concurrent personal mutation requires a fresh selection;
failure/cancellation changes no table. Export uses the stored name/content, not
unsaved editor fields, and does not increment revisions or allocate identities.
Preview and saved-list export share one worker-based UI with explicit cancellation,
object-URL cleanup, lossless oversized-link file fallback and privacy warnings.
Starting export cancels any pending save confirmation; decoding, saving and
encoding controls cannot concurrently commit a pending confirmation. Export
fetches no catalog details/lyrics and infers no readiness state.
Catalog resolution uses a per-Publication map of the validated catalog's existing
summary references: O(catalog size) construction, O(1) exact-ID lookup per list
occurrence, no network/lyric reads. No publication means details are not yet
resolved, not definitely absent; an unknown reference in the available catalog
keeps its ID and user label with generic unavailable wording. Intentional
placeholders remain distinct even when their text equals a known identifier.
Known titles render separately from user fallback text and never enter personal
records/minimal exports. A saved known reference offers explicit on-demand Read;
previewing/saving/exporting never fetches lyrics or establishes offline readiness.

Reader-to-list addition requires an explicit list choice and submit. The choice
captures the list and revision/epoch; append allocates a fresh occurrence UUID
through the same validated transaction, with no automatic fallback/title.
Cancellation/no selection changes nothing; an intervening write invalidates the
choice and requires reselection. Duplicate list names are distinguished by local
list UUID in the chooser, without renaming, merging or selecting a target by name.
The hash-link preview derives its complete hash from the router's current
location, including route query/hash text so unsupported suffixes are rejected.
It must not capture `window.location.hash` in the parent outside router updates:
same-document navigation from a saved list must decode the newly selected link,
not depend on a reload or unrelated personal-state render.

The exact logical accounting envelope, serialized as compact UTF8 JSON without
BOM, is `{format:"fixture-personal-storage",formatVersion:2,control,personal,lists}`.
Key order is the order shown; header keys follow the table above. `personal` is
an empty array or one row with keys `id,favorites,language,theme`. `lists` is sorted
by ASCII UUID; row keys are `id,name,entries`. Each entry uses `id,kind,videoId`
then optional `fallback`, or `id,kind,text`. No text/array normalization occurs.
Every header, UUID, JSON escape, comma/bracket and revision digit is included.
No timestamps exist in this version; adding them requires a versioned protocol
and accounting change rather than an uncounted field.

Enforce Shared `maxPersonalStoredBytes`, collection/total-occurrence ceilings and
each list's actual minimal-export JSON decoded-byte bound before commit. Count
serialized Unicode scalars exactly without allocating an output-sized byte
buffer. Physical IndexedDB/index/quota usage differs from logical bytes.
This envelope contains local control data and is **never a full-backup export**.
Full-backup headers, complete personal collections, replacement/crash/locale
recovery and exportability require their own exact contracts/tests.

## Selected foundation and incomplete gates

| Gate | Unresolved package | Required implementation evidence |
| --- | --- | --- |
| D1 foundation | Compatible verified pins, native manifests/locks and real command registry | Build/type/lint/integration compatibility, API26/platform coverage |
| D2 sources/settings | Exact fields/cardinalities/grammar/annotations/registry schemas and full configurable inventory | Valid/draft/held/invalid/reference/layout/offset/correction fixtures |
| D3 language/catalog | Exact Latin/native/alias/Unicode/technical-marker/digit tables and independent expected samples | Global conversion/Source Latin/catalog/escaping/plurals and real font/shaping |
| D4 public/search/personal | Exact JSON/capability/packed posting/signature/envelope/reference schemas | Oracle parity/ranking/bounds/hash/round trips/restore locale and privacy |
| D5 lifecycle | Journal/receipt/epoch/GC lock order/crash/accounting protocols | Atomic activation, stale writers/readers, cancellation/space/corruption/recovery |
| D6 ingestion/assets | Channel/batch/quota/extraction/pending-work runbook, verified sharp pin/provider clarification | Completeness/idempotency/correction preservation, bounded visual processing |
| D7 operations/platform | UI tokens/capability boundaries, route/shell/signing procedures and normal protections | Signed-device links, independent compatibility, capacity and full release matrix |

D2 precedes source validators; D2/D3 precede ingestion text processing. D4 precedes
integration; D4/D5 precede activation. D1 enables actual builds. D6 retains the
external provider gate. Staged authorization does not waive the applicable
production gate or turn fixture validation into full conformance.

Numeric performance goals are advisory, never a substitute for correctness,
accessibility, cancellation, integrity/safety limits and preservation. Follow
[full finalization/push validation](testing-and-release.md); targeted checks alone
cannot finalize code. Record past choices/results only in [HISTORY.md](../HISTORY.md).
