# DaasaVaani

Hari Dasa Sahitya discovery, reading, practice and recitation through a responsive
static PWA and a separate native Android app.

**Status: initial fixture-only implementation; not a production release.**
The responsive React Website reads hash-verified artifacts from the Library fixture
publisher, with explicit indexed-search consent, canonical Kannada reading,
transactional favorites and independent interface-language/theme preferences.
First use follows the first supported browser-language preference, falling back
to configured English; an explicit saved language overrides browser preferences.
Library/Favorites searches and result positions survive in-session reading and
Back/Forward navigation, without persistent search history.
Settings can preview bounded list files/links locally, re-export snapshots and
explicitly save new independent lists. Lists supports creation, rename,
duplication and confirmed deletion, with repeated occurrences and duplicate-name
confirmation. Occurrences can be added, edited, moved, removed and explicitly
replaced without changing their independent identities or other repetitions.
Saved lists export independent minimal gzip files/links with stable-read revision
checks. Supported browsers offer explicit system sharing and clipboard copy;
selectable links and complete downloads remain available as fallbacks. System
handoff is not delivery confirmation. Available verified catalog titles resolve list references without fetching
lyrics; explicit Read opens known entries, and readers can add independent
occurrences to chosen lists. Native transfer and recitation remain incomplete.
Shared generates the English/Kannada UI resources; Android has a native preparation/
reading fixture demo. Production contracts, reviewed transliteration, persistent
offline snapshots and the remaining product journeys are incomplete.
Staged implementation is authorized; source migration and live API ingestion are not.

[AI instructions](AGENTS.md) | [Documentation](docs/README.md) |
[Requirements](docs/requirements.md) | [Current design](docs/design-decisions.md) |
[Roadmap](docs/implementation-roadmap.md) | [Validation](docs/testing-and-release.md)

## Product scope

- Kannada is canonical; transliterate, never translate. Nine non-Latin and five
  generated Latin profiles, optional reviewed Source Latin, independent UI/script
  preferences, system fonts, reading themes/density and aligned helpers.
- Kannada/Latin metadata/lyric AND search with exact bounded OSA fragments,
  filters, selected-script excerpts and matching-verse navigation. Explicit
  consent before an unprepared PWA downloads a missing/new search index.
- Device-local favorites, repeated ordered list entries/placeholders/fallbacks,
  bookmarks, learning state, recents and explicit latest-list recitation resume.
  Portable minimal list links/files create new lists only. Separate same-platform
  full backups replace personal state after validation/preview/confirmation.
- Android contains no lyrics and requires complete validated preparation; setup/
  recovery/list management remain accessible. PWA supports individual online
  reading and optional full preparation. No offline video/images.
- Prepared clients keep the active snapshot even online until explicit update.
  Failures preserve usable data; resume/repair is truthful. Soft reminder dates
  never expire content. YouTube player loads only after Play.
- Reviewed sources/metadata/assets are proposed via Library PRs. Real variants
  generate post-merge with global rules only. First API ingestion is blocked
  pending provider clarification; no invented lyrics/attribution.

See [requirements](docs/requirements.md) for the complete scope, exclusions,
acceptance scenarios and advisory performance goals.

## Repository ownership

| Repository | Responsibility |
| --- | --- |
| [Website](https://github.com/DaasaVaani/DaasaVaani.github.io) | React/TypeScript/Vite static PWA at https://daasavaani.github.io/ |
| [Android](https://github.com/DaasaVaani/AndroidApp) | Kotlin/Compose app/core, API26+, signed GitHub Releases APKs |
| [Shared](https://github.com/DaasaVaani/shared) | Contracts/settings/fixtures/UI catalogs, generator and committed resources |
| [Library](https://github.com/DaasaVaani/library) | Reviewed sources/assets/registries/ingestion/publisher, generated-only https://daasavaani.github.io/library/ |

Each consumer pins Shared independently and consumes validated published Library
artifacts. Website has no library source directory; settings owns web configuration.
Portable defaults/search/transfer bounds remain owned by Shared. No
backend/accounts/analytics/live sync/hosted short links or bundled lyric fallback.
All configurable product values use owned settings; native toolchain manifests/
locks own dependency pins.

## Contributing and validation

Start with [AGENTS](AGENTS.md), [the index](docs/README.md) and
[contributing guidance](docs/CONTRIBUTING.md). Do not install an assumed stack.
Current commands and full finalization/push gates are in
[testing and release](docs/testing-and-release.md). Run `npm ci` and `npm run check`
for fixture publication, build, unit and browser checks. The demo publisher requires
the clean validated Library revision in settings/tooling.yml with its Node
dependencies installed. `npm run demo` publishes synthetic
fixtures and serves the local demo on the configured port. No actual lyrics are
bundled or migrated. For authorized Shared pin updates,
follow the [Shared-first publication order](docs/testing-and-release.md#shared-submodule-updates).

Update current guides with changes. Past decisions, dated observations and test
records belong only in [HISTORY.md](HISTORY.md), not current instructions.
Preserve unrelated work/staging; validation does not authorize commits or pushing.

## Community, privacy and licensing

[Support](docs/SUPPORT.md) | [Security reporting](docs/SECURITY.md) |
[Code of Conduct](docs/CODE_OF_CONDUCT.md) |
[Content/provider policy](https://github.com/DaasaVaani/library/blob/main/docs/content-rights.md)

Personal state is local except explicit sharing/backup and disclosed Android
system backup. Shared files/links can be forwarded; gzip is not encryption.
No secrets, credentials, private correspondence or payload logs in the repository.
Project-authored software is [Apache2.0](LICENSE); third-party lyrics, images,
recordings and trademarks retain their rights. Public availability is not permission.
