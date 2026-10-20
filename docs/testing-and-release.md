# Testing and release guide

## Current executable checks

The Website repository has no application test runner, dependency manifest,
Android build, or content validator. Its Pages workflow deploys only placeholder
`index.html`; it is not application validation. Android, Shared and Library are
separate public repositories. Their bootstrap hygiene workflows/policies are not
application or content-pipeline checks. No app build/test matrix described below
is implemented or currently claimed.

The `Repository checks` workflow runs on pull requests and pushes to `main`.
Its `Workflow lint` job checks whitespace with `git diff --check HEAD^ HEAD`
and validates workflow syntax, expressions, and shell commands with actionlint
v1.7.12. CI verifies the downloaded Linux archive against a pinned SHA-256 before
execution. With that actionlint version installed locally, run `actionlint`
from the repository root; shell analysis additionally requires ShellCheck on
the local PATH. These checks do not validate product behavior, rendered HTML,
or content contracts. The `Workflow lint` check is required by the `main`
ruleset after its first successful GitHub-hosted PR run on 2026-10-21.

For documentation changes, check relative links and Markdown structure and use:

```powershell
git --no-pager diff --check
git --no-pager status --short
```

These commands do not validate product behavior. Once tooling is approved and
implemented, replace the missing command entries below with verified commands.
Do not guess commands or install a new runner merely to fill this table.

| Check | Current command |
| --- | --- |
| Dependency restore/bootstrap | Not available; requires D1 implementation. |
| Source/settings validation | Not available; requires P1 implementation. |
| Unit and contract tests | Not available; add with each implemented component. |
| Web build and browser tests | Not available; requires website tooling. |
| Android build/device tests | Not available; requires Android tooling. |
| Performance harness | Not available; requires P4 and client integration. |

## Approved risk-based process (implementation pending)

The selected process is a risk-based test pyramid, not evidence that checks exist.
Fast deterministic unit/contract tests are intended on each owning-repository PR.
Shared portable fixtures are the cross-implementation oracle; each consumer runs
applicable fixtures against its own implementation. Consumer CI additionally runs
the previously supported pinned Shared revision only when claiming compatibility.

- **Library:** Source PRs run source and tooling-fixture checks only; no actual
  generated variants/previews. Full generation, validation and consistency checks
  run post-merge before publishing. Failure preserves the prior publication.
- **Website:** PR typecheck, lint, Vitest, build and critical Playwright flows on
  the latest stable Chromium only (`release-test-matrix`). Firefox, WebKit/Safari
  and PWA install/storage on other browsers are unverified. Playwright
  service-worker automation is Chromium-only.
- **Android:** PR JVM tests, lint and Compose/instrumented smoke on the latest
  Android emulator only. API 26 to 35, physical devices, background boundaries and
  per-script real-device rendering are unverified and must be named as such.
- **Release evidence:** state every platform, browser, API level and device that
  was not tested; never claim support beyond what was run, including the API 26
  minimum, App Links on devices and low-end performance.
- **Performance:** The 550 ms p95 target includes 250 ms debounce, cold load and
  memory in a scheduled/pre-release measured protocol on representative devices,
  not a flaky per-PR gate. Do not substitute emulation or unit tests for device
  evidence.
- Required checks are branch-protection gates. Quarantine flaky tests only with
  a tracked owner and expiry. Release evidence records exact commands/results,
  pinned Shared and Library revisions, and unverified acceptance criteria.

Vitest is selected for Website, Shared build tooling and Library TypeScript unit
tests; type-checking stays separate. Use Node for tooling/pure algorithms and
jsdom with React Testing Library/user-event for isolated React interactions. Use
Playwright for real workers, IndexedDB, service-worker/offline, multi-window,
layout and focus behavior. Android uses local JVM tests and instrumentation for
platform, Compose, Room, lifecycle and background work; Robolectric is not an
initial default. Versions, exact matrices, runners and cadence remain open. None
of these application checks is currently implemented here.

## Test layers and evidence

Use [requirements acceptance scenarios](requirements.md) as the release contract,
not just the summary below. Run the smallest relevant checks during development;
run the complete applicable matrix before release.
The [interim design record](design-decisions.md) is not implementation evidence:
selected-library conformance, exact contracts and overall final approval remain
pending. No application/linguistic/performance tests were run to select defaults.

