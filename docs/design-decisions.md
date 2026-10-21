# Current design decisions

**Status:** individual directions selected; exact contracts and overall final
design approval remain pending. No application-coding/source-migration permission
is implied. [Requirements](requirements.md) own product scope; the
[Shared specification](https://github.com/DaasaVaani/shared/blob/main/docs/implementation-specification.md)
owns current cross-repository detail. [HISTORY.md](../HISTORY.md) is the only
archive of questionnaires, alternatives, changes and dated observations.

## Current selections

| Area | Current direction |
| --- | --- |
| Clients | Kotlin/Compose/Material3 API26+, app -> pure Kotlin core; React/strict TypeScript/Vite static PWA/hash routes |
| Platform libraries | Android ViewModels/Coroutines/Koin compiler DSL/Navigation3/OkHttp/serialization; web React state/Dexie/React Aria/CSS Modules/native Fetch/search worker |
| Ownership | Four independent repositories; Shared contracts/fixtures/settings/UI generator/resources; Library sources/ingestion/publisher; independent consumer pins |
| Source | Flat per-video Markdown, grouped YAML, one canonical fence, stable line UUIDs/verse UUID end-line references, original literal layout, valid drafts/holds excluded |
| Language | Kannada canonical, transliteration only, five Latin/nine non-Latin variants, global rules, reviewed Source Latin eligibility/alignment, target-script digits/Latin ASCII |
| Configuration | Product knobs in owned strict YAML settings; native dependency/toolchain manifests/locks are the explicit pin exception |
| Search | Kannada/Latin AND substrings/code-point OSA; one global counted1/2/3-gram candidate index plus exact verification/scan oracle; profile-aware normalization |
| Ranking | Metadata bucket first; best field per distinct term, weights100/80/60/40/20/10/5; worst edits/total edits/ASCII-ID ties; no duplicate evidence boost |
| Excerpts | Selected-script bounded item reads, one line/distinct term merged, max16 lines/result and240 code points/line; grapheme-safe/explicit errors |
| Formats | RFC8785 JSON/safe integers; independent version families, encoded SHA256 object map, manifest snapshot hash plus increasing feed sequence, exact size/capability validation |
| Publication | Durable Library state branch/pending-confirmed receipts; trusted post-merge job writer, no main bot bypass; semantic changedAt/no-op stability |
| Transfer | Original gzip members in ZIP STORE100/32MiB; bounded byte/request planner; images online only, no offline video/images |
| Offline | Explicit full validation/atomic pointer, active+one target, verified-artifact resume, safe reader pins/GC/fences, same-version repair/degradation, current-only hosting |
| Personal | One transactional Room/Dexie personal DB, typed identities, repeated occurrences, exact byte/collection bounds, forward non-destructive migration |
| Lists/backups | Portable new-list-only minimal transfers; same-platform logical gzip full backups/confirmed replacement, preview revision/fencing, truthful locale postcommit |
| Reading | Independent UI/script preferences; explicit Latin choice, system fonts, themes/density/helper, accessible navigation and explicit latest-list resume |
| Links/shell | Root Website and /open/ hash links, host-root association, normal worker activation, no forced reload or automatic content replacement |
| Ingestion | Manual local full uploads scan/reconciliation/source PR; first API access blocked pending provider clarification |
| Releases | Full applicable checks before finalization/push; unsigned CI/local signing/protected verification; normal PR/check protection restored before release |
| Performance | All numerical search/LCP/INP/CLS targets best effort; correctness/accessibility/cancellation/integrity/safety remain mandatory |

## Current readiness gates

1. Verify compatible stable toolchain/dependency pins and real command registry.
2. Complete exact source/settings/public/index/policy/list/backup/capability schemas.
3. Review full language/native-approximation/alias/Unicode/technical-marker/digit tables.
4. Specify exact journal/receipt/epoch/lock-order/locale/accounting protocols.
5. Complete configurable UI/ingestion defaults, route/signing/runbook details.
6. Obtain overall final design approval and separate implementation authorization.

Builds, oracle/crash/migration/device/font/App Links/capacity evidence belongs to
implementation validation, not an assumed design pass. First API ingestion needs
external provider clarification independently. Follow [architecture](architecture.md),
[algorithm tasks](algorithm-analysis-tasks.md), [roadmap](implementation-roadmap.md)
and [validation policy](testing-and-release.md). Do not reopen settled families
or silently fill significant open choices.
