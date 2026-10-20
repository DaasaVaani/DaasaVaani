# Approved design decisions and remaining gates

Recorded: 2026-10-21.

**Status: individually approved choices; consolidated design still awaits
overall final approval.** This record does not authorize application implementation,
dependency installation, deployment, release, or commits. No application
implementation, benchmark, linguistic conformance run, or device validation is
established. Four-repository bootstrap is complete; Library source migration is
pending and Website submodule wiring remains staged locally, not committed.

[Requirements](requirements.md) own product behavior. This record owns the
selected technical direction, rationale, alternatives and remaining questions.
[Architecture gates](architecture.md) and [contract guidance](https://github.com/DaasaVaani/shared/blob/main/docs/data-contracts.md)
identify prerequisites for a coding-ready specification. A selected library is
not an approved version pin or evidence that its defaults satisfy the contract.

Later explicit choices below supersede earlier questionnaire entries that left
the same detail open. The remaining gates must be resolved, the combined design
reviewed, and overall approval obtained before treating this as a final
implementation specification.

## 1. Client foundations and libraries

| Surface | Selected direction | Rationale and trade-off |
| --- | --- | --- |
| Android | Native Kotlin, Jetpack Compose and Material 3; API 26+. | Native lifecycle, accessibility and platform integration; a separate client implementation must be maintained. No shared-web Android shell. |
| Website | React, strict TypeScript and Vite; static DOM-based PWA. | Static hosting and selectable text without a server framework; runtime data validation is still necessary. |
| Shared boundary | Contracts, specifications, conformance fixtures and UI catalogs, not lyric content or an application runtime. | Platform-appropriate implementations; fixture parity is essential to prevent drift. |
| Android state | AndroidX ViewModels, Coroutines/StateFlow, lifecycle-aware observation and lean unidirectional data flow. | Explicit ownership; durable operations cannot depend on a screen's lifetime. |
| Android dependency injection | Koin compiler-plugin DSL, constructor injection and statically analyzable production modules. | Chosen over Hilt and Classic-only Koin. Detect/report skipped graph checks in CI; scope and integration tests remain necessary. |
| Android navigation | Stable Jetpack Navigation 3, typed serializable small keys, standard entry providers and ordinary Koin injection. | Per-entry ViewModel ownership; no experimental Koin Navigation 3 registration DSL by default. |
| Web navigation | React Router declarative mode with hash routing. | Works on static hosting without server rewrites; one router-owned fragment must also accommodate shared payloads. No React Router server/framework mode. |
| Web state | React state/reducers, focused Context and `dexie-react-hooks`. | Dexie remains authoritative for persistent data; no redundant Zustand/Redux store initially. |
| Web UI | Semantic native HTML and React Aria Components where needed. | Reuses accessible behavior without adopting the full React Spectrum visual system. It does not prove WCAG compliance or Kannada announcement coverage. |
| Web styling | CSS Modules, CSS custom properties and a small intentional global stylesheet. | No initial Tailwind, Sass or CSS-in-JS framework; visual tokens remain unselected. |
| Android HTTP | OkHttp. | Thin, explicit transfer handling rather than Retrofit/Ktor by default. |
| Browser HTTP | Native Fetch and AbortController. | No Axios by default; response status, cancellation and limits are application responsibilities. |
| Android JSON | kotlinx.serialization JSON with generated serializers. | Type decoding does not replace integrity, schema or domain checks. |
| Shared contracts | Language-neutral JSON Schema; Ajv standalone web validators generated at build time. | No browser schema compilation/dynamic validator generation. Kotlin explicit checks and shared accepted/rejected fixtures must cover the same rules. |

Prefer stable APIs and review experimental opt-ins explicitly. The researched
Koin compiler-plugin documentation specifies Kotlin 2.3.20+, Koin 4.2.0+ and
Gradle 8+; these are compatibility findings, **not approved toolchain pins**.
Select compatible stable versions, package managers, lock policy and actual
commands later. No executable application commands exist yet.

HTTP wrappers must enforce status checks, bounded reads, response cleanup,
cancellation/timeouts and distinct errors. Preserve the exact artifact bytes:
artifact gzip is not the same as HTTP Content-Encoding. Avoid a second persistent
HTTP payload cache alongside the content store. Retry budgets/timeouts are open.

Validation is non-mutating: no coercion, silently removed fields or invalid-input
repair. JSON Schema dialect, unknown-field policies, TypeScript type generation
and Kotlin constraint coverage remain open. Ajv standalone output may still need
bundled runtime helpers.

## 2. Source authoring, parsing and stable identities

One flat Markdown file per video in `library/` contains YAML metadata/provenance,
canonical Kannada and any supplied Source Latin. There is no companion source
file and no committed generated lyric variant.

- Use fenced literal canonical lyric blocks with persisted line-ID prefixes.
  Use section/verse headings where appropriate; never invent verse divisions.
  Strip structural markers from displayed lyrics without blanket trimming or
  changing meaningful spacing.
- Source Latin may remain raw/unstructured; reviewed correspondence is separate
  from suitability and completeness. Never fill it with generated lines.
- Use `unified`, `remark-parse` and `remark-frontmatter` for the syntax tree, and
  npm `yaml` for front-matter contents. Apply our restricted-format validation:
  required sections, closed fences, permitted nodes and duplicate/missing IDs.
  A Markdown parser alone does not enforce that grammar.
- Reuse `yaml` for translation catalogs. Accept a strict YAML 1.2 subset: one
  document, string mapping keys, no duplicates, anchors/aliases, merge keys or
  custom tags. Reject parser errors/unsupported constructs before schema/domain
  validation; do not treat a partial parse as success.
- Lyric line/verse identities use opaque UUIDs assigned once by authoring/import
  tooling and persisted. Do not derive them from positions/text hashes,
  regenerate them at build time, or silently insert missing IDs at publication.
  Node's built-in UUID generation is the proposed helper, not a finalized UUID
  serialization/version decision. Line IDs must be unique within the video,
  including across verses.
- Corrections/moves of the same logical content retain identity. Splits/merges
  retain an old identity only for a clear survivor; otherwise use fresh IDs.
  Missing references become explicitly unresolved. No redirect table, similarity
  reanchoring, positional guessing or automatic rewriting of personal records
  initially.

Filename policy:

1. Stable ID-derived component plus descriptive ASCII-transliterated title slug.
2. Encode the original video ID's bytes as lowercase hexadecimal using Node's
   built-in byte encoding. This is reversible encoding, not hashing or
   lowercasing the actual video identity; it avoids case-insensitive filesystem
   collisions. Keep the exact original ID in metadata and links.
3. Reuse the chosen transliteration foundation with a reviewed Latin profile and
   filename-only ASCII cleanup. No separate filename transliteration engine.
4. The slug is a hint, not an identity or exact copy of the current title.
   Renaming after title changes is optional; rule updates do not rename existing
   files automatically. A filename-only rename must not change public item bytes
   or break saved references.

Stable filenames make ingestion predictable; descriptive slugs improve review
but add sanitization rules. Hex is longer than Base32 but needs no additional
codec. ASCII slugs were chosen over Unicode filenames despite losing some
distinctions. Exact slug title source, delimiter, profile, cleanup, length limits,
UUID spelling/markers, source template and draft/publishable schemas are open.
Filename transliteration does not choose a Latin reading default.

## 3. Metadata, registries and filters

One public title is required for publication, often but not necessarily the
first lyric line. Preserve the original YouTube title internally as provenance.
Alternative titles and miscellaneous metadata use one flat list of searchable
tag strings, not typed tags or separate public alternative-title fields.

| Field | Selected semantics | Filter policy |
| --- | --- | --- |
| Composer/Haridasa and ankita/mudra | Separate optional registry-backed fields, with evidence-backed multiple values. Performer/channel are distinct. The user's term "kruti" denotes composer, not a new synonymous field. | One combined Composer/Ankita filter; both names/aliases independently searchable. |
| Composer/ankita relationship | Reviewed 1:1 library mapping with conflict validation. This is a library constraint, not a universal historical claim or authority to infer composer from a signature. | Exact registry relation/labels remain open. |
| Deity | Optional multi-value flat registry; reviewed aliases; preserve meaningful form distinctions. No automatic hierarchy expansion or inference from lyrics/composer. | Filterable. Saint/guru subject handling remains open. |
| Composition form | Optional multiple reviewed values, distinct from broad category. | Filterable. |
| Broad category | Optional multiple reviewed values; no automatic duplication/inference from form. | Filterable. |
| Narrative context | Optional reviewed labels plus an optional concise plain-text description. Not festival/occasion/customary-use metadata, translated meanings or verse commentary. | Labels filterable; description searchable, not a filter. |
| Tags | Flat strings, including alternative titles; no inferred semantic types. | Searchable only, never a filter. |
| Upload date | Retained source metadata, distinct from stable library-added date. | No upload-year filter. |
| Raga/tala | Structured fields/registries/detection deferred. | No initial filters. |

Registry entries use readable stable ASCII IDs separate from labels/aliases,
not UUIDs. Label corrections/translations do not change IDs; never regenerate
or reuse an ID for another entity. Validate collisions and references. Missing
optional classifications remain unclassified/Unknown where applicable.
Multiple values mean genuinely applicable classifications, not uncertain
alternatives. No new per-composition sub-item model is introduced.

Filters use OR within each field and AND across fields, together with text
search. Active filters remain visible/removable; Clear filters preserves the
query. Exact vocabularies, IDs, alias normalization/localization, field limits,
source coverage audit and schemas are not approved yet.

## 4. Review boundary and transliteration

### Source PR versus publication

Ingestion proposes new source Markdown, thumbnails and missing reviewed registry
values. Existing videos are not automatically refreshed. PRs review Kannada,
supplied Source Latin, metadata/provenance, classifications and draft flags.
PR checks validate those sources and applicable deterministic tooling fixtures.

**Actual item variants, public item JSON, indexes and packages are generated
only after approved merge. No PR variant previews.** Full generation and
structural/contract validation must succeed before deployment; failure preserves
the previous publication. Initial profile approval/sample review is a separate
technical gate, not a new human sign-off for each generated item/script.

Only global transliteration mapping/rule fixes are allowed. No manually
maintained generated variants, per-item/per-line overrides or video-specific
exceptions disguised as global rules. Preserve reviewed Kannada/source metadata
corrections; never alter correct Kannada to force a converter result. A global
rule change requires profile revision, representative regressions and full
post-merge publication validation.

### Foundation and target policies

Use TypeScript/Node.js and `@indic-transliteration/sanscript` with reviewed pinned
Indic Transliteration/common_maps data, not Python/hybrid conversion or
Aksharamukha. Pin both engine and mapping snapshot. Shared upstream mappings are
not independent linguistic confirmation; mapping names are not conformance proof.
No client runtime lyric converter is selected.

Publish canonical Kannada plus generated Devanagari, Telugu, Tamil, Malayalam,
Gujarati, **Bengali and Assamese separately**, Gurmukhi and Odia, and the six
required Latin profiles: ISO 15919:2001, IAST Kannada conventions, Hunterian
pinned Kannada, Baraha Kannada, ITRANS Kannada and Harvard-Kyoto Kannada
extensions. Source Latin is optional and separate.

- Tamil consonants use superscript distinction markers, not collapsed/plain
  consonants, subscripts or an unreviewed mixed-Grantha policy. This does not
  approve the whole upstream Tamil mapping or claim full reversibility.
- Where direct target equivalents are unavailable, use reviewed native-script
  approximations as the baseline. Marked exceptions need explicit approval;
  Tamil superscripts are the selected exception. No silent deletion or
  unreviewed foreign-script fallback.
- Preserve shared line/verse identities and test fonts, marker placement,
  selection, screen readers and ordinary-typing/highlight correspondence.
- No Latin recommendation/default before reviewed permitted side-by-side
  samples. No exact per-profile conversion has been approved or demonstrated.

Investigation found no Hunterian-named common_maps entry; an authoritative
Kannada reference remains unresolved. Existing `iso`, `iast`, Baraha, ITRANS and
HK map names do not prove the required Kannada profiles. Raw mapping inspection
also exposed missing/foreign-script short-vowel or vocalic-letter entries in
some target tables. These are coverage warnings, not pinned-runtime test results.
Aksharamukha was not selected; its inspected package metadata/license files also
need license clarification if reconsidered.

### Source Latin public boundary

Include supplied Source Latin publicly even when unsuitable, with explicit
suitability information; distinguish absence, completeness and alignment.
Unsuitable text is not selectable for reading/helper use or indexed as a
published reading variant. Suitable reading eligibility still requires complete,
corresponding source; alignment-dependent features require reliable mapping.
Never silently substitute/generated-fill a source selection.

This narrowly revises the old provenance-only rule. It does not expose original
raw descriptions, private evidence or other internal provenance. Rights and
attribution checks apply to unsuitable Source Latin too.

## 5. Interface localization

Translations are manually authored or AI-assisted and human-reviewed, not
automatically translated at runtime or supplied by a translation service.
Maintain one shared YAML source catalog per UI language, initially Kannada and
English. Generate native Android resources and bundled i18next outputs at build
time; do not edit the generated outputs manually.

Use a simple plain-text/named-placeholder/plural model with translator guidance,
not general ICU/rich text. Validate completeness, placeholder agreement,
language-specific plurals and platform escaping; exact schema/conversion rules
remain open.

- Web: `i18next` and `react-i18next`, both locales bundled and available offline,
  no runtime catalog network dependency.
- Android: native string/plural resources, AppCompat per-app locales and an
  AppCompatActivity host for API 26-32; platform integration on API 33+.
  Android/AppCompat owns locale preference; do not mirror it into DataStore.
  Account for locale-triggered recreation and `autoStoreLocales` disk access.
- Supported device/browser language initially, otherwise English; explicit local
  override remains independent of lyric script/Latin preference.
- Missing Kannada messages must not be hidden by silent fallback.
  React Aria's internal Kannada announcements need separate verification;
  i18next does not translate them automatically.

Exact catalog syntax, stable package pins, third-party announcements, preference
mechanics and OS backup behavior remain open.

## 6. Common publication, downloads and reuse

| Decision | Selected behavior and trade-off |
| --- | --- |
| Item artifact | Versioned JSON per video, containing metadata, canonical Kannada, all generated variants and supplied Source Latin/status. Gzip each item independently; retain it compressed locally. Exact public field whitelist remains open. |
| Transport | One common set of ZIP STORE bundles containing unchanged independently gzipped artifacts, read with built-in Android ZIP APIs and browser `fflate`. Persist individual members; safely discard temporary bundles. No separate platform bundles. |
| Integrity | Versioned JSON manifest, per-artifact SHA-256 and expected sizes, bounded decode/schema/domain checks, normal gzip/ZIP CRC checks. No detached publisher signatures selected. |
| Identity | Immutable hash-addressed objects; verify bytes, not filename/key claims. Hashes, not filesystem mtimes, determine reuse. No volatile item build timestamp/snapshot ID that forces unchanged items to change. |
| Discovery | Small static descriptor; fetch/revalidate full versioned manifest only when different, missing or invalid. Compare required hashes to actual valid local objects. |
| Bundling | Globally sort public artifacts by logical public-output changed-at with deterministic ties and bounded bundle sizes. No frozen membership/cohorts. A repacked ZIP does not force re-downloading unchanged members. |
| Planning | Permit bounded extra bytes to save requests, comparing encoded missing bytes, bundle sizes/membership and request savings. Show the selected transfer size including extra members. Numeric budgets/algorithm remain open; no optimality claim. |
| Retention | One active local snapshot plus one resumable target. No permanent previous local snapshot or automatic rollback. Failed updates leave the active version intact. |
| Verification | Full validation before activation; verify on use and validate indexes before search, plus bounded background audit. Verified in-memory bytes need not be rehashed on every interaction. No completion flag as proof of current integrity. |

Logical changed-at tracks generated-output hash changes, including global mapping
fixes, not a source file's modification time. Necessary snapshot generation and
update-recommended dates remain authoritative; reuse must not erase their
semantics. The recommendation is at least seven days after generation; a
successful no-newer-compatible check suppresses reminders locally for three days.
Failed checks do not. Content remains usable when reminders are due.

Both clients keep the active snapshot online/offline until explicit validated
update. Initial partial activation is prohibited. Isolated later damage retains
only independently verified capabilities with honest degraded state and repair.
Do not silently mix newer online items into the active library.

GC must preserve active, staged and live-reader/recovery references and personal
data. Reachability rules, journals, locks, atomic activation, multi-tab readers,
old-object cleanup and interrupted-target replacement are still to be designed.
Published-version retention is separate from local retention and remains open.

## 7. Platform storage and transfer execution

- Android: app-private compressed content files; Room structured personal state;
  DataStore small preferences except the AppCompat-owned UI locale.
- Web: Dexie/IndexedDB, separate content/control and personal databases; common
  compressed bytes stored as binary objects. Cache Storage is for the versioned
  application shell, not a duplicate lyric payload cache.
- Android user-started transfers: UIDT JobScheduler on API 34+, foreground
  service on API 26-33, sharing one Kotlin coordinator and durable journal.
  No WorkManager solely for downloads. System progress/cancel and explicit
  permission/restriction handling are required.
- Continuation is best effort, not guaranteed after force-stop, reboot or OS
  intervention. Retain verified progress for explicit same-version resume;
  never silently choose another target. Browser closure promises no completion.

No library is bundled in the APK. The Android gate depends on actual complete
validated content; Settings/recovery/list management and supplied previews remain
accessible. A skipped preference wizard cannot bypass preparation.

Personal favorites/lists/occurrences, practice/bookmarks/learning labels/recents,
preferences and the one most-recent recitation occurrence remain independent of
snapshot removal/activation. Exact schemas, migrations, occurrence IDs, history
limits and backup rules remain open. List transfer still includes only approved
list name/version/ordered references and user-written placeholder/fallback text;
not lyrics, ordinary library titles, progress or a full personal backup.

## 8. Search contract

### Matching

Every query term must match somewhere in eligible metadata or lyric lines;
order is not required, and different terms may match different fields/lines.
No automatic OR fallback or partial-term-results tier is selected.

Literal **contains** matching is required, not just full words/prefixes:
`vadiraja krishna` must match `dir sh` (`dir` inside `vadiraja`, `sh` inside
`krishna`). Valid short terms remain searchable literally.

Automatically include bounded approximate **fragment** matching as well as
whole-word matches and reviewed spelling equivalents. Use Unicode code points,
not UTF-16 code units, and specifically optimal string alignment (restricted
Damerau-Levenshtein): insertion, deletion, substitution and adjacent swap each
cost one, subject to OSA's overlapping-edit restrictions. Do not substitute full
Damerau, weighted phonetic costs or a library's generic fuzzy score.

| Query-term length after agreed normalization | Maximum OSA edits |
| --- | --- |
| 1-3 code points | 0: literal/equivalent matching, no fuzzy expansion |
| 4-8 code points | 1 |
| 9+ code points | 2 |

Limits are per term, not per complete query. Preserve AND when combining exact,
equivalent and fuzzy matches. No phrase mode, quote operators or query rewriting
initially. Punctuation, tokenization, case/diacritic normalization, candidate
bounds, input limits and exact fragment-boundary semantics remain open.

Metadata fields and lyrics have different weights; metadata matches remain above
lyrics-only results. The user deferred field priorities/numbers, exact-versus-
approximate ordering, duplicate-representation handling and tie-breaking. No
ranking profile is selected here.

Show selected-script matching excerpts, metadata-only context and stable
verse/line destinations. Highlights require reliable correspondence and must not
split displayed clusters even though distance uses code points. Source Latin
eligibility/alignment rules still apply.

### Build, representation and execution

The Node publisher builds **one global portable index as compact gzipped JSON**,
with dictionaries, numeric arrays, field/variant identities and lyric anchors,
after approved merge. This is publication build time, independent of APK
compilation. Clients load precomputed structures, not build a search index from
raw lyrics.

Implement query semantics independently in Kotlin and TypeScript, tested
against shared fixtures and a simple scan reference. Candidate generation must
not omit matches that exact verification would accept. No production full scan,
local platform-specific index building, SQLite/WASM engine, binary codec,
FlatBuffers or custom binary layout selected.

One global index was explicitly chosen over item buckets/per-item/term shards:
any relevant change may require transferring the complete changed index.
Unchanged lyric payloads remain reusable. JSON reuses the selected tooling but
has unmeasured parse/materialization peaks; do not silently introduce sharding
or relax search to solve memory/performance failures.

Browser loading/decompression/parsing/validation and search run in a dedicated
Web Worker, not the PWA service worker or main thread. Keep its working index
there and return bounded display results. Typed messages, error/restart handling,
cooperative cancellation and latest-query stale-result rejection are required.
Per-tab duplicate memory remains a risk. Android CPU work runs off the UI thread
using the selected coroutines.

For an unprepared online PWA, require **Load search with download size** before
fetching a missing/new index. Site entry, opening Search or typing is not consent.
Discovery/manifest requests can establish identity/size first; unavailable size
is an explicit information error, not an invented zero. Reuse a valid matching
cached index. Loading this index neither downloads all lyric payloads nor
activates an offline snapshot. Prepared clients use their active index.

### Scheduling and revised performance

Use **250 ms trailing debounce** after committed text edits. Enter flushes it;
filter changes run immediately. Wait for IME composition completion, keep input
responsive, cancel obsolete work and reject stale results. No-results is only a
successful current-query outcome, never a loading/error substitute.

**PERF-01 is explicitly revised from 300 ms to 550 ms p95**, including debounce,
timer/worker scheduling, lookup/OSA, filters/ranking, selected-script excerpts,
reliable highlights and visible rendering. Measure after index loading with a
representative 10,000-item all-script corpus on mid-range Android and desktop
browser, online and offline. The nominal remaining budget after 250 ms is about
300 ms, not an additional excluded timing window.

No performance is measured yet. LCP <=2.5 s, INP <=200 ms and CLS <=0.1 remain
unchanged. Cold download/loading, peak memory and cancellation need separate
evidence; index-only timings do not prove the target.

### Alternatives investigated

| Alternative | Reason not selected as the production strategy |
| --- | --- |
| MiniSearch | Useful token/prefix/fuzzy/boost tooling, but not a demonstrated drop-in code-point OSA fragment implementation or common Kotlin runtime. Defaults lowercase and split punctuation. |
| FlexSearch | Partial indexing/worker capabilities; default normalization, letter deduplication and punctuation filtering cannot replace reviewed profile rules. Encoder fuzziness does not establish the OSA contract. |
| Fuse.js | Modified Bitap scoring and documented per-term pattern limits are not the selected OSA contract. Current upstream token search can AND across fields, but that alone does not establish full conformance. |
| SQLite FTS5 | Trigram full-text queries do not match fragments under three Unicode characters. `sh` needs another path; OSA remains extra logic and browser WASM adds integration cost. |
| Local per-platform indexes | Additional build/cache lifecycles and candidate-completeness work despite common downloaded input. |
| FlatBuffers/binary codecs | Potential representation benefits, but additional tooling/validation; JSON selected before benchmark evidence. |
| Production full scan | Useful correctness oracle; greatest per-query work and no established target-hardware performance. |

This is documentation research, not a benchmark or proof that these libraries
cannot be adapted. Exact helper libraries remain open.

## 9. Repository, build and test organization

Four public repositories divide Website/PWA, native Android, Shared contracts/UI
resources, and Library sources/ingestion/publication. These are approved
boundaries and tool choices, not completed application implementation, CI,
toolchain pins, or deployment. New repositories were created and bootstrapped with hygiene workflows, security
policies, issue/PR templates, and Dependabot for GitHub Actions. Their bootstrap
commits/pushes were authorized setup actions; this task makes no commits or pushes.

| Decision | Selection and rationale/trade-off |
| --- | --- |
| Repository organization | Separate Website, Android, Shared and Library rather than a monorepo; responsibilities and deployments remain independently reviewable. |
| Shared distribution/scope | Website, Android and Library pin Shared submodules independently, not moving branches or forced lockstep. Shared holds JSON schemas, normative specs, portable fixtures/results and change notes; excludes app runtimes, migrations, lyric content and generated Library publications. |
| Shared layout/catalogs | Material roots `schemas/`, `specs/`, `fixtures/`, `locales/`, `docs/`, `.github/`; normative authority in specs, explanations in docs. Reviewed YAML UI catalogs live in Shared/locales, not per-platform sources. Translation-only commits do not imply a public data-format change. Exact subfolders remain open. |
| Shared generator/outputs | Shared owns/runs the build-time UI generator. Commit derived Android resources and web bundles with catalog/generator changes in the same PR. Shared CI must regenerate/check exact matches; consumer builds use their pin, not an archive or generator. Outputs are not hand-maintained. Deterministic toolchain/paths and actual CI remain open. |
| Website ownership/layout | Web app and web automation in `web/`; Shared pin in `shared/`; guidance in `docs/` and `.github/`; `tools/` only for Website automation. No `apps/`/`content/` container. Website consumes published Library artifacts only, never Library source. |
| Android modules/layout | AndroidApp starts with `app` and pure-Kotlin `core`, dependency `app -> core`; no app/platform dependency from core and no initial feature/infrastructure Gradle modules. App owns Compose/navigation/ViewModels, Room/DataStore and platform adapters; core owns portable models/algorithms/validation, including search/transfer planning where suitable. Check Android/JVM API compatibility. Hybrid app layout: feature presentation plus shared data/platform/navigation/di/ui, not layer-first buckets or feature-owned data slices; avoid cross-feature internals and generic dumping grounds. Core is Android-owned, grouped by responsibility. |
| Library ownership/layout | Library owns reviewed Markdown, registries, catalog-specific settings, source assets/attribution, ingestion, validation, Node/TS publisher and tests. Keep credentials out of settings. Roots: `library/`, `registries/`, `settings/`, `assets/`, `tools/`, `shared/`, `docs/`, `.github/`; no `content/`. Sources and publisher are versioned together; variants only post-merge. |
| Library tooling | One private Node/TS package and lockfile; separate ingestion, source-validation and publication entrypoints, no private workspaces/npm publication. Ingestion uses Node/TS rather than Python and runtime-validates external responses. |
| Node package manager | npm, a committed lockfile per Node repository and locked `npm ci`; reject pnpm/Yarn/Bun and cross-repository workspaces. Node/npm pins and install-script policy remain open. |
| Web code organization | One Vite app with `web/src/app`, `features`, `data`, `core`, `workers`, `ui`, `i18n`; keep heavy index work in its worker and React/Context/Dexie ownership. No extra app repo/workspace/runtime. |
| TypeScript tests | Vitest for Website, Shared build tooling and Library unit tests; type-check separately. Node for tooling/pure algorithms; jsdom + React Testing Library/user-event for isolated component interaction. |
| Browser E2E | Playwright Test for Website; Chromium plus capability-specific Firefox/WebKit. Playwright service-worker automation is Chromium-only; emulation is not physical/installed-PWA proof. |
| Test environments | Use Playwright for real workers, IndexedDB, service-worker/offline, multi-window, layout/focus; do not initially add happy-dom or Vitest Browser Mode. Android uses JVM tests and instrumentation for platform, Compose, Room, lifecycle/background; no default Robolectric. |
| Risk-based process | Deterministic unit/contract checks on owning-repo PRs; Shared fixtures are cross-implementation oracle, consumers run applicable fixtures. Consumer CI runs the previous pinned Shared revision only when claiming compatibility. Library source PRs run source/tooling fixtures only; full generation/validation/consistency post-merge, failure preserves prior output. Website PRs typecheck/lint/Vitest/build/critical Playwright; broad matrix nightly/pre-release. Android PRs JVM/lint/instrumented smoke on API26/current target; pre-release API33/34 boundary and physical devices. |
| Performance/release evidence | Measure 550 ms p95 including 250 ms debounce, cold load and memory on representative devices on scheduled/pre-release cadence, not a flaky PR gate. Required checks are branch-protection gates; quarantine flakes only with tracked owner/expiry. Record exact commands/results, Shared/Library pins and unverified criteria. These are future checks, not existing app CI. |

Supersession: the later four-repository decision replaces earlier one-repository
assumptions. Later explicit choices place ingestion and publisher in Library,
superseding their earlier Website placement. UI catalogs/generator/resources
expand Shared beyond contracts/specs/fixtures, and independent Library Pages
supersede treating the root Website as the only publication site. Earlier approved
choices remain in force unless explicitly superseded; no source migration is
authorized by this record.

| Repository | Public repository | Responsibility and site |
| --- | --- | --- |
| Website | [DaasaVaani/DaasaVaani.github.io](https://github.com/DaasaVaani/DaasaVaani.github.io) | PWA at [https://daasavaani.github.io/](https://daasavaani.github.io/), base `/`. |
| Android | [DaasaVaani/AndroidApp](https://github.com/DaasaVaani/AndroidApp) | Native app and core; no app implementation yet. |
| Shared | [DaasaVaani/shared](https://github.com/DaasaVaani/shared) | Contracts/specs/fixtures, UI catalogs, generator and committed UI resources. |
| Library | [DaasaVaani/library](https://github.com/DaasaVaani/library) | Reviewed sources/ingestion/publisher; generated site [https://daasavaani.github.io/library/](https://daasavaani.github.io/library/). |

Dependency direction: Shared -> Website, Shared -> Android, Shared -> Library;
Shared must not depend on consumers. Website and Android consume validated,
published Library artifacts only. Each consumer updates its Shared pin
independently. Website submodule wiring (`.gitmodules` and `shared` gitlink) is
staged locally but not committed; every consumer currently pins Shared commit
`5a2446c31ffb97c9899a7ba3a287e58b2b2eb490`. The `library/` directory is absent and `settings/` is empty in this Website
checkout; no Library source files are present here. Legacy-looking Markdown was
reported in a separate sibling `WebsiteLibrary\dasasahitya` path, but has not
been reviewed or established as authoritative. Source assessment/migration is
pending and unauthorized; this task does not inspect or change sibling repos. Library Pages and Website-side
publication integration are not implemented.

Library capacity, bandwidth, retained versions, exact layouts/toolchains,
compatibility/release workflows and `/library/` service-worker behavior remain
open. Keep Website and Library bases independent; reserve `/library/` for content
and validate actual worker scope rather than claiming fetch exclusions reduce it.

## 10. Hosting, routing and shell updates

The Website is the organization-root Pages site `https://daasavaani.github.io/`,
base `/`, with configurable canonical base. Library publishes independently from
its own repository at `https://daasavaani.github.io/library/`; Website has no
Library source checkout/submodule dependency. The Website repo is
`DaasaVaani/DaasaVaani.github.io`. Do not assume old Pages URLs redirect.

Root-site validated deployment, application routes and signed association are
not implemented. Publish `/.well-known/assetlinks.json` in the same validated
public output; it binds application ID and release signing-certificate SHA-256,
not an APK checksum. App Links handoff remains subject to platform/user/source-
browser behavior; browser and explicit Open in app fallbacks remain required.
Hash fragments stay outside initial host requests but are not encryption.

Use `vite-plugin-pwa` with Workbox GenerateSW for the Website shell. Content
integrity, preparation, activation and storage remain with the coordinator/IndexedDB,
not automatic service-worker Library precaching. Assert required offline fonts and
lazy chunks are included, including assets otherwise omitted by size limits.
No HTML fallback for manifest/binary errors or unrelated project routes.

Notify when new application code is ready, then use normal worker activation
after the old worker has no controlled windows. No forced `skipWaiting`,
mid-session activation/reload or initial coordinated Update-now mechanism.
Closing all controlled tabs/PWA windows may be necessary; reload alone is not a
guarantee. A root worker can control unrelated project-site windows, so route
exclusions do not by themselves remove activation delays. Code updates preserve
personal data/compatible active content and never authorize Library replacement.

The current Website deployment stages only a placeholder. A future Website
pipeline publishes its validated root PWA; a separate Library pipeline publishes
validated generated public output, never source roots. Neither Library Pages nor
Website-side integration is implemented. Signing/application ID, routes, deployment
settings, safe migration, capacity and retention remain open.

## 10A. Decisions approved in the gap-closure pass

These individually approved decisions follow the full gap analysis. Where one
supersedes earlier text elsewhere, the entry says so and the user's decision
prevails. Each stable ID appears in section 12.

### Documentation, legacy content, rights and versioning

| Decision | Selected behavior and consequences |
| --- | --- |
| Documentation authority (`documentation-authority`) | Split by statement type with one owner per fact; other repositories link, not copy. Website owns product requirements/acceptance scenarios and, until final approval, this record (it then moves to Shared). Shared owns normative specs, fixtures and UI-catalog rules, cited at a pinned revision. Library owns authoring, ingestion, publisher operations and Pages publication. AndroidApp owns Android architecture, storage, release and signing. Website owns web architecture, browser lifecycle, hosting and root deployment. Cross-repo changes start as a tracking issue in the owning repository with linked issues in affected ones. Migration of existing text remains to be done. |
| Legacy content (`legacy-content-migration-approach`) | The legacy `dasasahitya` files are an unreviewed reference. Each item is re-ingested from YouTube and reviewed; unresolved items stay drafts. No auto-conversion, guessed video IDs/provenance or inferred Kannada/Latin correspondence. Nothing has been moved or published. |
| Rights gate (`rights-attribution-gate`) | **User decision: no rights/attribution gate.** No per-item rights status, publication gate or public attribution-notice contract. This supersedes earlier rights-review text; [content-rights.md](https://github.com/DaasaVaani/library/blob/main/docs/content-rights.md) and affected requirements are reconciled accordingly. Raw descriptions and internal evidence remain excluded from public artifacts. Provider terms for stored YouTube metadata are still to be checked before first ingestion. |
| Versioning (`publication-versioning-model`) | Format major/minor plus a required-capability list. Clients support only known majors, ignore newer optional fields within a major, and treat unknown required capabilities as incompatible. An incompatible publication never replaces the active snapshot; the client says a newer client is needed. Independent of Shared commits/tags. |
| Capability vocabulary (`capability-vocabulary`) | A small closed vocabulary registered in Shared (for example `index-v1`, `variant-profiles-v1`, `source-latin-v1`; names to be defined with schemas). A new capability is implemented by both clients before any publication may require it. No optional list. |

### Toolchain

| Decision | Selected behavior and consequences |
| --- | --- |
| Node line (`node-runtime-line`) | Node 24 (`>=24.22 <25`), npm 11.19.1 via `packageManager`. Re-check at Node 26 Active LTS on 2026-10-28. |
| Version baseline (`toolchain-pins`) | Delegated to the assistant and checked against the npm registry on 2026-10-21. TypeScript 6.0.3 (not 7: typescript-eslint peers below 6.1), typescript-eslint 8.71.2, ESLint 10.12.0, Vite 8.3.4, vite-plugin-pwa 2.0.0 with Workbox 7.4.1, React and ReactDOM 19.3.0, React Router 7.18.4, Dexie 4.4.6, React Aria Components 1.22.1, i18next 26.4.4, react-i18next 17.0.16, Ajv 8.20.0, Vitest 5.0.4, jsdom 30.1.2, React Testing Library 16.3.3, Playwright 1.64.0, yaml 2.9.1, unified 11.0.5, remark-parse 11.0.0, remark-frontmatter 5.0.0, `@indic-transliteration/sanscript` 1.3.3 (CommonJS; needs interop). Android, **from research and not registry-verified**: JDK 17, Gradle 9.8.2, AGP 9.3.0 (9.4.0 only after GA is confirmed), Kotlin 2.4.21 with the Kotlin-bundled Compose compiler plugin, Compose BOM 2026.08.00 (unconfirmed), Navigation 3 1.2.0, Room 2.8.5 with a matching KSP (exact string unconfirmed), Koin 4.2.2 with compiler plugin 1.2.1, compileSdk 37, targetSdk 36, minSdk 26. Policy: `.nvmrc`, `engines` and `packageManager` per npm repo; `npm ci` only; major bumps of Vite, Vitest, TypeScript, React and React Router are manual-review PRs; Dependabot grouped per repo; no prereleases. The research report contained wrong versions, so re-verify every pin when its manifest is first created. |

### Sources, registries and transliteration

| Decision | Selected behavior and consequences |
| --- | --- |
| UUID format (`uuid-format`) | UUIDv4 from `crypto.randomUUID()`, lowercase hyphenated; uppercase and the nil UUID are rejected; unique within a video including across verses. |
| ID marker (`lyric-id-marker`) | Inside fenced lyric blocks each line is prefixed `[uuid] ` (one space); stripping removes only that prefix and preserves the rest byte-for-byte. Verse headings carry their verse ID the same way. Text that itself begins with a bracketed UUID is rejected as ambiguous. |
| Filename (`filename-shape-and-slug-rules`) | `<lowercase-hex-of-video-ID-bytes>--<slug>.md`. Slug: public title through the reviewed Latin profile, lowercase ASCII, other character runs to one hyphen, trimmed, at most 60 characters on a character boundary, fallback `untitled`. Generated once; never auto-renamed. |
| Drafts (`draft-publishable-model`) | No status field. An item is publishable exactly when it passes the full publishable schema; otherwise it is a draft excluded from all public artifacts. Ingestion leaves required fields absent rather than guessing. Risk: a complete-looking but uncertain lyric publishes unless reviewers withhold merge. |
| Registries and settings (`registries-settings-split`) | `registries/` holds classification entries (stable ASCII IDs, labels, aliases, relations). `settings/` holds identity/branding, UI languages and defaults, enabled lyric scripts, which registries are filters and their order, channel/import configuration and generation options. Credentials in neither. |
| Profile definition (`transliteration-profile-definition`) | Each Latin profile and target-script rule set is a reviewed, versioned file in Shared (a custom scheme, or a pinned upstream scheme plus explicit overrides) loaded as sanscript custom schemes, with Shared fixtures pinning output. Changes are global revisions only; only Library converts. Declarative rewrite hooks only through a new decision. |
| Hunterian (`hunterian-reference-approach`) | The user provides or approves the authoritative Hunterian Kannada reference. Authoring that profile is **blocked** until then. |
| Source Latin (`source-latin-representation`) | Item-level presence, `suitable` and `complete` flags plus per-line text keyed by canonical line UUID (the key is the alignment; a missing key is a gap). No per-line flags or word alignment. Mismatched line structure makes the whole item unsuitable and unselectable. |
| Explore (`explore-browse-scope`) | Explore browses composer/ankita, deity, category and other enabled filter registries; tags stay searchable only. EXP-01 is reworded from "theme/category/tag" to "category". |

### Public contracts, search and lifecycle

| Decision | Selected behavior and consequences |
| --- | --- |
| Variant layout (`item-variant-layout`) | Ordered `lines` `{id, kn}`, ordered `verses` `{id, lineIds}` and `variants` `{variantId: [text per line]}` parallel to `lines`. A missing variant or length mismatch fails publication. Variant IDs come from the Shared profile files. |
| Metadata whitelist (`item-metadata-whitelist`) | Closed list enforced by `additionalProperties: false`: video ID, public title, flat tags, registry IDs only (no embedded labels), optional narrative description, upload date, library-added date, thumbnail reference, Source Latin block. Original titles, raw descriptions and private evidence never public. Labels come from the registry index. |
| Descriptor (`discovery-descriptor-design`) | The only mutable file is `descriptor.json`: format major/minor, required capabilities, `manifestPath`, `manifestSha256`, `manifestSize`, `generatedAt`, `updateRecommendedAt`. The manifest is immutable at a hash-addressed path. Incompatible formats stop before manifest download. Manifest and objects are uploaded before the descriptor. |
| Manifest layout (`manifest-layout`) | Artifacts nested in bundles: `bundles[] {path, sha256, size, artifacts[] {path, sha256, size, kind, changedAt}}`. Bundles partition artifacts; reuse is by artifact SHA-256, never by bundle. |
| Bundle sizing (`bundle-sizing-rule`) | Sort by `changedAt` (ties by path) and cut into bundles of a fixed artifact count N (starting guess 50, to be measured). Count alone does not bound bytes, so a secondary byte cap is still needed (value open). This revises the earlier "bounded bundle sizes" wording. |
| Thumbnails (`thumbnail-publication`) | One fixed-size WebP per item, generated after merge from the source image in the ingestion PR, published as a `thumbnail` artifact. The encoder dependency (for example a native one), dimensions and quality are open and need a license/install-script review. |
| Normalization (`search-normalization`) | Applied identically to index and query: Unicode NFC, locale-independent case folding, strip punctuation and ZWJ/ZWNJ, collapse whitespace, no diacritic folding. To verify with fixtures: joiner stripping may merge distinct Kannada forms; a plain-ASCII query will not match diacritic-bearing Latin profiles except by fuzzy edits. |
| Ranking (`search-ranking`) | Integer-only: match tier (exact, prefix, substring, fuzzy), then field weight (title, tags, composer/ankita, lyric lines), then library-added date newest first, then video ID. No floating point or recency boost. Weights and excerpts open. |
| Index structure (`search-index-structure`) | One global gzip JSON index: sorted token dictionary with delta-encoded postings; dictionary scan yields candidate tokens, then postings are intersected. Must be measured against PERF-01 on low-end hardware before freezing. |
| Index coverage (`search-index-coverage`) | Canonical Kannada, the six Latin profiles, and Source Latin only when suitable and complete, with variant tags. Other Indic target scripts are not indexed, so queries typed in them are out of initial scope. |
| Planner (`download-planner-strategy`) | Bundles and individually fetchable artifacts are both published; the planner picks the cheaper option within a bounded extra-byte budget and shows the transfer size. Cost: every artifact is stored twice on Pages, roughly doubling site size against the 1 GB limit. |
| Activation (`snapshot-activation`) | Stage and fully validate, then one atomic active-pointer switch (Room transaction; single IndexedDB transaction). Readers hold leases; superseded objects are collected only when none remain. Failure leaves the previous snapshot intact. |
| Multi-tab (`web-multi-tab-coordination`) | Web Locks elects the single updater; BroadcastChannel notifies other tabs, which offer a non-forced reload. Browsers lacking either API get an explicit "updates disabled" fallback. |

### Personal data, links and routes

| Decision | Selected behavior and consequences |
| --- | --- |
| References (`personal-reference-model`) | Personal records store `{videoId, lineId}`, resolved on read, with an explicit unresolved state. No redirects, positional identity, reanchoring or stored lyric text/titles. |
| Migrations (`personal-migrations`) | Integer schema versions; every bump has a forward-only tested migration; no destructive fallback; a database newer than the app is refused. Downgrading means reinstalling. |
| History (`history-and-occurrence-rules`) | Recents keep the last 50 distinct items; each list entry has its own UUIDv4 occurrence ID; exactly one most-recent recitation is kept. The cap and what counts as a "recent" are to be confirmed. |
| Backup (`personal-backup-policy`) | The user answered "allow all": keep list transfer, allow Android Auto Backup for the personal database only (never content), and add in-app full personal export and import on both platforms. This creates new requirements (see the requirements file) and a privacy disclosure that Auto Backup copies data to the user's Google account. Interpretation to be confirmed. |
| List payload (`list-payload-encoding`) | Versioned JSON, raw deflate, base64url, carried in the hash fragment as `#/list?d=<payload>` so it never reaches host requests. The exported file uses the same payload in a versioned header. Decoding bounds inflated size and validates before mutation. Open: link-length limit, file extension/header, device verification that App Links deliver the fragment. |
| Routes (`route-grammar`) | `#/`, `#/item/<videoId>[?line=<uuid>]`, `#/list?d=`, `#/search?q=`, `#/library`, `#/lists`, `#/settings`. Unknown routes show a generic not-found page, never an HTML fallback. All parameters are validated as untrusted. No language or version prefix. |

### Release, hosting and process

| Decision | Selected behavior and consequences |
| --- | --- |
| Recovery (`publication-recovery`) | Publish a corrective newer publication; clients never roll back. Pre-activation validation and the deploy gate stop structural failures. Accepted risk: content that validates but is wrong stays active until clients update. |
| Pages retention (`pages-object-retention`) | Each deploy holds only the current publication, rebuilt in full; unchanged items regenerate identical hash-addressed objects. No grace period and **no size-budget gate**, so capacity is discovered only when Pages rejects a deploy. Clients must re-plan from the current descriptor when planned objects return 404. |
| Publish workflow (`library-publish-workflow`) | On push to `main`: checkout with the pinned Shared submodule, `npm ci`, validate sources, generate into staging, run a client-style validator, deploy via the standard Pages action with the descriptor last. A concurrency group serializes runs. Any failure leaves the live site untouched. |
| Application ID (`android-application-id`) | `in.daasavaani.app`, permanent once released. The `in.` prefix conventionally implies owning `daasavaani.in`, which is not established; the ID claims nothing. |
| Signing (`android-signing-approach`) | One self-managed release keystore outside the repo and logs, with a documented backup and no key in CI. Key loss blocks updates. A later Play App Signing key is added as a second fingerprint. |
| `assetlinks.json` (`assetlinks-ownership`) | The Website owns and deploys the file; AndroidApp owns its values. Changes follow the tracking-issue process. Website CI validates structure and application ID. Multiple fingerprints supported. |
| Fonts (`font-strategy`) | System fonts only on both clients, replacing the earlier assumption of bundled/licensed offline fonts. Glyph coverage and conjunct shaping depend on the device, so rendering of Odia, Gurmukhi, Bengali/Assamese, Tamil markers and Latin diacritics may fail on some devices and needs real-device checks. |
| Accessibility (`accessibility-baseline`) | Best effort with no formal conformance target. Existing accessibility requirements and scenarios remain the pass/fail bar; no WCAG claim and no mandatory manual matrix or audit. |
| Test matrix (`release-test-matrix`) | Latest stable Chromium and the latest Android emulator only. Unverified and to be stated in release evidence: Firefox, WebKit/Safari PWA behavior, Android API 26 to 35, real devices, per-script rendering, App Links on devices, low-end performance. Supported-platform claims must not exceed what was run. |
| Ingestion credentials (`ingestion-credentials`) | Ingestion runs locally only. The YouTube Data API key lives in an untracked local environment variable or file, restricted to API v3, never in repo files, logs, PRs or CI. The local run opens the review PR and never commits to `main`. A runbook is needed. |
| Observability (`observability-policy`) | No telemetry, crash reporting, analytics or diagnostics export. Users report through GitHub issue forms. Errors stay explicit in the UI. |
| Branch protection (`branch-protection-policy`) | Protect `main` in all four repositories: PRs and named checks required, no force pushes or deletions, admins not exempt, no required second reviewer. Self-approval is not independent review. Not yet applied; applying it needs explicit authorization. |

## 11. Remaining approval and implementation gates

No gate is declared fully closed by this interim record. Section 10A closed
many items below; the table lists what is still open.

| Area | Still required |
| --- | --- |
| D1 foundation | Android pins to verify (BOM, KSP, AGP 9.4.0), per-repository bootstrap/check commands, exact manifests. Node/npm and npm package pins are decided in 10A but re-verified when manifests are created. |
| D2 sources/taxonomy | Actual channel metadata coverage audit; exact schemas/field cardinalities not settled, vocabularies/aliases, library-added date/backfill policy, legacy inventory and mapping evidence. UUID, markers, filenames, drafts and the registries/settings split are decided. |
| D3 language/localization | Hunterian reference (from the user), profile files and expected fixtures, permitted samples/default review, target approximation tables, YAML catalog conversion/escaping/plurals, React Aria Kannada messages, real-device script rendering with system fonts. |
| D4 search/public/transfer | JSON Schema dialect and exact types, capability names, bump rules, supported-version window, punctuation set and Unicode pin, tokenization for Kannada, ranking weights and excerpts, query/size/memory bounds and the PERF-01 feasibility measurement, link-length limit, file header/extension. |
| D5 lifecycle/personal | Journal format, lease expiry, GC timing, interrupted targets, repair/audit scheduling, planner byte/request budgets, bundle count N and byte cap, personal schemas, recents semantics, export/import format, navigation/pending destinations and recitation details. |
| D6 import/assets | API pagination/quota, batches/pending-PR reconciliation, taxonomy proposals, image encoder dependency and thumbnail dimensions, local ingestion runbook, provider-terms check for stored YouTube metadata. |
| D7 release/hosting | Capacity measurement against 1 GB/10 minutes with doubled artifacts, bandwidth, worker behavior, App Links path patterns and device fragment verification, key backup procedure, rulesets application (needs authorization), release evidence. |

Remaining UI decisions include exact theme/spacing/column tokens, fonts, player,
file/sharing/screen-awake libraries, accessible navigation/reordering and their
failure paths. Selected Material 3/React Aria do not choose all of these.

Continue the questionnaire, reconcile the complete contracts and requirement
traceability, and obtain overall final approval. Only then produce the final
coding-ready implementation specification. Application coding remains separate.

## 12. Questionnaire coverage

These stable session selection IDs identify the individually approved choices
covered above; they are not public payload keys or software version numbers.

- Repository, build and test: `repository-organization`, `shared-contract-distribution`, `shared-contract-repository-scope`, `ui-catalog-repository-location`, `website-repository-top-level-layout`, `library-repository-separation`, `library-repository-source-scope`, `content-publisher-repository-ownership`, `library-shared-dependency`, `ingestion-repository-ownership`, `library-repository-top-level-layout`, `library-independent-pages-deployment`, `shared-repository-top-level-layout`, `android-gradle-module-structure`, `android-package-organization`, `repository-names-and-bootstrap-authorization`, `web-code-organization`, `ui-catalog-generator-ownership`, `ui-generated-resource-distribution`, `ui-generated-resource-update-workflow`, `ingestion-implementation-language`, `library-node-package-structure`, `node-package-manager`, `typescript-unit-test-runner`, `web-e2e-framework`, `typescript-test-environments`, `android-test-environments`, `testing-process`.
- Client foundation: `client-architecture`, `web-language`, `web-build`,
  `cross-platform-sharing`, `android-structure`, `android-di`,
  `android-navigation`, `web-router`, `web-url-strategy`, `web-state`,
  `android-ui`, `web-ui`, `web-styling`.
- Storage/network/contracts: `android-storage`, `web-storage`, `http-clients`,
  `android-json`, `shared-schema-validation`.
- Source and identities: `source-layout`, `source-lyric-body`,
  `source-id-scheme`, `content-anchor-migration`, `lyric-structure`,
  `source-filenames`, `source-filename-title-updates`,
  `source-filename-slug-characters`, `source-filename-id-encoding`,
  `source-filename-slug-generation`, `source-markdown-parser`, `yaml-parser`.
- Metadata/filter policy: `composer-ankita-metadata`, `deity-metadata`,
  `situation-metadata-scope`, `narrative-context-representation`,
  `raga-tala-scope`, `form-category-metadata`, `form-category-cardinality`,
  `title-model`, `tag-model`, `tag-filter-policy`, `upload-year-filter`,
  `composition-form-filter`, `composer-ankita-filter`,
  `narrative-context-filter`, `classification-registry-id-style`.
- Generation/renderings: `variant-generation-review`, `variant-corrections`,
  `transliteration-foundation`, `publisher-language`, `tamil-consonants`,
  `bengali-assamese-renderings`, `indic-gap-policy`, `source-latin-publication`.
- Localization: `translation-authoring`, `web-i18n`, `android-i18n`,
  `translation-source`, `translation-catalog-format`.
- Publication: `common-library-compression`, `library-codec`,
  `lyric-transfer-bundles`, `common-bundle-set`, `bundle-container`,
  `manifest-format`, `artifact-integrity`, `item-serialization`,
  `item-variant-grouping`, `incremental-artifact-reuse`,
  `downloaded-object-store`, `verification-lifecycle`,
  `manifest-discovery-bundling`, `bundle-download-planner`,
  `local-snapshot-retention`, `android-background-downloads`,
  `android-transfer-execution`.
- Search: `search-field-weighting-constraint`, `search-term-combination`,
  `search-substring-matching`, `search-typo-tolerance`, `search-fuzzy-scope`,
  `search-fuzzy-units`, `search-edit-distance-model`, `search-fuzzy-limits`,
  `search-phrase-feature`, `search-architecture`, `search-index-partitioning`,
  `search-index-encoding`, `web-online-search-index-fetch`,
  `web-search-execution`, `search-typing-schedule`, `search-performance-target`.
- Hosting/shell: `app-links-hosting`, `pwa-tooling`, `web-update-policy`.
- Gap-closure pass (10A): `documentation-authority`, `legacy-content-migration-approach`, `rights-attribution-gate`, `publication-versioning-model`, `node-runtime-line`, `toolchain-pins`, `uuid-format`, `lyric-id-marker`, `filename-shape-and-slug-rules`, `draft-publishable-model`, `registries-settings-split`, `transliteration-profile-definition`, `hunterian-reference-approach`, `source-latin-representation`, `item-variant-layout`, `item-metadata-whitelist`, `discovery-descriptor-design`, `manifest-layout`, `bundle-sizing-rule`, `thumbnail-publication`, `capability-vocabulary`, `search-normalization`, `search-ranking`, `search-index-structure`, `search-index-coverage`, `download-planner-strategy`, `snapshot-activation`, `web-multi-tab-coordination`, `personal-reference-model`, `personal-migrations`, `history-and-occurrence-rules`, `personal-backup-policy`, `list-payload-encoding`, `route-grammar`, `publication-recovery`, `pages-object-retention`, `library-publish-workflow`, `android-application-id`, `android-signing-approach`, `assetlinks-ownership`, `font-strategy`, `accessibility-baseline`, `release-test-matrix`, `explore-browse-scope`, `ingestion-credentials`, `observability-policy`, `branch-protection-policy`.

## 13. Investigation references

References support the reasoning, not approved package pins or test evidence.

- [Koin compiler plugin](https://insert-koin.io/docs/setup/compiler-plugin/) and
  [compile safety](https://insert-koin.io/docs/reference/koin-compiler/compile-safety/).
- [Jetpack Navigation 3](https://developer.android.com/guide/navigation/navigation-3)
  and [Koin Navigation 3 APIs](https://insert-koin.io/docs/reference/koin-compose/navigation3/).
- [Sanscript.js](https://github.com/indic-transliteration/sanscript.js),
  [common_maps](https://github.com/indic-transliteration/common_maps) and
  [Aksharamukha](https://github.com/virtualvinodh/aksharamukha-python).
- [Android app languages](https://developer.android.com/guide/topics/resources/app-languages).
- [MiniSearch](https://github.com/lucaong/minisearch),
  [FlexSearch encoder](https://github.com/nextapps-de/flexsearch/blob/master/doc/encoder.md),
  [Fuse fuzzy search](https://github.com/krisk/Fuse/blob/HEAD/docs/fuzzy-search.md),
  [Fuse token search](https://github.com/krisk/Fuse/blob/HEAD/docs/token-search.md),
  [SQLite FTS5 trigram tokenizer](https://www.sqlite.org/fts5.html#the_trigram_tokenizer).
- [FlatBuffers](https://github.com/google/flatbuffers) and
  [kotlinx.serialization alternative formats](https://github.com/Kotlin/kotlinx.serialization/blob/master/docs/formats.md).
