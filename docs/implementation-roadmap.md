# Implementation roadmap

**Status: staged implementation authorized; initial fixture milestone only.**
Use [requirements](requirements.md), [current design](design-decisions.md),
[architecture gates](architecture.md) and the
[Shared specification](https://github.com/DaasaVaani/shared/blob/main/docs/implementation-specification.md).
No source migration or live API ingestion is authorized. Remaining production
gates must close before their owning slices; no phase is globally complete.

Publication requires exact main checks, successful deployment and live HTTPS
verification. A preflight pass or main push alone is not deployment evidence.
The [guarded manual-main recovery](maintenance.md#current-operating-policy)
does not waive any validation gate.

## Current implementation coverage

| Surface | Available | Still incomplete |
| --- | --- | --- |
| P0 | npm manifests/locks, React/Vite checks, native Gradle wrapper/catalog and JVM/SDK integration | Complete selected dependency integration and production command/release matrix |
| P1 | Fixture-only strict YAML/Markdown/identity/hold validation and item schema | Full production source/settings/registry/verse/alignment schemas and diagnostics |
| P2 | Two-locale UI generation with committed web/Android resources | Reviewed five-Latin/nine-non-Latin tables, transliteration, technical grammar, plurals/escaping conformance |
| P4 | Fixture gzip/hash/canonicalization/index producer; sampled independent OSA/candidate parity | Durable ledger/receipts, semantic dates, ZIP/planner, complete language/profile index and proof/capacity evidence |
| P5 | Responsive online fixture reading/search, explicit consent, errors, direct routes, first-use browser locale/explicit override/themes and Library/Favorites session Back/Forward continuity | Full filters/discovery/script/helper/video/accessibility/platform journeys |
| P5a | Transactional web favorites/preferences/lists, bounded worker preview/saved-list file/link export, optional browser share/copy adapters with manual fallbacks, confirmed import/basic management/independent occurrence editing, catalog-only reference details/explicit reading, reader-to-list addition and fixture v1 migration | Recents/bookmarks/learning/recitation, real sharing-surface interoperability, native personal/transfer parity, full backups and production migrations |
| P6 | No persistent offline snapshot implementation | Journals/atomic activation/resume/repair/reader-safe GC and service worker lifecycle |
| P7 | Native fixture-only full preparation in memory, reading/search, durable Room favorites/preferences with locale/theme controls, core and connected tests | Native lists/transfers/backups, durable preparation/recovery, typed navigation/DI, full parity and device matrix |
| P3/P8/P9 | Dependency-ordered Shared/fixture-publisher pins; full web fixture CI/Pages and native build/core/lint CI | Live-provider clarification, production ingestion/publication/signing, device CI and release readiness |

The fixture capability is deliberately named `fixture-catalog-v1`; all UIs label
synthetic records and unavailable features. Android bundles no lyrics and requires
explicit complete fixture preparation before reading; in-memory preparation is
not a persistent offline snapshot. Requirement families receive partial evidence,
not blanket completed IDs. No release or full153-requirement completion is claimed.

Website UX-13 coverage retains separate Library/Favorites searches, verified
indexes and result sets in memory while reading or visiting Settings. Browser
Back/Forward and the reader return link restore the originating context and
available scroll/focus; removed favorites fall back to the current valid results.
Reloading discards browsing state and requires search consent again. This is not
persistent search history, Explore continuity or Android/offline parity.
Loaded search/browse results expose all matches through explicit policy-sized
pages, preserve the expanded page on reader return and reset it when the query
changes. Configured first/second/final-page boundary journeys cover keyboard focus,
completeness and worker-failure recovery without a false no-results state.
List-origin reading retains the selected list, unsaved editor state and available
focus/scroll through return/Back/Forward in the same session; reload resets selection.

XFER-01/02/03/04/05/06/08 receive partial web evidence: strict settings-derived
schema, bounded single-member gzip/raw-deflate/base64url codecs, local plain-text
preview/saved-list export, explicit cancellation and a static configured `/open/` hash entry.
Settings/preview/list management remain available when the Library endpoint fails.
Saving requires an explicit action after preview and creates a new independent
list only. Duplicate names require confirmation; revision/epoch changes require
renewed review. No lyric is fetched by transfer or saving, and no offline readiness
or signed native App Links is claimed. The [current storage protocol](architecture.md#web-fixture-personal-storage-v3)
does not establish full-backup exportability, complete list/recitation journeys,
production migration coverage or native parity.
Saved-list export rechecks its read revision after encoding and refuses concurrent
changes without a write. Its gzip/link projection excludes local IDs/control,
preferences and unsaved drafts; oversized links retain a complete file fallback.
Optional browser platform APIs hand off exactly those generated links/files or
copy the link after an explicit click. Unsupported APIs/files, cancellation and
permission failures retain the manual fallbacks and never save a list. Adapter
tests are not delivery confirmation or real OS/receiving-app interoperability;
the XFER-08 platform matrix and signed App Links remain open.

LIB-02/03/04/08/09/10 receive partial web management evidence: plain-text
placeholder/reference entry forms, optional user fallback labels, independent
ordered occurrence identities, explicit replacement and no-write invalid/stale/
cancel paths. Replacement preserves position and identity; the form initially
offers the user's placeholder text as an editable fallback, never a guessed
catalog title. List previews and saved lists resolve titles only from the currently
available verified catalog, distinguishing unresolved-before-catalog references
from generic unavailable references/placeholders without guessing matches.
Only explicit Read requests a known lyric. Readers add fresh independent occurrences
to an explicitly chosen list using the captured revision; no catalog title is
stored as a fallback or exported. Recitation remains incomplete.

UX-11 and SET-04 receive partial Website evidence for persisted Light/Dark/Warm/
Follow device selection. System-color changes do not write personal data, and
explicit choices/locale/canonical text stay independent. Strict v1/v2-to-v3
migrations preserve favorites/lists/identities and create a fresh writer fence;
future/invalid schemas remain non-destructive refusals. Palette contrast tests
do not establish full physical-device/font/offline-shell accessibility evidence.

## Delivery sequence

Each phase delivers a verified behavior slice, current documentation and real
commands/tests. Prerequisites are explicit, not implied by row order.

| Phase | Prerequisites | Scope and exit |
| --- | --- | --- |
| P0 foundation | None | Approve final design, compatible pins/native manifests/locks and real bootstrap/build/check commands |
| P1 source/settings | P0, D2 | Exact contracts/validators, valid/incomplete/held/invalid/reference/identity/layout fixtures |
| P2 language/catalog | P1, D3 | Independent mapping/digit/alias/alignment/plural/escaping fixtures; global conversion/catalog generation; no real source-PR variants |
| P3 local import | P1,P2,D6 | Manual pagination/reconciliation/extraction/asset/review-PR failures and idempotency; provider clarification before live API access |
| P4 publication/search | P1,P2,D4 | Canonical/hash/capability artifacts, durable ledger, full index/OSA parity, deterministic planner/limits and post-merge generation |
| P5 online PWA | P4, routing D7 | Individual online reading, explicit search-index consent, worker/IME/errors/filters/accessibility/preferences/direct routes |
| P5a personal journeys | P5,D4,D5 | Favorites/repeated lists/placeholders/recents/bookmarks/practice/recitation, portable minimal transfers and same-platform recoverable full backup |
| P6 offline PWA | P5,P5a,D5 | Explicit full activation/resume/failure/degradation/repair, reader-safe GC, safe shell updates and active-version precedence |
| P7 Android | P4,D1,D4,D5,D7 | app/core, required preparation with accessible recovery/lists, transfer/lifecycle/device/personal/routing parity; can run alongside P5/P6 |
| P8 automation | P3,P4,P6,P7,D7 | Owning full-check gates, validated-only Pages, root association, local-signing/protected APK verification and normal branch rules |
| P9 release | P8 | Complete applicable builds/tests and truthful supported-platform/privacy/compatibility/accessibility/capacity evidence |

## Slice rules

- Map work/tests to stable requirement IDs; preserve all approved behavior.
- Close applicable exact contracts/tables/protocols before owning implementation;
  do not confuse algorithm selection with proven/executable conformance.
- Pair success/failure/recovery paths and producer/consumer fixtures. Reuse shared
  contracts rather than inventing parallel normalization/readiness logic.
- Product configuration belongs in owned settings; native toolchain/dependency
  pins stay in manifests/locks. Personal data/secrets remain separate.
- No placeholder/mock search, downloaded JSON or hardcoded lyric sample counts
  as a completed app, search engine or offline library.
- Offline contains no images/video. Complete initial activation, explicit refresh,
  stale-writer/reader safety and previous-data preservation remain mandatory.
- Incremental tests may be focused; finalization/confirmation and every push
  require full applicable builds/all suites under [testing policy](testing-and-release.md).
  Missing required code checks block completion. Numeric performance goals are
  advisory, not an excuse to weaken correctness/safety.
- Keep current status/commands here; past phase discussions/validation records
  belong only in [HISTORY.md](../HISTORY.md). Never mark future work implemented.

## Task handoff

Include bounded scope, affected IDs/repositories, exact prerequisites/current
contracts, owner/settings impact, acceptance/failure paths, full validation commands,
actual results/blockers and commit/push authorization. Keep Shared pins independent.