| Layer | Required coverage |
| --- | --- |
| Source/unit | Strict YAML 1.2/remark restricted grammar, closed fences, draft rules, persisted UUIDs and references, optional fields, source correction preservation, hex-ID/ASCII-slug filename behavior, stable registry IDs and append behavior. |
| Ingestion integration | API pagination/quota/error fixtures, new-only imports, duplicate committed/pending work, no-change runs, review PR contents including assets/settings. |
| Generated contracts | Draft/internal-provenance exclusion except explicitly public supplied Source Latin/status; old/new compatible data, groups/global-index consistency, all renderings/six profiles, anchors, stable library-added dates, generator-owned dates with >=7-day interval, deterministic JSON/gzip/SHA-256 reuse and common ZIP STORE members. |
| Language processing | Pinned ISO/IAST/Hunterian/Baraha/ITRANS/HK Kannada fixtures, independent expected output, case/diacritic collisions, Tamil superscripts, separate Bengali/Assamese and native approximations. Source PR/tooling-fixture checks, actual variants only post-merge, global-only fixes and deployment blocked on full generation failure. Suitable/absent/partial/unsuitable Source Latin, public status but restricted eligibility, reliable alignment, no mixing/switching, samples before a recommendation/default. |
| Search | AND substrings and bounded code-point OSA fragments, all-script/reviewed alternatives, differentiated metadata/lyric ranking, selected-script excerpts/highlights/verse navigation, approved five filter fields with OR/AND semantics but no tag/year filters. Explicit Load search consent, worker/IME/cancellation/stale-response behavior, 250 ms debounce and 550 ms end-to-end p95. Clear filters preserves query; errors/loading are not empty success. |
| UI/browser | Locale fallback/override, independent primary/helper-script preference, font persistence, aligned lines, Light/Dark/Warm and device/manual overrides, skippable preferences with unchanged defaults, PWA immediate online reading versus Android required preparation, no automatic download, unavailable previews, current-session query/filter/list/Explore-position restoration, focused recitation, screen-awake activation/release, direct URLs/base path, lazy player and playback errors. |
| Personal library/transfer | Favorites; create/rename/duplicate/import warns about another list's name but allows confirmed reuse, no forced uniqueness/suffix or name-based overwrite/merge; reorder/confirmed deletion and independent repeated occurrences; persistence, recents/bookmarks; plain text/fallback labels; exact snapshot fields exclude lyrics/recitation resume/other personal state; round trips preserve order/repeats/text; preview and new-list-only save, no append/merge/replace; failed/cancelled operations preserve prior state; generic unresolved list/direct-link messages retain IDs/text without a special version-aware update action. |
| Recitation continuity | Only the most recently recited list and exact occurrence resumes across restart/offline, including consecutive repeated songs. Continue is explicit, no automatic Recite entry, per-list positions or exact lyric scroll. Switching lists replaces the single position; practice progress is independent, transfer excludes resume state, snapshot changes preserve it. Removed list/entry explains unavailable exact resume and offers user choice; normal lyric availability/preparation gates remain. |
| Static links and routing | No backend/server-database/hosted short-link dependency; local bounded decode; supported link-size boundary and file fallback without truncation; invalid/oversized/unsupported input cannot mutate lists; sender edits do not change prior snapshots; signed App Links host-root verification; installed/absent app, unverified/disabled handling, source-browser non-handoff and usable explicit app/browser fallbacks; first browser visit needs static shell. |
| Learning/discovery | Verse navigation and local resume across scripts/restarts; changed/missing saved positions; optional learning labels with change/clear/filter/Practice actions; no automatic ability assessment; reviewed discovery groups and available candidates; newly added uses library date rather than upload date; favorite/add/practice entry points; no implied hide/reveal exercises. |
| Offline | Complete thumbnail-free reading/search/scripts/assets after preparation; system-first fonts with necessary tested fallback shaping/coverage and no online font dependency; icons/metadata instead of images; progress/cancel/retry/remove; initial failure leaves no active library; invalid/mixed updates preserve old snapshot; personal state/user text preserved; eviction recovery; per-list readiness distinguishes unprepared/missing reference/download from intentional placeholders, including placeholder-only warnings. |
| Library lifecycle | Both clients retain the active downloaded version online/offline despite newer publication; pre-download PWA online requests stay compatible. Due dates never block downloaded use; late download does not extend them. Successful no-newer-compatible checks show truthful compatibility/publication status and suppress reminders for 3 days without date changes; failed checks do neither. Explicit resume revalidates same-version progress; corrupt/unavailable data explains restart, never partial/mixed activation or promised closed-browser downloading. Isolated item/index/font damage keeps verified capabilities usable with degraded readiness and same-version repair or explained replacement; no corrupt text/false empty search; total loss re-gates Android. |
| Client compatibility | No newer publication versus newer incompatible content produces distinct honest status; latest-published is never claimed merely because no newer compatible version exists. Manual Android GitHub Releases or safe website-version guidance preserves existing compatible offline reading/personal data without forced upgrade, silent APK install or content replacement. Initial preparation offers a published compatible full snapshot if available, otherwise explains the client-update prerequisite. |
| Android | API 26 and representative newer devices; no bundled lyric library; first-launch offline/download-cancel/storage/validation failure keeps lyric browsing/search/reading/practice gated but setup/settings/retry/list management accessible; preference skip or old onboarding flag cannot bypass gate; pending shared destinations survive required preparation without auto-saving; successful full download enables offline use; removal requires re-preparation with no bundled fallback; screen-awake/local-state/Back parity and independent content updates. |
| Accessibility | Best effort with no WCAG claim (`accessibility-baseline`): automated checks where available plus keyboard/focus, text scaling and touch checks against the accessibility requirements. Compact/Normal/Relaxed selection during skippable setup and later, local persistence across restart/offline and primary/helper text in normal/Recite/Practice views; preserve lines/verse separation, no narrow overflow, comfortable bounded tablet/desktop columns. |
| Privacy/release | No player before Play or remote personal-state collection; explicit snapshot sharing discloses only approved fields and warns about forwarding/non-revocability; payload absent from host requests/logs and unintended third parties; no backend/analytics/tracking; history disable/clear controls; no permanent search history implied; secrets/source/drafts excluded; signed installation with actual APK/download/installed/update peak-storage evidence. |

