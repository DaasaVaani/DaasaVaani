# Implementation roadmap

Status: Planning guidance only. No phase is marked implemented. Four public repos
are bootstrapped, but app/content tools are not implemented and current `library/`
`library/` is absent and `settings/` is empty in Website. Reported legacy-looking
Markdown in a sibling path is unreviewed; assessment/migration is pending and
not authorized. See [approved individual decisions](design-decisions.md) and
[decision gates](architecture.md). Overall approval and coding authorization remain pending.

## Delivery sequence

Each phase must produce a working, verified slice and update its actual state
here when implementation occurs. Dependencies are explicit, not inferred from
table order.

| Phase | Prerequisites | Scope and requirement anchors | Exit criteria |
| --- | --- | --- | --- |
| P0: Approve foundation | None | Consolidate selected Kotlin/Compose, React/TypeScript/Vite, Node/TypeScript Library tooling and four-repository boundaries; finish applicable gates and obtain overall final design approval. | Compatible toolchain pins, per-repo layouts/locks and real app bootstrap/check commands. npm is selected, but individual choices are not implementation permission. |
| P1: Source validation | P0; D2 | Library-owned draft-aware item/settings contracts and validators, with portable fixtures/specs in Shared (DATA, SET, CI-01/02). | Valid/draft/invalid fixtures pass expected checks; duplicates and references are validated. |
| P2: Language processing | P1; D3 | Library Node/Sanscript/common_maps, exact Kannada profiles, separate Bengali/Assamese, Tamil superscripts/native approximations, Source Latin/status, search alternatives, fonts/alignment; Shared owns YAML UI catalogs/generator/resources. | Independent mapping/plural/escaping and global-fix fixtures pass; source PR/tooling checks do not generate real item variants/previews. Full variants generate/validate only post-merge; failures preserve previous publication. No item overrides; reviewed samples before a Latin default. |
| P3: Import review slice | P1, P2; D6 | Library-owned API discovery, extraction, drafts, thumbnails, registry additions and source PR proposal (ING, IMG). | Manual fixture-driven import, pagination, retry/pending-PR behavior, no-change and failure cases verified. Live access gated by the local API credential and the provider-terms check. |
| P4: Publication/search | P1, P2; D4 | Library-owned per-video JSON/gzip publisher and global JSON/gzip index, field-aware AND substring/OSA matching contract, approved filters/anchors, compatible SHA-256 manifest/discovery and common ZIP STORE bundles. | Drafts/internal provenance excluded except public supplied Source Latin/status; all approved renderings/fonts, no thumbnails/videos; deterministic reuse, changed-at planning and >=7-day dates pass. Candidate-complete Kotlin/TS fixtures and selected-script excerpts/navigation support 550 ms full input-to-render p95 including 250 ms debounce. |
| P5: Responsive online website | P4; applicable D7 routing decision | Website-owned React stack/hash routes, dedicated search worker, Shared UI resources, published Library artifact access, explicit Load search/size, filters, reading/preferences/continuity, player/sharing and offline entry. | Individual online reading needs no full library/index transfer; missing/new search index requires consent, not site entry/typing. Worker/IME/stale-response, query-preserving filter recovery, accessibility and direct root-base routes pass; player absent before Play. |
| P5a: Personal library and reading journeys | P5; applicable D4/D5 decisions | Favorites, repeated reference/placeholder occurrences, fallback labels, snapshot transfer/new-list-only import, duplicate-name warnings with confirmed reuse, recents/labels/bookmarks, most-recent-list recitation resume and practice (LIB, XFER, REC, LEARN). | Round trips preserve repetition/order/text; create/rename/duplicate/import allow warned/confirmed duplicate names without overwrite/merge; cancelled saves preserve state; explicit Continue restores only latest list/occurrence across restart, not per-list/scroll positions or practice state, and never transfers progress; removed-location choice, lossless fallback, privacy and accessible plain text verified. |
| P6: PWA offline slice | P5, P5a; D5 | Optional full download, active-version precedence, truthful compatibility/update guidance, soft reminders, safe same-version resume/repair and honest readiness (OFF, UX, LIB, XFER, REC, LEARN, EXP). | Complete offline functionality, filter recovery and explicit latest-list resume work without images/videos; newer incompatible content never forces loss of compatible reading or a false latest-published claim; safe website update preserves personal data and does not silently replace content; initial compatible/no-compatible paths pass; 3-day suppression and failed checks remain correct; no partial/mixed activation; degraded repair/removal recovery passes. |
| P7: Android client | P4; applicable D1/D4/D5/D7 decisions | Android `app` plus pure-Kotlin `core`; small APK without lyrics; required preparation, published content/manual GitHub Releases guidance, active-version/reminder/resume/repair parity, density, filters, duplicate-name and latest-list-resume parity, signed links/pending destinations. May proceed alongside P5/P5a/P6. | API 26+; initial failure keeps lyrics gated but recovery/lists accessible; no onboarding bypass; full offline use and verified repair pass; incompatible newer content preserves compatible reading with truthful guidance, no silent APK/content install; initial compatible/update-required paths, removal/total-loss gates, personal data, routing/accessibility and measured sizes verified. |
| P8: Production automation | P3, P4, P6, P7; D7 | Scheduled/backfill imports, source-only PR checks, full post-merge validation, root Pages output/association, selected shell lifecycle and signed APK workflow. | Review-to-publication, draft/internal-provenance exclusion with explicit Source Latin exception, signed APK/root links and deployment rollback tested. No forced shell activation/content replacement or permanent previous local snapshot implied. |
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
Later [questionnaire choices](design-decisions.md) settle the storage/format
directions, public Source Latin/status exception and post-merge/global-only
generation policy; exact schemas/versions/protocols remain open.
Isolated post-validation recovery is not permission for partial initial
preparation or selective offline saves. No phase above is marked implemented.
The further functionality review adds compatibility guidance, query-preserving
filter recovery, most-recent-list entry resume and duplicate-name warnings with
confirmed reuse, while retaining generic unavailable references. General
cross-session browsing restoration remains excluded. Performance/startup and
local persistence details stay with architectural decisions. The later
questionnaire explicitly revises search to 550 ms p95 including 250 ms debounce;
other web performance targets remain unchanged. No phase is implemented.

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
