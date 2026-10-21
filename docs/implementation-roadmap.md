# Implementation roadmap

**Status: planning only; no application phase is implemented.**
Use [requirements](requirements.md), [current design](design-decisions.md),
[architecture gates](architecture.md) and the
[Shared specification](https://github.com/DaasaVaani/shared/blob/main/docs/implementation-specification.md).
No source migration is authorized. Overall final design approval and separate
coding authorization remain prerequisites.

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
