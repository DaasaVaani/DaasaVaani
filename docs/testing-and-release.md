# Testing and release guide

## Current executable checks

The repository has no application test runner, dependency manifest, Android
build, or content validator yet. The existing Pages workflow deploys a placeholder
site; it is not evidence of application validation.

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

## Test layers and evidence

Use [requirements acceptance scenarios](requirements.md) as the release contract,
not just the summary below. Run the smallest relevant checks during development;
run the complete applicable matrix before release.

| Layer | Required coverage |
| --- | --- |
| Source/unit | Draft rules, YAML/types, identity, optional fields, references, correction preservation, registry append behavior. |
| Ingestion integration | API pagination/quota/error fixtures, new-only imports, duplicate committed/pending work, no-change runs, review PR contents including assets/settings. |
| Generated contracts | Draft/raw-provenance exclusion, old/new compatible data, groups/index consistency, all scripts/six pinned Latin profiles, reviewed search alternatives, line/verse correspondence, stable library-added dates, generator-owned generation/recommended dates with >=7-day interval independent of APK/download/check time. |
| Language processing | Pinned ISO 15919:2001, IAST, Hunterian, Baraha, ITRANS and Harvard-Kyoto Kannada mapping/output fixtures, case/diacritic collisions, correction preservation, normal-PR structural checks without separate script sign-offs; actual processing failures block the affected item. Suitable complete Source Latin versus absent/partial/unsuitable text; raw provenance retained, absent source does not block generated publication, no silent mixing/switching. Remembered user primary/helper Latin choices and permitted side-by-side review before a recommendation/default. |
| Search | Metadata ranking above lyrics-only hits, all-script and equivalent Latin-variant queries, selected-script excerpts, honest highlighting/context, matching-verse navigation, OR/AND filters; active filters visible with individual removal, Clear filters preserves typed query and filtered no-results offers recovery online/offline; index errors remain errors. |
| UI/browser | Locale fallback/override, independent primary/helper-script preference, font persistence, aligned lines, Light/Dark/Warm and device/manual overrides, skippable preferences with unchanged defaults, PWA immediate online reading versus Android required preparation, no automatic download, unavailable previews, current-session query/filter/list/Explore-position restoration, focused recitation, screen-awake activation/release, direct URLs/base path, lazy player and playback errors. |
| Personal library/transfer | Favorites; create/rename/duplicate/import warns about another list's name but allows confirmed reuse, no forced uniqueness/suffix or name-based overwrite/merge; reorder/confirmed deletion and independent repeated occurrences; persistence, recents/bookmarks; plain text/fallback labels; exact snapshot fields exclude lyrics/recitation resume/other personal state; round trips preserve order/repeats/text; preview and new-list-only save, no append/merge/replace; failed/cancelled operations preserve prior state; generic unresolved list/direct-link messages retain IDs/text without a special version-aware update action. |
| Recitation continuity | Only the most recently recited list and exact occurrence resumes across restart/offline, including consecutive repeated songs. Continue is explicit, no automatic Recite entry, per-list positions or exact lyric scroll. Switching lists replaces the single position; practice progress is independent, transfer excludes resume state, snapshot changes preserve it. Removed list/entry explains unavailable exact resume and offers user choice; normal lyric availability/preparation gates remain. |
| Static links and routing | No backend/server-database/hosted short-link dependency; local bounded decode; supported link-size boundary and file fallback without truncation; invalid/oversized/unsupported input cannot mutate lists; sender edits do not change prior snapshots; signed App Links host-root verification; installed/absent app, unverified/disabled handling, source-browser non-handoff and usable explicit app/browser fallbacks; first browser visit needs static shell. |
| Learning/discovery | Verse navigation and local resume across scripts/restarts; changed/missing saved positions; optional learning labels with change/clear/filter/Practice actions; no automatic ability assessment; reviewed discovery groups and available candidates; newly added uses library date rather than upload date; favorite/add/practice entry points; no implied hide/reveal exercises. |
| Offline | Complete thumbnail-free reading/search/scripts/assets after preparation; system-first fonts with necessary tested fallback shaping/coverage and no online font dependency; icons/metadata instead of images; progress/cancel/retry/remove; initial failure leaves no active library; invalid/mixed updates preserve old snapshot; personal state/user text preserved; eviction recovery; per-list readiness distinguishes unprepared/missing reference/download from intentional placeholders, including placeholder-only warnings. |
| Library lifecycle | Both clients retain the active downloaded version online/offline despite newer publication; pre-download PWA online requests stay compatible. Due dates never block downloaded use; late download does not extend them. Successful no-newer-compatible checks show truthful compatibility/publication status and suppress reminders for 3 days without date changes; failed checks do neither. Explicit resume revalidates same-version progress; corrupt/unavailable data explains restart, never partial/mixed activation or promised closed-browser downloading. Isolated item/index/font damage keeps verified capabilities usable with degraded readiness and same-version repair or explained replacement; no corrupt text/false empty search; total loss re-gates Android. |
| Client compatibility | No newer publication versus newer incompatible content produces distinct honest status; latest-published is never claimed merely because no newer compatible version exists. Manual Android GitHub Releases or safe website-version guidance preserves existing compatible offline reading/personal data without forced upgrade, silent APK install or content replacement. Initial preparation offers a published compatible full snapshot if available, otherwise explains the client-update prerequisite. |
| Android | API 26 and representative newer devices; no bundled lyric library; first-launch offline/download-cancel/storage/validation failure keeps lyric browsing/search/reading/practice gated but setup/settings/retry/list management accessible; preference skip or old onboarding flag cannot bypass gate; pending shared destinations survive required preparation without auto-saving; successful full download enables offline use; removal requires re-preparation with no bundled fallback; screen-awake/local-state/Back parity and independent content updates. |
| Accessibility | Automated checks plus manual keyboard/focus, screen reader, text scaling, and touch checks against WCAG 2.2 AA; contrast in all themes. Compact/Normal/Relaxed selection during skippable setup and later, local persistence across restart/offline and primary/helper text in normal/Recite/Practice views; preserve lines/verse separation, no narrow overflow, comfortable bounded tablet/desktop columns. |
| Privacy/release | No player before Play or remote personal-state collection; explicit snapshot sharing discloses only approved fields and warns about forwarding/non-revocability; payload absent from host requests/logs and unintended third parties; no backend/analytics/tracking; history disable/clear controls; no permanent search history implied; secrets/source/drafts excluded; signed installation with actual APK/download/installed/update peak-storage evidence. |