Network fixtures must not hide production failures behind successful empty data.
Keep live API checks opt-in with approved credentials and permitted content.
Linguistic review is distinct from automated transliteration tests.
The normal content PR remains the human review boundary, not a separate mandatory
approval for every generated script. Do not present structural fixture passes as
verified linguistic accuracy or select a Latin recommendation before sample review.
PRs review sources and applicable deterministic tooling fixtures, not actual
item-generated variants or previews. Full publication validation runs post-merge.

### Selected-design regression fixtures

- Exact `vadiraja krishna` / `dir sh` AND substring recognition across fields,
  plus negative cases where one required term has no permitted match.
- OSA versus full Damerau/Levenshtein and Unicode code-point versus UTF-16
  counting; length boundaries 3/4 and 8/9, zero/one/two edits, swaps and fuzzy
  fragments rather than whole-word-only approximations. Synthetic `abcd` versus
  `acbd` must not be lost by a naive bigram-overlap candidate filter.
- Candidate-generator results versus the straightforward scan oracle under the
  agreed normalization. Test completeness as well as false-positive verification.
  Bound handling must not silently masquerade as a complete search.
- Missing/new online index never downloads just from site entry, Search entry
  or typing. Size/compatibility failures remain explicit; valid cache reuse and
  worker restart do not imply complete preparation.
- Source-only filename renames do not change item bytes. UUID moves/corrections
  preserve references; ambiguous splits/merges/removals do not guess replacements.
- Changed ZIP membership never forces unchanged verified items to download.
  Mapping changes may change outputs without source mtime changes. Check
  descriptor/manifest cache rules, corrupt local objects, interrupted targets and
  safe active/staged/reader reachability; no permanent previous local snapshot.
- Shared translation source produces correct Android/i18next text, placeholders,
  plurals and escaping; locale recreation preserves state. Verify React Aria
  Kannada announcements separately from app catalog completeness.
- Shell updates notify and wait for normal activation, including other
  root-controlled windows; no forced reload/skipWaiting or library replacement.

## Performance protocol

For PERF-01, use a 10,000-item corpus with representative text lengths,
classification distributions, and all required scripts. After index loading,
measure input through visible result rendering, not just lookup duration.
Include the actual 250 ms debounce, timer jitter, worker scheduling/messaging,
candidate lookup/OSA, filters/ranking and UI work. Enter/filter changes execute
immediately; include them and rapid typing, IME completion and cancellation in
the fixture mix. A stale response must never count as the current query's update.
Include reviewed Latin spelling alternatives, selected-script matching-line
excerpts, and reliable highlight rendering in the query mix and measured update.
Verify result navigation reaches the corresponding verse separately; do not
present an index-only timing as proof that the full results UI meets the target.
Record warmup, sample count, query/filter mix, device/OS/browser, online/offline
conditions, and p95. Test a representative mid-range Android device and desktop
browser; both must meet 550 ms p95. This explicitly supersedes 300 ms; the
nominal post-debounce remainder is about 300 ms, not a separate excluded budget.
Record cold transfer/decompression/loading and parse/worker peak memory
separately. A prebuilt global index does not remove those costs; no benchmark
pass is currently established.

For key website pages, record the method and device/network conditions for
LCP <= 2.5 s, INP <= 200 ms, and CLS <= 0.1. Do not substitute a proxy score for
the specified metric or present a lab estimate as field evidence.
Use only test measurements; the no-user-analytics scope remains unchanged.

## CI and deployment safeguards

1. PR validation must check source Markdown/YAML, references, draft/publishable
   fields and applicable deterministic tooling fixtures. No actual item variant
   generation/previews in PRs; full public generation/index/package checks run
   post-merge and fail deployment rather than publishing partial output.
