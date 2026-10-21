# Testing, finalization and release

## Mandatory completion and push gate

- Incremental work may run focused relevant tests.
- A request to finalize or confirm completion requires the **full applicable
  build and all configured test/check suites**, not only targeted tests.
- Before every authorized push, validate the final change set with complete
  applicable builds/tests in each affected repository. Include dependent consumer
  conformance checks needed by the compatibility claim. Rerun invalidated checks
  after further edits; do not reuse evidence for a different tree.
- Required failures, skipped/cancelled suites, unavailable tooling/devices or
  incomplete checks are blockers, not passes. Fix or explicitly request guidance/
  an exemption; never silently weaken scope, quarantine failures or claim success.
- Validation is separate from authorization to commit/push and from GitHub rules.
  Record exact commands/results, tested revisions/conditions and limitations only
  in each repository's HISTORY.md. Current guides list commands/policy, not past runs.

### Documentation-only exception

While application tooling is absent, documentation-only work may finalize/push
after **all available documentation/bootstrap checks** pass. Explicitly report
that app builds/tests do not exist, not that they passed. Do not implement/install
an assumed toolchain just to fill this gap. This exception never covers code,
publisher/source validation or behavior changes needing actual checks.

Once application tooling exists, documentation-only changes do not automatically
exempt the repository from full build/test finalization; an explicit approved
waiver is needed. Include documentation tests when configured. Update this registry
alongside tooling changes.

## Current executable checks

Executable tooling covers the explicitly fixture-only milestone. It does not
establish complete production-schema/language/lifecycle or release conformance.

From Website:

```powershell
npm ci
npm run check
git --no-pager diff --check
git --no-pager diff --cached --check
```

The full check runs unit tests, then publishes fixtures, builds/typechecks the
current tree and runs browser tests against that fresh production build, not the
development server. `npm run build` and `npm test` are available incrementally;
`npm run test:e2e` also prepares/builds before starting its isolated preview server.

Browser tests require the clean Library revision in settings/tooling.yml with `npm ci` completed and
the installed Playwright Chromium (`npx playwright install chromium` if missing).
The configured suite exercises desktop, Pixel7 and320px layouts, explicit index
consent, actual search/reading, preference/favorite persistence and corrupt-artifact
errors. `npm run demo` publishes only synthetic fixture artifacts and serves the
local Website at the configured settings/web.yml port. It is not a production
Library deployment or a source migration.
The fixture tool repository/revision/default checkout path are centralized in
settings/tooling.yml. CI uses the same validated revision, overriding only its
local checkout location through DAASAVAANI_FIXTURE_PUBLISHER_ROOT. The helper
rejects a wrong revision or dirty producer tree; never replace it with floating main.

Shared: `npm ci` then `npm run check` regenerates/tests catalogs and fixture/settings
contracts; check generated resources remain unchanged. Library: `npm ci` then
`npm run check` runs TypeScript and all publisher tests; `npm run publish:demo`
generates only explicitly synthetic fixtures. No real source-PR variants.

Android requires Node, JDK21, the configured SDK36/build tools and an API36 emulator
for current connected evidence. Set JAVA_HOME/ANDROID_HOME and select the intended
device with ANDROID_SERIAL; do not target another user's device. From Android:

```powershell
npm ci
npm run config
.\gradlew.bat :core:build :app:build :app:lintDebug :app:lintRelease :app:connectedDebugAndroidTest --no-daemon
```

App-level JVM tests currently have no sources; the pure core has executable JVM
tests. The connected test launches the actual Compose app, requires preparation,
downloads/verifies the served fixtures and opens canonical text. The Website demo
must run at the endpoint configured in Android settings. API26/other devices,
release signing and complete Android parity are not established.
Native CI builds all debug/release variants and runs core/JVM/lint checks; the
connected suite is a required local finalization check with the configured server/
owned emulator, not a claimed CI-device pass. Unsigned release compilation does
not constitute release signing or a release-ready candidate.

Also validate all changed/new Markdown for UTF8/newline/whitespace, relative file
links, current local anchors and balanced fences. Preserve all153 unique requirement
IDs and ensure current guidance agrees with the Shared specification. Include new
files explicitly; do not stage unrelated changes merely to run validation.

Website workflow validation uses actionlint v1.7.12 with a pinned download checksum.
With the existing binary installed, `actionlint` runs from this root; shell
analysis also needs ShellCheck. Workflow changes require the documented workflow
checks. No application validation is implied. Do not invent commands if absent.

From Shared, AndroidApp and Library, respectively:

```powershell
python tools\check_repository.py
git --no-pager diff --check
git --no-pager diff --cached --check
```

