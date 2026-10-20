# Architecture boundaries and decision gates

Status: Required logical boundaries, not an approved technology design.
See [requirements](requirements.md), especially sections 7, 14, and 18.

## Component responsibilities

| Component | Owns | Must not do |
| --- | --- | --- |
| Ingestion | New-video discovery, source extraction, draft creation, transliteration proposals, thumbnail acquisition/optimization, filter-registry additions, review PRs. | Publish unreviewed content, overwrite existing reviewed entries, or fabricate classifications. |
| Repository sources | Flat item Markdown/YAML, reviewed assets, settings, manual corrections. | Store secrets or personal user preferences. |
| Validation | Draft-aware structural checks, identity/reference consistency, generated-artifact checks. | Treat an invalid published item as an acceptable draft silently. |
| Publication generator | Approved content packaging, all six generated Latin profiles and suitable optional Source Latin, groups, filters, search artifacts/line correspondence, stable library-added dates, snapshot generation/recommended dates, thumbnail-free snapshots and separate online images. | Include drafts, silently mix source/generated Latin, or require clients to derive taxonomy from source Markdown. |
| Website/PWA and Android | Generated queries/excerpts, script/Latin/density preferences, recitation/practice, local personal state, repeated list occurrences, new-list-only snapshot imports, explicit offline lifecycle/readiness, soft update reminders, online video/sharing; Android preparation gate and PWA online reading. | Parse repository Markdown, translate lyrics, upload lists, append/merge/replace imported lists, silently refresh active content, or bypass initial Android preparation through a link/onboarding flag. |
| CI/release | PR validation, publication after approved merge, independent signed APK release. | Deploy partially generated output or expose credentials to clients. |

Logical components may share code. They do not prescribe packages, directories,
languages, or a monorepo framework. Client runtime is fully static: no application
backend, server-side database, server-side personal storage, hosted snapshot/short-link
service, or redirect service. Static artifact requests, local storage and explicit
YouTube playback remain permitted. Maintainer-side API/import/publication work
does not run in the user's browser/app.

## Data flow

```text
YouTube API
  -> ingestion -> proposed Markdown + variants + assets + settings
  -> PR validation and human review -> approved repository sources
  -> publication validation/generation
  -> static version-consistent content + indexes + reading assets
  -> website/PWA and Android
  -> explicit download/refresh -> validated active offline snapshot
```

Android packages no lyric library and enables lyric browsing/reading only after
complete preparation. Before it, keep setup, recovery, Settings and list
management/previews accessible, retaining pending shared-link destinations.
PWA online reading fetches selected lyric content and required generated data
without a complete-library download; optional offline setup uses the same reading
snapshot contract. Thumbnails are online static assets, not offline dependencies.
Prefer system fonts; include only tested fallback coverage needed for all scripts.

After a complete download, both clients use the active snapshot even online
until explicit validated update; the PWA's pre-download online path uses
compatible published static data. Keep a snapshot's generation and
update-recommended dates authoritative: generation assigns the latter at least
7 days later, not relative to APK compilation or download. The reminder never
blocks downloaded use. A successful check finding no newer compatible version
suppresses it locally for 3 days without altering snapshot dates; failure must
not claim freshness or reset this suppression.

Distinguish no newer published library from a newer incompatible publication;
the latter requires truthful client-update guidance, not a latest-published
claim. Offer manual Android updates through GitHub Releases or an appropriate
safe website-version update action. Preserve existing compatible downloaded use
and personal data without forced upgrades or automatic content replacement.
Initial preparation may use a published compatible complete library when
available; otherwise explain the client-update prerequisite.

Retain validated download progress for explicit safe same-version resume,
explaining restarts when necessary. Never activate an incomplete initial library
or mix versions. After isolated damage to a previously validated snapshot, keep
independently verified unaffected capabilities usable with degraded readiness and
explicit repair. Do not silently substitute newer online items or return false
empty searches. Same-version repair or explained complete replacement restores
readiness; deliberate removal/total loss re-gates Android. Browser closure does
not guarantee ongoing background downloads.

Generate and structurally check variants during content processing for the
normal content PR, without separate human sign-offs for each script. Kannada
remains canonical. Source Latin is an optional suitable complete supplied
variant, not authority for generated text. Retain raw provenance but publish it
as a reading variant only when suitable; require reliable alignment for helpers
and verse-linked features. Never silently mix or switch selected variants.

Manual edits to existing items re-enter through review and validation. They do
not require automatic rescanning of existing YouTube videos.

Favorites, recitation lists, preferences/setup state, most-recent-list recitation
position, practice position, learning
labels, verse bookmarks, and enabled recent-item history form a separate local
store, not part of published content or the replaceable offline snapshot.
Browsing continuity is current-session navigation state, not persistent
search-query history or cross-session restoration. Do not upload either kind of
local state except approved fields through explicit sharing.
The narrow REC-04 exception remembers only the most recent recitation list and
exact occurrence across restarts, not navigation history, per-list positions or
exact lyric scroll. Continue is explicit; removed locations need an explanation
and user choice. Keep this position separate from practice progress and transfers.

Keep active filters visible with individual removal and Clear filters retaining
the query, including filtered empty-result recovery online/offline. Unresolved
item/list references use generic unavailable messaging without a dedicated
version-aware update action; preserve identifiers, user text and ordinary library
update controls.