Network fixtures must not hide production failures behind successful empty data.
Keep live API checks opt-in with approved credentials and permitted content.
Linguistic review is distinct from automated transliteration tests.
The normal content PR remains the human review boundary, not a separate mandatory
approval for every generated script. Do not present structural fixture passes as
verified linguistic accuracy or select a Latin recommendation before sample review.

## Performance protocol

For PERF-01, use a 10,000-item corpus with representative text lengths,
classification distributions, and all required scripts. After index loading,
measure input through visible result rendering, not just lookup duration.
Include reviewed Latin spelling alternatives, selected-script matching-line
excerpts, and reliable highlight rendering in the query mix and measured update.
Verify result navigation reaches the corresponding verse separately; do not
present an index-only timing as proof that the full results UI meets the target.
Record warmup, sample count, query/filter mix, device/OS/browser, online/offline
conditions, and p95. Test a representative mid-range Android device and desktop
browser; both must meet 300 ms p95.

For key website pages, record the method and device/network conditions for
LCP <= 2.5 s, INP <= 200 ms, and CLS <= 0.1. Do not substitute a proxy score for
the specified metric or present a lab estimate as field evidence.
Use only test measurements; the no-user-analytics scope remains unchanged.

## CI and deployment safeguards

1. PR validation must build/check the relevant generated artifacts and distinguish
   legitimate drafts from invalid publishable items.
2. Human review approves content and settings together before merge.
3. Publication after approved merge to `main` must upload validated public
   output, not the repository root. This replaces the current placeholder
   workflow behavior during implementation.
4. Verify project-site base paths and direct item links in the built output.
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
  correction preservation, explicit variant-unavailable behavior, helper/search
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
