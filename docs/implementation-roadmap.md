# Implementation roadmap

Status: Planning guidance only. No phase is marked implemented by this document.
See [decision gates](architecture.md) before choosing tools or formats.

## Delivery sequence

Each phase must produce a working, verified slice and update its actual state
here when implementation occurs. Dependencies are explicit, not inferred from
table order.

| Phase | Prerequisites | Scope and requirement anchors | Exit criteria |
| --- | --- | --- | --- |
| P0: Approve foundation | None | D1; identify the gates needed for the next slice. | Approved toolchain/client approach, supported versions, real bootstrap/check commands documented. No assumed framework. |
| P1: Source validation | P0; D2 | Draft-aware item/settings contracts and validators (DATA, SET, CI-01/02). | Valid/draft/invalid fixtures pass expected checks; duplicates and references are validated. |
| P2: Language processing | P1; D3 | Kannada-derived scripts and six pinned Latin profiles, optional suitable complete Source Latin, reviewed search alternatives, alignment, fonts and correction preservation (LANG, I18N rules). | All-script/six-profile mapping and structural tests pass in normal content-PR workflow, without separate script sign-offs; processing failures block the affected item. Source/generated separation, explicit unavailable-source handling, correction/alignment and offline font tests pass. User reviews permitted side-by-side samples before any Latin recommendation/default. |
| P3: Import review slice | P1, P2; D6 | API discovery, extraction, drafts, thumbnails, registry additions, PR proposal (ING, IMG). | Manual fixture-driven import, pagination, retry/pending-PR behavior, no-change and failure cases verified. Live access gated by rights/credentials. |
| P4: Publication/search | P1, P2; D4 | Public payloads, groups/search/filter indexes, excerpt/verse locations, library-added dates, generator-owned snapshot dates, compatible static content, thumbnail-free reading packages and separate online images (GEN, SEARCH, EXP, OFF). | Drafts excluded; packages include all scripts/six Latin profiles/required fonts and suitable optional Source Latin but no thumbnails/videos; update-recommended date >=7 days after generation, not APK/download; selected-lyric loading, search/verse contracts pass; performance includes Latin variants/excerpts. |
| P5: Responsive online website | P4; applicable D7 routing decision | Fully static item/search/Explore, visible removable filters with query-preserving clear, helper scripts/Latin choice/themes/density, skippable preferences, continuity, player/sharing and offline-download entry (PLAT, UX, I18N, LANG, SEARCH, EXP). | No backend/full-download requirement for online reading; direct Pages links and generic unavailable references work without a special version-aware update action; filter/empty-state recovery preserves query; density/setup/Back/alignment/accessibility tests pass; optional images do not block text; player absent before Play. |
| P5a: Personal library and reading journeys | P5; applicable D4/D5 decisions | Favorites, repeated reference/placeholder occurrences, fallback labels, snapshot transfer/new-list-only import, duplicate-name warnings with confirmed reuse, recents/labels/bookmarks, most-recent-list recitation resume and practice (LIB, XFER, REC, LEARN). | Round trips preserve repetition/order/text; create/rename/duplicate/import allow warned/confirmed duplicate names without overwrite/merge; cancelled saves preserve state; explicit Continue restores only latest list/occurrence across restart, not per-list/scroll positions or practice state, and never transfers progress; removed-location choice, lossless fallback, privacy and accessible plain text verified. |
| P6: PWA offline slice | P5, P5a; D5 | Optional full download, active-version precedence, truthful compatibility/update guidance, soft reminders, safe same-version resume/repair and honest readiness (OFF, UX, LIB, XFER, REC, LEARN, EXP). | Complete offline functionality, filter recovery and explicit latest-list resume work without images/videos; newer incompatible content never forces loss of compatible reading or a false latest-published claim; safe website update preserves personal data and does not silently replace content; initial compatible/no-compatible paths pass; 3-day suppression and failed checks remain correct; no partial/mixed activation; degraded repair/removal recovery passes. |
| P7: Android client | P4; applicable D1/D4/D5/D7 decisions | Small APK without lyrics; required preparation, compatible content/manual GitHub Releases guidance, active-version/reminder/resume/repair parity, density, filters, duplicate-name and latest-list-resume parity, signed links/pending destinations. May proceed alongside P5/P5a/P6. | API 26+; initial failure keeps lyrics gated but recovery/lists accessible; no onboarding bypass; full offline use and verified repair pass; incompatible newer content preserves compatible reading with truthful guidance, no silent APK/content install; initial compatible/update-required paths, removal/total-loss gates, personal data, routing/accessibility and measured sizes verified. |
| P8: Production automation | P3, P4, P6, P7; D7 | Scheduled/backfill import operations, PR checks, Pages publication, signed APK workflow (CI, ING-02/03). | End-to-end review-to-publication tested; public output excludes drafts/provenance; signed APK release and rollback procedure verified. |
| P9: Release readiness | P8 | Full compatibility, accessibility, performance, privacy, and acceptance evidence. | Required tests and manual evidence complete; remaining gaps explicitly approved rather than called done. |

Gate decisions may be grouped if the user approves them together. Backfill should
not be a prerequisite for deterministic fixture-based development or tests.

Round 2 does not add Find within an open lyric, an in-app correction-report
builder, full personal-data backup, or cross-session navigation restoration.
The later approved revision intentionally expands snapshot entries to include
plain-text placeholders/fallback labels and adds app/browser links. It does not
add a backend, live lists, external placeholder URLs, selective offline saves,
bundled Android lyrics, or thumbnails in offline packages.
The coherence review also settles six generated Latin schemes and optional
Source Latin, generator-owned soft update dates, explicit safe resume/repair and
new-list-only imports. Exact mappings, storage/format choices, date representation,
occurrence identity and layout dimensions still require the applicable gates.
Isolated post-validation recovery is not permission for partial initial
preparation or selective offline saves. No phase above is marked implemented.
The further functionality review adds compatibility guidance, query-preserving
filter recovery, most-recent-list entry resume and duplicate-name warnings with
confirmed reuse, while retaining generic unavailable references. General
cross-session browsing restoration remains excluded. Performance/startup and
local persistence mechanisms stay with architectural decisions; this round does
not change performance targets or select technical mechanisms.

## Task slicing rules

- Choose the smallest end-to-end behavior, not a pile of unused abstractions.
- Pair each feature with failure-path tests and producer/consumer integration.
- Keep platform behavior consistent while using platform-appropriate UI.
- Do not add live API calls, releases, or deployments just to prove a local unit
  test. Use mocks/fixtures first and document separate integration evidence.
- Do not call placeholder pages, hard-coded sample search, or a downloaded JSON
  file a complete website, search implementation, or offline experience.

## Suggested task brief

```text
Outcome:
Requirement IDs:
Approved decisions and prerequisite phases:
Existing code/contracts to reuse:
Included scope:
Excluded scope:
Failure cases:
Acceptance tests and actual commands:
Documentation to update:
```

If a prerequisite is missing, request the relevant decision rather than silently
selecting a stack or claiming the phase is complete.