2. Human review approves content and settings together before merge.
3. Publication after approved merge to `main` must upload validated public
   output, not the repository root. This replaces the current placeholder
   workflow behavior during implementation.
4. Verify the selected root base `/`, hash direct links and root association in
   built output. Keep canonical base configurable; no assumed old-URL redirects.
   Root service-worker routing must exclude unrelated projects/data requests,
   and code updates must not force activation/reload or replace active content.
5. Keep API and signing secrets in protected secret storage. Select least-required
   permissions for import PR creation, Pages deployment, and releases separately;
   untrusted PR validation must not require signing/release credentials.
6. Publish compatible content independently from APKs. Use a separate manual or
   version-tagged workflow for signed APKs through GitHub Releases.
7. Define and test deployment rollback, snapshot compatibility, and release
   recovery before production use. A rollback must not force an incompatible
   content snapshot onto existing clients.

## Release evidence checklist

- Covered requirement IDs and exact tested commit/artifact version.
- Commands/results for validation, builds, unit/contract/browser/device tests.
- Browser versions, Android versions/devices, orientation/input checks.
- Manual accessibility and linguistic-review evidence.
- Performance results and reproducible measurement conditions.
- Offline refresh failure/recovery results and content/APK compatibility results.
- No-newer versus newer-incompatible status, manual Android/safe website guidance,
  preserved compatible offline reading/personal data, no silent client/content
  install and initial setup with/without a published compatible complete library.
- Cross-platform snapshot link/file interoperability with ordered repeated
  references/placeholders/fallback labels; independent occurrence operations and
  recitation; new-list-only user-named saves, matching-name and failed/cancelled
  import preservation, no append/merge/replace; tested size limits
  and lossless file fallback; signed host-root App Links and app/browser fallback
  evidence; personal-state preservation and placeholder-aware readiness.
- Duplicate-name warning and confirmed reuse on create/rename/duplicate/import,
  cancelled-operation preservation and no forced unique name/numbered suffix.
- Generic unavailable list/direct-link references preserve IDs/text without a
  special version-aware update action; ordinary update controls stay usable.
- Visible active filters, individual removal and Clear filters preserving typed
  query on filtered empty results online/offline; loading/index errors remain
  distinct.
- Primary/helper alignment, matching-verse navigation, learning resume, discovery
  date semantics, and supported/unsupported screen-awake lifecycle evidence.
- Explicit most-recent-list/occurrence resume across restart/offline, consecutive
  repeats and switching lists; no per-list/scroll restoration, automatic Recite
  entry, practice-state mutation or exported resume data. Removed-location
  handling and snapshot-change preservation with preparation gates verified.
- Theme contrast/manual overrides, setup skip/completion and explicit-download
  evidence, local history clear/disable, learning labels, verse bookmarks, and
  current-session website/Android navigation-restoration results.
- Compact/Normal/Relaxed onboarding/later controls and persistence across scripts,
  themes and reading modes offline; preserved lines/verse separation and tested
  narrow/wide reading columns under text scaling.
- Six pinned Kannada Latin-profile fixtures, suitable/absent Source Latin,
  public unsuitable Source Latin/status with restricted eligibility, global-only
  generated fixes, source correction preservation, explicit unavailable behavior, helper/search
  correspondence and user-reviewed samples before a Latin recommendation/default.
- Verification that new personal state remains local, survives snapshot
  replacement/removal, and does not enter shared snapshots beyond approved fields.
  Local data loss
  on app/browser clear must not be described as covered by a full backup.
- No-library Android first launch, required explicit preparation, failure/cancel/
  removal gates, post-download offline reading and pending-link continuation;
  PWA on-demand online reading without required full download.
- Downloaded-version precedence online/offline; generated >=7-day soft dates,
  already-due downloads, successful no-newer-compatible 3-day suppression and
  failed-check behavior at exact boundaries; no expired-content lockout.
- Validated same-version resume and unavailable/corrupt-progress restart cases;
  isolated damage with verified unaffected use/degraded readiness, damaged-index
  error instead of empty results, same-version repair/full replacement and total
  loss recovery. No mixed versions or partial first activation.
- Thumbnail-free package manifests and tested system-first/fallback font coverage
  for all scripts. Record actual APK, full-library download, installed and update
  peak-storage sizes; estimates and approximately 2,500 songs are not size proof.
  Include all six generated Latin profiles and suitable optional Source Latin in
  the measured corpus; earlier illustrative estimates do not cover measured size.
- Protected signing configuration and installable signed APK evidence, without
  exposing keys or credentials.
- Remaining gaps, their impact, and explicit approval before calling a release
  ready. Failed, skipped, unavailable, and passed checks are distinct states.
