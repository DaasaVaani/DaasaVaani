# Architecture boundaries and decision gates

Status: Individually approved technical directions are recorded in
[design decisions](design-decisions.md); consolidated design approval and
complete implementation contracts remain pending. No implementation is claimed.
See [requirements](requirements.md), especially sections 7, 14, and 18.

## Component responsibilities

| Component | Owns | Must not do |
| --- | --- | --- |
| Ingestion (Library) | New-video discovery, source extraction, draft creation, thumbnail acquisition/optimization, classification-registry additions, source review PRs. | Generate actual item variants/previews in PRs, publish unreviewed content, overwrite reviewed entries, or fabricate classifications. |
| Library repository sources | Flat item Markdown/YAML, registries, catalog-specific settings, reviewed assets and manual corrections. `library/` is absent and `settings/` is empty here. Legacy-looking Markdown has been reported in a separate sibling path but is unreviewed; source assessment/migration remains pending and unauthorized. | Store secrets or personal user preferences. |
| Validation | Library owns source/publication checks; Shared owns portable specs/fixtures; platforms own fixture runners and implementation tests. | Treat an invalid published item as an acceptable draft silently. |
| Publication generator (Library) | Post-merge variants/packaging, five initial Latin profiles (Hunterian deferred), separate Bengali/Assamese, Source Latin/status, global index and snapshot policy, ledger/dates, thumbnail-free bundles and separate online images. | Include drafts/held items/private provenance, invent alignment, use item overrides or require client-derived taxonomy. |
| Website/PWA and Android | Generated queries/excerpts, script/Latin/density preferences, recitation/practice, local personal state, repeated list occurrences, new-list-only snapshot imports, explicit offline lifecycle/readiness, soft update reminders, online video/sharing; Android preparation gate and PWA online reading. | Parse repository Markdown, translate lyrics, upload lists, append/merge/replace imported lists, silently refresh active content, or bypass initial Android preparation through a link/onboarding flag. |
| CI/release | Each repository owns checks; Library publishes validated content, Website deploys root PWA, Android releases APKs independently. Future test choices are not evidence app CI exists. | Deploy partially generated output or expose credentials to clients. |