Offer Compact, Normal and Relaxed during skippable preference onboarding and
later reading/settings controls, remembering density locally. Apply it to
primary/helper text across themes and normal reading/Recite/Practice offline.
Preserve line breaks and distinct verse separation; validate spacing and bounded
tablet/desktop columns with accessibility and narrow-screen/text-scaling tests.

Snapshot links/files
carry only the list name, version and ordered library references/placeholders with
approved user-written fallback/placeholder text, preserving repeated occurrences.
Import previews require explicit save as a newly named independent list only;
they never append, merge or replace existing lists, even when names match.
Warn about names already held by another list during create/rename/duplicate/
import, but allow reuse after confirmation; never identify or merge lists by name.
They do not transfer lyrics or
other personal state, establish offline readiness, introduce a synchronization
service, or provide a full personal-data backup.

Snapshot links are self-contained and client-decoded, with preview before saving.
Sender edits do not update existing links and links cannot be remotely revoked.
Keep payloads out of host requests/logs; oversized links use file fallback.
Verified Android routing requires the signed app association at
`https://<website-host>/.well-known/assetlinks.json`, not only beneath a project
subpath. Select a controllable host-root arrangement; preserve browser and explicit
Open in app fallback without overriding user/platform choices.

## Decisions requiring approval

All gates below are OPEN. Discussion or an example is not approval.
Resolve a gate before implementing the work that depends on it; unrelated
approved work need not wait for every gate.

| Gate | Decision package | Required evidence |
| --- | --- | --- |
| D1: Toolchain and clients | Languages/frameworks, native versus shared-web Android approach, versions, dependency managers, package boundaries, local commands. | Alternatives against API 26, browser support, no-backend static runtime, small APK/required library setup, PWA online reading, accessible journeys, themes, link/file handling, native/browser navigation, screen-awake support, maintenance and testing. |
| D2: Source contracts | Exact YAML/settings schemas, lyric/verse representation, status rules, extensibility, correction storage, asset paths, library-added date/backfill policy. | Valid/draft/invalid examples; old-item compatibility; field/reference validation; stable dates on edits. |
| D3: Language processing | Library and pinned versions/options/mappings for ISO 15919:2001, IAST, Hunterian, Baraha, ITRANS and Harvard-Kyoto with explicit Kannada conventions/extensions and canonical output; Source Latin suitability/alignment; Unicode/search alternatives, fonts and corrections. | Permitted side-by-side samples before user selects any Latin recommendation/default; all-script and six-profile fixtures including case/diacritic semantics, loss/collisions, corrections and source/generated separation; offline glyph/shaping coverage and reliable line/verse alignment. No separate per-script human sign-off gate. |
| D4: Generated contracts/search | Publication/version compatibility and discovery, filter/search/excerpt data, online images, typed reference/placeholder payload with repeated occurrences, occurrence identity, duplicate-name comparison/warning UI, self-contained link encoding/limits and file validation. | Round trips preserve every occurrence/order/text; new-list-only save, confirmed duplicate names without existing-list mutation; no ordinary titles/lyrics/resume state; bounded local decode and payload privacy; stable saved locations; visible removable filters preserve query; performance includes six Latin variants/excerpts. |
| D5: Offline and local lifecycle | Manifest/integrity/storage, downloaded-version precedence, generator dates/local 3-day suppression, same-version resume/repair, degraded verification, Android gate/pending destinations, optional PWA setup, atomic activation/removal, separate local state including one most-recent recitation occurrence, density/readiness/navigation/screen-awake. | Initial failure leaves no active library; update failure preserves old data; no mixed versions; isolated damage retains verified capabilities with degraded UI; total loss/removal re-gates Android; >=7-day soft date independent of APK/download; truthful update status and compatible offline use despite newer incompatible content; explicit latest-list resume with removed-location recovery, no per-list/scroll restoration; actual sizes, fonts and accessibility tests. |
| D6: Import operations | Canonical channel resolution, pagination/quota strategy, backfill batches, pending-PR reconciliation, thumbnail optimization. | Idempotency and failure cases; correction preservation; configured Sunday/manual execution. |
| D7: Publishing/releases | Static Pages routing/base path, controllable App Links host root, publish directory, CI permissions, version policy, signing, release and safe client-update guidance. | Signed APK/domain verification/fallbacks, direct links, draft/provenance exclusion, rollback, no lyric bundle, actual size evidence and independent content/APK compatibility; manual Android/safe website upgrade preserves personal data and compatible reading, with published-compatible or update-required initial-preparation paths. |

D2 precedes source validators; D2/D3 precede ingestion text processing; D4
precedes client integration; D4/D5 precede offline activation. D1 supplies the
toolchain for executable implementations. D6 depends on the applicable source
and language decisions; D7 integrates the resulting artifacts.

## Decision record format

When the user approves a gate, replace its OPEN status or link an approved record:

```text
Decision ID and title:
Status: Proposed | Approved | Superseded
Approval date and confirmation reference:
Affected requirement IDs:
Alternatives and trade-offs:
Chosen approach and rationale:
Contract/version/migration impact:
Validation plan and evidence:
Remaining limitations:
```

Do not claim user approval based only on an AI recommendation. Revisit decisions
explicitly if they would weaken a confirmed requirement.

## Existing deployment transition

The current workflow uploads the repository root. Before real content is
published, replace that input with a validated public output directory so draft
files and internal source descriptions are not exposed as static assets.
Do not modify the deployment workflow as part of a documentation-only task.
Define rollback and compatibility behavior before relying on automatic releases.
