# Architecture boundaries and decision gates

**Status:** selected directions with incomplete exact contracts and overall design
production closure pending. Staged implementation is authorized; the current
fixture capability is not the complete production contract.
[Requirements](requirements.md) own behavior; [current design](design-decisions.md)
indexes the [Shared specification](https://github.com/DaasaVaani/shared/blob/main/docs/implementation-specification.md).

## Component responsibilities

| Component | Owns | Boundary |
| --- | --- | --- |
| Library sources | Flat reviewed Markdown, registries, assets/catalog settings and stable identities | Reviewed owner-text import authorized; no client runtime, committed originals or unapproved reinterpretation |
| Local ingestion | Full uploads discovery/reconciliation, conservative extraction/held drafts, reviewed assets and source PR | No scheduled/CI ingestion, fabricated metadata or actual PR-generated variants |
| Shared | Normative contracts/fixtures/portable settings/UI catalogs/generator/resources | No lyrics, app runtime or publisher |
| Library publisher | Post-merge global variants/index/artifacts/ledger/policy/ZIP/planner/host validation | No drafts/source-only leakage, item overrides or partial deployment |
| Website/Android | Validated artifact query/reading/local personal state/explicit offline lifecycle | No source Markdown/taxonomy reconstruction, backend/list uploads or silent refresh |
| Owning CI/release | Full applicable checks, validated-only Pages, independent APK/content release | No untrusted secrets, false passes or CI signing key |

Shared is pinned independently by Website, Android and Library. Shared does not
depend on consumers. Website root Pages and Library generated /library/ publication
are independent; clients consume artifacts, never source Git.

## Data flow

The approved [lyric identity contract](https://github.com/DaasaVaani/shared/blob/main/docs/lyric-identity.md)
adds an owner-supplied text-authoring/review path independent of provider API
ingestion. Production lookup/routes/search/personal references use permanent
lyric UUIDs; reviewed images/videos are optional associations, not identity.
Target minimal-list v2 distinguishes lyric and preserved legacy references.
The contract owns the complete staged rollout/acceptance obligations; executable
fixtures and the current personal-storage protocol below remain unchanged.
Reviewed owner-text import/publication is authorized separately. No automatic
legacy mapping or unrestricted source/personal migration is authorized.

```text
manual local API -> proposed Library source/assets/settings -> review PR
-> post-merge global conversion/index/package -> full validation
-> static compatible artifacts -> clients
   -> online catalog/selected-item validation -> in-memory reader
   -> explicit preparation/refresh -> completely validated active snapshot
```

Owner-supplied text follows the independent local import -> reviewed canonical
Markdown -> source PR -> post-merge text-only publication path. Structured credit
footers remain provenance, not inferred classifications/media. The
[prelaunch reader](lyric-preview.md) consumes only that public artifact family;
it does not access originals or source Markdown.

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

## Fixture settings consumption and remaining gates

The [portable configuration contract](https://github.com/DaasaVaani/shared/blob/main/docs/implementation-specification.md#3-declarative-configuration-contract)
owns the complete production inventory obligation. This table identifies current
Website consumption, not an assertion that every selected product setting exists.
Initial values and exact field bounds belong only in the linked owning files.

| Owner/source and keys | Current application and validation | Compatibility/open work |
| --- | --- | --- |
| [Web settings/schema](../settings/web.schema.json): `base`, `descriptorUrl`, `canonicalBaseUrl`, `listLinkPath`, `listFileName` | Strict build-time settings; fixture artifact entry and minimal-list URL/file projection | Public route/origin changes require old-link/hosting review; distinct real-publication settings below never reinterpret fixture formats |
| [Web settings/schema](../settings/web.schema.json): `lyricPreview.descriptorUrl`, `pageSize`, `maxItems`, `maxEncodedBytes`, `maxDecodedBytes`, `concurrentRequests` | Credential-free absolute HTTPS endpoint, verified metadata/catalog count, bounded requested-item cache/in-flight byte reservations and complete paging; complete-preparation helper retains whole-plan/concurrent-worker validation | Separate prelaunch `lyric-preview-v1`, on-demand online memory-only lifecycle; no persistent offline or complete production-profile claim; see the [reader lifecycle](lyric-preview.md#online-loading-and-failure-behavior) and independent personal v6 protocol below |
| [Web settings](../settings/web.yml): `transferChunkBytes`, `listCompressionLevel` | Byte allocation/compression controls passed to the dedicated codec worker; schema and actual-ceiling codec tests | Encoding choices do not narrow accepted valid input or change decoded/text limits |
| [Web settings](../settings/web.yml): `databaseName` | Build-time Dexie/native IndexedDB identity | Changing it is not a migration; it would strand the prior database and requires explicit compatibility handling |
| [Web settings](../settings/web.yml): `fontFamily`, `readerFontSize`, `readerFontSizeMin`, `readerFontSizeMax`, `readerFontSizeStep`, `readerLineHeights`, `space`, `contentWidth`, `readerWidth`, `themes` | Typed CSS tokens, lyric-only bounded font/density preferences, system fonts, three palettes and measured contrast checks; portable density choices/default come from Shared | Onboarding/helper/script/Recite/Practice/offline integration and physical-device/font conformance remain incomplete |
| [Web settings](../settings/web.yml): `demoPort`, `demoViewports` | Development server and desktop/mobile demo tooling, not a runtime user preference | Supported-browser/device acceptance is broader than configured demo viewports |
| [Web settings](../settings/web.yml): `appShell` | Workbox worker filename/cache namespace, complete shell-byte ceiling, visible-focus update interval and manifest filename/icon basename; see the [shell protocol](#web-app-interface-shell-and-normal-updates) and [installation metadata](#web-installation-metadata-and-original-icons) | No Library/content readiness, automatic snapshot replacement or browser installation guarantee; `base` must be a directory path |
| [Portable defaults/schema](../shared/schemas/ui-defaults.schema.json) | Build-time locale/theme/default history recording and allowed choices; first supported browser locale, explicit persisted override, independent device appearance | Canonical `lyricScript` remains the fixture invariant, not an implemented selectable transliteration profile; explicit stored history choices win |
| [Personal-transfer settings/schema](../shared/schemas/personal-transfer-settings.schema.json) | Build-time favorite/list/occurrence/recent-window/text/logical-byte and encoded/decoded/link bounds; generated schemas and transactional/codec tests | Bookmark/learning/backup bounds are declared but their complete features and protocols are not implemented |
| [Publication-safety settings/schema](../shared/schemas/publication-policy-settings.schema.json) | Strict build-time required fields, safe byte counts, platform-bounded request milliseconds and implemented required capabilities; artifact fetch/decoder checks | Untrusted remote data cannot raise these limits; this is not the full production publication/offline policy |
| [Search settings](../shared/settings/search.yml) | Publisher emits a policy artifact; Website uses its verified snapshot-bound rules, not newer source settings | Full reviewed profiles/aliases/technical grammar, filters and excerpt conformance remain open |
| [Fixture-tool settings](../settings/tooling.yml) | Strict helper validation of repository/full revision/local checkout; a local path override never waives exact clean revision validation | Independent producer/consumer pins; no production ingestion or source migration authorization |

Native owned settings and current limitations are documented in the
[Android guide](https://github.com/DaasaVaani/AndroidApp/blob/main/README.md).
The [official Unicode16 resources](https://github.com/DaasaVaani/shared/blob/main/docs/unicode-name-matching.md)
drive the Website's personal-name adapter independently of platform Unicode
tables. Build/package checks verify owned settings, resource identity and license
distribution. Native independently consumes that same profile; this is not
production search/transliteration policy or full durable personal/transfer parity.
Remaining production settings/schemas and lifecycle budgets remain open.

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
  Personal controls and fixture readers require successful personal-record
  validation; verified canonical reading remains usable with explicit personal
  errors rather than erasing readable content.
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
  retaining independent process-local query/index/result/page state. A loaded
  policy's `pageSize` bounds each additional page, not the complete result set.
  Explicit Show more preserves ranking/repetitions and focuses the first newly
  revealed Read link. Query/policy changes reset to the first page; returning from
  reading retains expanded pages. Exact catalog-map lookup projects each hit in
  O(1), rather than scanning the catalog per hit. A failed worker clears stale
  hits and shows the error, not a successful no-matches message. History-entry
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
- Workbox shell resources separate from content under the
  [normal-update protocol](#web-app-interface-shell-and-normal-updates).
- Root /open/ hash links, narrow signed Android association and browser fallback;
  no forced routing or claim that installation guarantees handoff.

## Web app-interface shell and normal updates

The production build uses pinned Workbox GenerateSW after the root and configured
`open/` HTML, compiled assets and legal notices exist. It precaches only those
HTML entries, every compiled JavaScript/CSS asset (including both lazy workers)
and the complete application/dependency/Unicode notices plus the app manifest. The inline worker has no
runtime-cache rules, automatic Library download or content/personal database API.
Fixture/Library artifacts, compressed transfers, images/video and unrelated
projects are not precached. The configured ceiling covers all precached bytes
plus worker bytes; skipped/oversized resources or generator warnings fail the
build rather than publishing an incomplete shell.

Navigation fallback admits only the configured root/index and canonical
`open/`/index entries, including their query strings. Missing binaries, assets,
Library paths and other projects never receive the app HTML fallback.
The worker's actual root scope still controls windows at other host paths:
fetch exclusions do not narrow that scope. Other projects' named caches are
not deleted. An activated precache prunes only its own obsolete entries.

Registration runs only for a production build on a supporting browser.
Unavailable support keeps online behavior and displays its boundary; registration,
installation and update errors are visible with explicit retry. Visible focus
and visibility return check for code updates no more than the owned interval,
deduplicating in-flight checks. A waiting worker produces the localized notice
to close every website tab/window and reopen. The app never posts `SKIP_WAITING`,
claims existing clients or forces reload; activation follows the browser's normal
controlled-client lifecycle. Unsaved UI state and personal data are not replaced
by merely discovering code. Code updates do not authorize content refresh.

After successful shell installation, offline Settings/list management and bounded
local transfer decoding can use the cached lazy worker. This is not a validated
offline lyric snapshot, per-list readiness, persistent-storage/eviction guarantee,
complete compatible-schema upgrade proof or full browser/device/installability
coverage. A first-ever offline visit still cannot load the site. OS installation
evidence and persistent complete-library lifecycle remain separate work.
The [shell suites](testing-and-release.md) define executable boundaries.

## Web installation metadata and original icons

PLAT-01/06 use a declarative manifest and browser-native installation where
supported; no custom install prompt, installation detection or forced app handoff.
Root and configured `open/` HTML link the same manifest, SVG favicon and180px
Apple touch icon. Production writes the manifest before shell generation;
the development server serves the same projection without registering a worker.
The manifest is cached with the interface, not the Library snapshot.

The configured directory `base` is the stable manifest `id`, `start_url` and
`scope`. Changes to that base require identity/hosting compatibility review.
Standalone display is requested, not guaranteed by every browser. Name, short
name, description and manifest language come from the Shared catalog's configured
default UI language, not a personal preference. Changing UI language/theme does
not change manifest identity or rewrite installation metadata. Initial manifest
background/chrome colors use the owned Light palette; mounted browser
`theme-color` follows the resolved Light/Dark/Warm/Follow device accent.
Device-color changes make no personal writes.

The original geometric book [SVG template](../resources/app-icon.svg) uses no
fonts, lyrics or external assets. Owned Light background/accent tokens produce a
favicon plus180/192/512px PNGs;192/512 advertise both `any` and `maskable`, with
the complete mark inside the central80% safe circle. These platform-format sizes
are not product preferences. `npm run icons` uses installed Playwright Chromium's
native SVG/canvas rasterizer and commits the four generated resources in
[public](../public/). Regenerate after template/palette/icon-basename changes.
Normal builds need no rasterizer: they reject a stale SVG, invalid PNG signature/
header dimensions or missing output before writing the manifest.

No icon images are added to the interface precache or offline lyric packages.
Browsers/operating systems may separately retain installation artwork.
An installed icon does not establish full offline lyrics, durable storage or
snapshot readiness. Chromium manifest parsing/installability diagnostics and
pixel/geometry tests do not prove OS installation, iOS/Safari/Firefox behavior,
launcher/update rendering, signed Android association or the full platform matrix.

## Web typed personal storage v6

This is the executable Website protocol for typed favorites/preferences and
logical lists and recent history, not the full production personal/backup contract. The
[Shared typed-reference/local-record v2 contract](https://github.com/DaasaVaani/shared/blob/main/docs/list-transfer.md#typed-reference-and-list-v2)
owns list/occurrence fields. All four tables share the configured personal DB:

| Table | Exact logical rows |
| --- | --- |
| `personal` | Zero or one `{id:"personal", favorites, language, theme, fontSize, density}`; favorites are exact typed lyric/legacy references, unique by kind plus case-sensitive ID; absent row means first supported browser language plus validated configured defaults |
| `lists` | Independently identified Shared list records; entry array order is authoritative |
| `control` | Exactly one `{id:"state", formatVersion:6, epoch, revision}`; fresh local UUIDv4 epoch and nonnegative safe-integer revision |
| `recentHistory` | Exactly one `{id:"history", enabled, entries}`; ordered unique typed references following the [Shared logical history record](https://github.com/DaasaVaani/shared/blob/main/docs/recent-history.md) |

### Opening and migration

Native IndexedDB version60 is the typed v6 schema. Supported migration inputs
are native version10 (personal-only v1), version20 (three-table v2) and version30
(three-table v3), version40 (typed three-table v4) and version50 (four-table v5).
Open at the exact native version **before** opening Dexie,
which can otherwise retry a newer version and patch missing schema parts.
Native upgrade creates only the specified stores/header, validates legacy
preferences/favorites/lists and both old and prospective byte/collection bounds
before success. Versions10/20 accept only old Light/Dark preferences; version30
also accepts Warm/Follow device. Validate the exact old stores/indexes/rows and
old opaque-string favorites/v1 entries before structural adaptation. Convert
favorites only to typed legacy references and `item` only to `legacyVideo`,
retaining every raw ID, list/occurrence UUID, name, fallback, repetition and order.
UUID-looking old IDs are never lyric aliases. Write converted rows and a fresh
v6 epoch/revision0 together. Version40 validates its exact typed schema/old
accounting; version50 additionally validates and preserves its exact history,
including disabled state and unresolved typed references. Both preserve every
existing typed value and identity. Existing preference rows gain only configured
font/density defaults; absent rows remain absent. Upgrades from versions10..40
create empty initially-enabled history; no activity is inferred from collections.
Future70 and unfamiliar native schemas are refused. The longer representation can exceed capacity:
abort rather than truncate/relax limits. New-mode or typed values mislabeled as
older schemas are invalid. Any failure aborts the entire schema transaction.
New initialization creates control and empty history, not a personal preference or list row.
For an absent preference row, inspect `navigator.languages` in preference order
(or `navigator.language` if empty), matching each case-insensitive primary
language subtag against configured supported UI languages. Regional/script tags
select that supported UI language; no match uses the configured fallback English.
The first explicit personal mutation stores the resulting preference with that
mutation, not an automatic initialization write. A stored language always wins
over browser preferences. UI selection never changes canonical Kannada, lyric
script or theme. The pure model accepts preference tags explicitly; only the
browser adapter reads navigator values.

V6 preferences accept `light`, `dark`, `warm` and `device`; `device` follows the
current browser light/dark media preference. Explicit modes ignore system changes;
stored mode selection survives reload and remains independent of UI locale and
canonical lyrics. Media changes update colors only, never a personal row/revision.
The configured initial theme remains Light, not implicit Follow device.
Owned web settings define all three palettes; portable defaults/allowed choices
use Shared's strict UI-defaults schema. Text/accent/highlight and interactive
boundary contrast are executable numeric checks, not font/device-matrix proof.

### Lyric reading preferences

`fontSize` is an integer in owned16..80 CSS-pixel bounds; its configured default
is28 and A-/A+ use2px steps, clamped at those bounds. `density` is one of Shared's
Compact/Normal/Relaxed tokens with Normal initially selected. Owned unitless
line heights are1.8/2.3/2.8 respectively. Build validation rejects inconsistent
font bounds/default/step and unordered density spacing.
Settings and both actual canonical/fixture readers reuse localized controls.
Only lyric body CSS changes: titles/UI, literal text, line/layout IDs, distinct
paragraphs/separators,8px paragraph padding, system font and column width remain
independent. No cross-platform font-unit conversion is defined.
Mutations use the latest complete transaction state. Bound/same-density actions
are no-ops without a row/revision write; default rendering stores no preferences.
Changes propagate to peer tabs and survive reload without additional successful
reader-open/history events or implicit content requests.
This covers later reading/settings controls only. Onboarding, helper/scripts,
Recite/Practice, persistent offline use and full device/font accessibility remain
separate requirements, not inferred from canonical/fixture browser tests.

Reject future/unknown versions, extra/missing stores, unexpected indexes/keypaths,
invalid rows, duplicate identities and invalid capacities; do not delete, reset,
coerce or silently repair data. Keep the native guard connection until the
matching Dexie open succeeds, rejecting concurrent future-version changes.
Blocked upgrades report closing other tabs/retrying, not data deletion. Invalid
personal storage disables Save/personal reading controls but does not disable
local transfer preview or re-export. There is no downgrade/reset migration.

### Transactions, names and exact accounting

Every personal mutation uses one read-write transaction spanning all four
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

Create/import/rename/duplicate warns on another name's official Unicode16
NFC + full default C/F fold + NFC key, using
[`unicode16-default-full-nfc-v1`](../src/unicode-names.ts). No host normalization,
locale, trim, lowercase or moving package table participates. Strict build checks
bind the pinned Shared settings/manifest/table/vector/license bytes; complete
Unicode License V3 is included in the distribution.

The v6 database stores raw names only, not derived keys or profile caches.
Compute this explicit profile on demand without rewriting any name, ID, occurrence,
reference, order, preference or header. Existing names that now compare equal
remain independent and opening a database does not ask for destructive repair.
The structural reference upgrade is not a Unicode-key migration. No version bump
is invented for absent caches; any future
persisted-key cache must version the profile and provide preserving migration.
Confirmed reuse still creates independent lists.
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
Generated immutable snapshots also offer explicit clipboard copy and system
link/file sharing where the corresponding browser APIs exist. Share the complete
HTTPS URL or the same generated gzip File used by the download, never a second
projection or a backend upload. Check `canShare({files})` before file handoff;
unsupported files, permission failures and user cancellation have explicit,
distinct feedback. A resolved system request means handoff, not confirmed delivery.
Keep selectable links/downloads available as fallbacks. Sharing/copying clears
pending save confirmation and blocks concurrent save/encode actions. Source
replacement/unmount invalidates asynchronous feedback without mutating personal
data; the platform, not an in-page Cancel button, owns its sharing dialog.
Controlled browser adapters verify these paths, not real OS/app interoperability.
Catalog resolution uses a per-Publication map of the validated catalog's existing
summary references: O(catalog size) construction, O(1) exact-ID lookup per list
occurrence, no network/lyric reads. Typed lyric references use only the separate
complete verified real map; legacy references use only the fixture/legacy map.
No inferred aliases exist between the maps. No publication means details are not yet
resolved, not definitely absent; an unknown reference in the available catalog
keeps its ID and user label with generic unavailable wording. Intentional
placeholders remain distinct even when their text equals a known identifier.
Known titles render separately from user fallback text and never enter personal
records/minimal exports. A saved real reference offers Read even before preparation,
reaching the explicit full-download gate without a request; prepared lookup is
exact. Known legacy references retain fixture on-demand Read.
Previewing/saving/exporting never fetches lyrics or establishes offline readiness.
Real and unresolved legacy favorites remain visible/removable without preparation;
kind plus ID keeps a lyric and UUID-looking legacy reference independent.

Reader-to-list addition requires an explicit list choice and submit. The choice
captures the list and revision/epoch; append allocates a fresh occurrence UUID
through the same validated transaction, with no automatic fallback/title.
Cancellation/no selection changes nothing; an intervening write invalidates the
choice and requires reselection. Duplicate list names are distinguished by local
list UUID in the chooser, without renaming, merging or selecting a target by name.
After a successful append, the chooser remains disabled until its observed store
has reached that committed revision, or a replacement epoch supplies a new
snapshot. A second selection must not capture pre-commit list contents while
the asynchronous personal subscription catches up. This does not rebase an
existing selection or relax concurrent-write refusal.
The hash-link preview derives its complete hash from the router's current
location, including route query/hash text so unsupported suffixes are rejected.
It must not capture `window.location.hash` in the parent outside router updates:
same-document navigation from a saved list must decode the newly selected link,
not depend on a reload or unrelated personal-state render.

The exact logical accounting envelope, serialized as compact UTF8 JSON without
BOM, is `{format:"daasavaani-personal-storage",formatVersion:6,control,personal,lists,recentHistory}`.
Key order is the order shown; header keys follow the table above. `personal` is
an empty array or one row with keys `id,favorites,language,theme,fontSize,density`. `lists` is sorted
by ASCII UUID; row keys are `id,name,entries`. Favorite keys are `kind,lyricId`
or `kind,videoId`. Each entry uses `id,kind,lyricId` or `id,kind,videoId`
then optional `fallback`, or `id,kind,text`. No text/array normalization occurs.
`recentHistory` is one row with keys `id,enabled,entries`; each history reference
uses `kind,lyricId` or `kind,videoId` in authoritative most-recent-first order.
Every header, UUID, JSON escape, comma/bracket and revision digit is included.
No timestamps exist in this version; adding them requires a versioned protocol
and accounting change rather than an uncounted field.

Enforce Shared `maxPersonalStoredBytes`, collection/total-occurrence ceilings and
each list's actual minimal-export JSON decoded-byte bound before commit. Count
serialized Unicode scalars exactly without allocating an output-sized byte
buffer. Physical IndexedDB/index/quota usage differs from logical bytes.
This envelope contains local control data and is **never a full-backup export**.
Old v2/v3 accounting uses its exact `fixture-personal-storage` format/header and
v1 entry projection before conversion. Old v4 accounting uses its exact typed
version4 envelope without history. Old v5 uses its exact version5 envelope with
history and only `id,favorites,language,theme` preferences. Validate that frozen
old representation before constructing/counting new reading defaults.
Transport decoding never selects a database
version. Unmodified v1 previews re-export v1; confirmed v1 imports structurally
adapt to local v2 records with fresh IDs, while all saved-list exports use v2.
Full-backup headers, complete personal collections, replacement/crash/locale
recovery and exportability require their own exact contracts/tests.

### Recently opened lifecycle

Only successful explicit real/fixture reader opens promote an exact typed
reference, remove its previous occurrence and retain the configured latest
`maxRecents` distinct entries. This intentional rolling-window eviction never
authorizes migration truncation. Already-first opens and disabled recording are
no-ops without revision changes. Failed/unknown reads, preparation, preview and
background loads do not record. There are no activity timestamps or search logs.

Recording starts from the validated portable default; explicit stored values
survive reload. Disable preserves entries, Clear preserves the enabled flag and
every unrelated personal row. Both controls work before preparation. Reader
effects are tied to the opened verified item, not history/preferences changes,
so clearing/re-enabling from another tab cannot re-record a still-mounted reader.
Failures are explicit and atomic without erasing already verified readable text.

The Recent view retains unresolved references across reload without fetching
content, resolves real/legacy IDs separately and preserves available return
focus. History never enters minimal-list transfers or service calls and never
claims persistent offline readiness. Independent script selection/offline
content remain subject to their separate implementation gates.

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