Four public repositories divide ownership: [Website](https://github.com/DaasaVaani/DaasaVaani.github.io), [Android](https://github.com/DaasaVaani/AndroidApp), [Shared](https://github.com/DaasaVaani/shared), and [Library](https://github.com/DaasaVaani/library). Shared holds contracts/specs/fixtures and canonical UI catalogs plus generated UI resources, not lyric content or application runtime.

Dependency direction: Shared -> Website, Shared -> Android, and Shared -> Library. Shared must not depend on consumers. Each consumer pins Shared independently. Website and Android consume validated published Library artifacts only, not Library source. Website publishes at https://daasavaani.github.io/; Library has its own planned generated publication at https://daasavaani.github.io/library/. Capacity, service-worker scope, compatibility and deployment remain open.

The repositories have hygiene workflows, not application/content-pipeline CI.
Website has no Library source directory and its settings directory is empty.
Legacy-looking sibling content remains unreviewed; no migration is authorized.
The [Shared implementation-design record](https://github.com/DaasaVaani/shared/blob/main/docs/implementation-specification.md)
records earlier approvals and remaining gates; final pins/integration evidence
must not be inferred from researched candidates.
Client runtime is fully static: no application
backend, server-side database, server-side personal storage, hosted snapshot/short-link
service, or redirect service. Static artifact requests, local storage and explicit
YouTube playback remain permitted. Maintainer-side API/import/publication work
does not run in the user's browser/app.

## Data flow

```text
YouTube API
  -> Library ingestion -> proposed Library source Markdown + assets + settings
  -> Library PR validation and human review -> approved Library sources
  -> Library post-merge variant/index/package generation and full validation
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
Use system fonts only; confirmed unsupported renderings require warnings and
explicit alternatives, not packaged/downloaded fonts or silent substitution.

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

PRs validate sources and applicable tooling fixtures, without real item variant
generation or previews. Generate/validate actual variants only after approved
merge; failure blocks deployment and preserves the previous publication.
Correct generated output only through reviewed global rules, never per-item
overrides. Kannada remains canonical. Supplied Source Latin is public with
suitability information even when unsuitable, but only suitable complete
corresponding text is selectable; reliable alignment gates helpers/verse-linked
features. Other internal provenance remains excluded. Never silently mix/switch.

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
service. A separate full personal backup/confirmed recoverable replacement is
approved, not a minimal-list transfer or downloaded-content backup.

Snapshot links are self-contained and client-decoded, with preview before saving.
Sender edits do not update existing links and links cannot be remotely revoked.
Keep payloads out of host requests/logs; oversized links use file fallback.
Verified Android routing requires the signed app association at
`https://<website-host>/.well-known/assetlinks.json`, not only beneath a project
subpath. Select a controllable host-root arrangement; preserve browser and explicit
Open in app fallback without overriding user/platform choices.

## Selected foundation and incomplete gates

The [decision record](design-decisions.md) owns the complete library choices,
alternatives and unresolved details. Storage uses Android private gzip objects,
one transactional Room personal database including backup-covered preferences,
with separate content/control state, and equivalent personal separation in Dexie.
This supersedes splitting backed-up preferences into DataStore. Both consume identical
manifest/SHA-256-addressed gzip artifacts and ZIP STORE transport bundles.
One active snapshot plus one resumable target is selected, not a permanent
previous local snapshot or automatic rollback.

Search uses one prebuilt global compact JSON/gzip index and independent
Kotlin/TypeScript matching. Browser computation uses a dedicated Web Worker,
not the shell service worker. Online unprepared PWA index transfer requires
Load search with size. AND substrings and bounded code-point OSA fragments,
250 ms debounce and 550 ms end-to-end p95 are selected; normalization/weights,
exact structures and measured feasibility remain open.

Every configurable value originates in owning-repository settings. Portable
normalization/ranking policy is hash-pinned to its snapshot. Kannada/Latin query
coverage, metadata-first additive ranking and bounded item reads for selected-
script excerpts are selected; that I/O remains inside the 550 ms target.

React Router hash navigation and the root Pages target are selected.
`vite-plugin-pwa`/Workbox GenerateSW owns shell precaching; content remains with
the coordinator/IndexedDB. Notify about ready code, then normal worker
activation after old controlled windows close; no forced activation/reload.

Individual choices do not close whole gate packages. No gate below is declared
fully closed, and overall final design approval remains pending. Retain selected
directions while resolving the remaining details/evidence below; do not reopen
framework choices merely because versions/contracts are incomplete.

| Gate | Decision package | Required evidence |
| --- | --- | --- |
| D1: Toolchain and clients | Client/library families selected; compatible versions, dependency managers, package boundaries and local commands remain open. | Prove API 26/browser compatibility, supported libraries, accessible native/static journeys, small APK, reproducible bootstrap/checks and toolchain compatibility. |
| D2: Source contracts | Exact YAML/settings schemas, lyric/verse representation, status rules, extensibility, correction storage, asset paths, library-added date/backfill policy. | Valid/draft/invalid examples; old-item compatibility; field/reference validation; stable dates on edits. |
| D3: Language processing | Five initial profiles, Hunterian deferred, native approximations, Tamil Grantha/consonant superscripts and Source Latin alignment eligibility selected; exact tables/Unicode/aliases remain open. | Independent profile/global-rule expectations, permitted samples, catalogs and system-font/alignment evidence; no actual item variants/previews in source PRs. |
| D4: Generated contracts/search | Exact 2020-12 schemas/capabilities, snapshot policy, additive weights/aliases, typed references, separate list/full-backup formats and remaining limits. | Round trips/ranking/OSA scan parity, safe precommit failure and truthful postcommit locale recovery, new-list-only minimal imports, privacy and five-profile selected-script I/O timing. |
| D5: Offline and local lifecycle | Manifest/integrity/storage, downloaded-version precedence, generator dates/local 3-day suppression, same-version resume/repair, degraded verification, Android gate/pending destinations, optional PWA setup, atomic activation/removal, separate local state including one most-recent recitation occurrence, density/readiness/navigation/screen-awake. | Initial failure leaves no active library; update failure preserves old data; no mixed versions; isolated damage retains verified capabilities with degraded UI; total loss/removal re-gates Android; >=7-day soft date independent of APK/download; truthful update status and compatible offline use despite newer incompatible content; explicit latest-list resume with removed-location recovery, no per-list/scroll restoration; actual sizes, fonts and accessibility tests. |
| D6: Import operations | Canonical channel resolution, pagination/quota strategy, backfill batches, pending-PR reconciliation, thumbnail optimization. | Idempotency and failure cases; correction preservation; configured manual local execution. |
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

The current Website workflow stages only the placeholder `index.html`; it does not publish Library content. Library Pages and Website-side publication integration are not implemented. When built, Website deploys its root PWA and Library independently deploys fully validated generated public output, never source roots; drafts/internal descriptions remain excluded except the explicit public Source Latin text/status boundary. Define rollback and compatibility behavior before automatic releases. Do not modify workflows in this documentation-only task.