Their CI also parses all .github YAML files. With existing Ruby, the workflow
command is `ruby -e 'require "yaml"; Dir.glob(".github/**/*.{yml,yaml}").each { |path| YAML.load_file(path); puts "Parsed #{path}" }'`.
An already-available YAML parser can check syntax locally; disclose the actual
method rather than claiming the Ruby command ran. The hygiene checker enumerates
tracked paths: include new documentation deliberately and preserve unrelated staging.

| Full application check | Current command |
| --- | --- |
| Website | `npm run check`: unit tests, fresh fixture build/typecheck and three-viewport production-preview browser tests |
| Shared | `npm run check`: deterministic UI generation and fixture/settings tests |
| Library | `npm run check`: typecheck and all fixture-publisher tests |
| Android | Generated config, full build/core/JVM/lint and connected test above; no app JVM test sources |
| Production/release | Incomplete: full schemas/tables, snapshots/personal migration, signing/platform/accessibility/capacity matrix |
| Performance/capacity harness | Not implemented; no production timing/memory/corpus result claimed |

## Partial requirement evidence

These mappings identify limited executable evidence, not completed requirement
IDs or a release acceptance declaration.

| Requirements | Current evidence | Boundary |
| --- | --- | --- |
| DATA-02/07/08 | Library tests preserve LF/CRLF text/UUIDs, reject malformed/duplicate lines and exclude held synthetic items | Fixture schema only; full production fields, filenames, verses/alignment and authoring/migration incomplete |
| SEARCH-12/13 | Sampled independent substring/full-matrix oracle, counted-gram candidates, native core checks and real browser search | Ordinary fixture text only; reviewed profiles/aliases/markers, exhaustive proof and complete native parity pending |
| PLAT-01/05 | Real React and Compose apps; built-site browser journeys at desktop/mobile/320px and one native API36 reading journey | PWA installation, complete routes/layout/interaction modes and supported-platform/device matrix pending |
| I18N-01, SET-04 | Matching two-locale generated UI resources; web locale/theme persistence without changing canonical text | Browser/device first-use selection, complete script/personal preferences and native preference parity pending |
| LIB-01/04 | Web favorite toggle/reload persistence and explicit corrupt-personal-record error without overwriting stored data | Lists/offline/future migrations and Android Room personal state absent |
| SET-01/02 | Owned settings/schema guards, Shared policy binding and immutable clean fixture-tool pin | Complete production settings inventory, language/protocol/backup contracts and all compatibility fixtures pending |
| QUAL-01/02/03 | Semantic browser controls, keyboard focus entrypoint, standalone canonical reading and no video/tracking dependencies | Full keyboard/screen-reader/contrast/scaling/platform journeys remain unverified; no formal conformance claim |

## Shared submodule updates

Consumers pin Shared independently. Updating Shared does not by itself update
Website, Android or Library; update only the consumers authorized for the change.
For an authorized coordinated update, use this publication order:

1. Finish and fully validate Shared, commit it, push it to its origin and wait
   for its required CI to pass. Select that exact published, validated commit;
   do not reference a local-only commit or an unvalidated branch tip.
2. In each affected consumer, preserve unrelated work, ensure the Shared checkout
   is clean, fetch Shared and check out the selected full SHA in detached HEAD
   mode. Do not automatically track the newest main revision. Verify the checkout
   matches the intended SHA and review the changes since that consumer's old pin.
3. Validate each consumer against that exact checkout using all applicable builds,
   tests and documentation checks. While bootstraps have no app tooling, also run
   `python shared\tools\check_repository.py` from each consumer and check the
   pinned Markdown links/fences. A documentation-only Shared update plus gitlink
   metadata may use the documentation-only exception; executable Shared changes
   still require their actual dependent conformance/build/test evidence.
4. Stage the consumer's `shared` gitlink and directly related documentation/history,
   verify the staged gitlink SHA, and rerun checks invalidated by final edits.
   Commit and push the consumers only after the Shared publication gate passes.
   Independent consumer commits/pushes may run in parallel; Shared comes first.
5. Verify each remote consumer main contains the intended mode-160000 gitlink,
   its local submodule matches that pin without modifications, and its CI passes.
   A fresh recursive checkout must resolve the pinned Shared commit from origin.

Record exact Shared/consumer revisions, commands/results and limitations only in
each affected HISTORY. Existing clones activate committed pins with
`git submodule update --init --recursive`; this does not authorize advancing pins
with `--remote`. A failed upstream or consumer check blocks that update rather
than silently selecting a different revision.

## Required implementation test matrix

Use [requirements acceptance scenarios](requirements.md) and
[Shared traceability](https://github.com/DaasaVaani/shared/blob/main/docs/implementation-specification.md#14-requirement-and-verification-traceability).
The [algorithm inventory](algorithm-analysis-tasks.md) defines proof/fixture work.
Selected libraries are not conformance evidence.

| Surface | Full applicable coverage once implemented |
| --- | --- |
| Shared | Contract/settings/catalog validation, independent accepted/rejected fixtures, canonical serialization, generated Android/web resource equality and compatible consumer checks |
| Library | Type/lint/build/unit/integration/source fixtures; strict producer/reference/draft/hold rules; deterministic publisher/index/ledger/package/host checks at appropriate post-merge stage |
| Website | Typecheck/lint/build, Vitest pure/React tests, critical Playwright browser/worker/storage/offline/multi-window/accessibility flows |
| Android | Complete configured build/lint/JVM/instrumentation suites; Room/lifecycle/Compose/background transfer/App Links/signature checks |
| Release/platform | API26/current/33-34 transfer boundaries, physical devices, supported browser current/previous majors, orientation/input/scaling/system-font rendering and manual accessibility evidence |

Source PRs validate sources/tooling fixtures but never generate actual item variants/
previews. Actual full generation/validation is post-merge before deploy; full-check
policy does not waive that boundary. First live API ingestion remains blocked
pending provider clarification; deterministic offline fixtures can be tested.

Vitest is selected for TypeScript tooling/pure algorithms, jsdom/Testing Library
for isolated React, Playwright for real browser/platform behavior. Android uses
JVM and instrumentation, not Robolectric by default. Exact runners/matrices/pins
remain design gates. State untested devices/browsers; latest Chromium/emulator
alone never proves broad platform support.

## Critical correctness and recovery evidence

- Exact code-point OSA fragments versus exhaustive oracle,3/4 and8/9 thresholds,
  adjacent swaps/overlap restrictions, supplementary characters and candidate
  completeness; abcd/acbd cannot be lost by an unsafe bigram filter.
- All-term metadata/lyric matching, ranking/signature/alias/case/marker/joiner/
  digit fixtures, no silent truncation and invalid-index errors not empty results.
- Selected-script excerpts/highlights/navigation, complete Source Latin mapping,
  grapheme safety and honest preview/unavailable states.
- Strict draft/hold/invalid sources, stable UUIDs, literal layout, grouped YAML,
  LF/CRLF offsets, filename-only rename/no-op hashes and public whitelist.
- Canonical JSON/gzip/SHA256/capability/version boundaries, ledger sequence/receipts,
  current-only mixed/stale/missing responses and reproducible byte accounting.
- Explicit Load search/size consent, IME/debounce/Enter/filter cancellation and
  stale results; independent UI locale/script, catalog/plurals/third-party strings.
- Full activation/cancel/crash/low-space, reader pins/locks/deadlock/GC, corruption/
  degraded repair, verified resume, no partial/mixed snapshot/false readiness.
- Repeated occurrences/placeholders/unresolved refs, duplicate-name confirmation,
  stable exact recitation/practice/bookmark identity and no guessed reanchoring.
- Minimal lists cross-platform/new-list-only, lossless size fallback; same-platform
  full backup/replace/revision/epoch and truthful postcommit locale failure.
  Exact capacity accounting, newer-format refusal and content/readiness exclusions.
- Routes/root scope/App Links/pending destinations, normal worker activation,
  offline lazy chunks, player only after Play, screen-awake lifecycle/failure.

## Best-effort performance

Advisory goals: search550ms p95, LCP2.5s, INP200ms, CLS0.1. A numeric miss alone
is not a hard implementation/release gate; report meaningful regressions.
Correctness, responsive cancellation, accessibility, integrity and safety limits
remain mandatory.

Measure input through selected-script excerpts/highlights including250ms debounce,
worker scheduling/ranking/render and item I/O, index already loaded. Representative
10,000-item all-rendering corpus, physical mid-range Android and desktop;
document network/device/browser/query mix/sample/warmup/cache conditions and
viewport/page completion. No mandatory20/50Mbps baseline. Cold loading/memory
separate; no prewarming/proxy scores/fake field analytics. No-user-analytics scope stays.

## Deployment and release

Only fully validated public output deploys, never repository sources. Normal main
protection requires PR/named checks, no admin exemption/mandatory second reviewer,
no force/deletion. Remove the temporary admin exception before release.
See [maintenance](maintenance.md) for current operational controls.

CI produces unsigned Android candidates; maintainer verifies/signs locally,
protected workflow verifies package/version/certificate/source association and
publishes signed APK. No signing/API key in CI/logs. Keep secure key backups.
Verify direct routes/association, independent content/client compatibility, actual
APK/download/installed/update peak sizes, update/rollback recovery and provider hold.
Archive release check records in HISTORY; publish only accurate supported versions.
