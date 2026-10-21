# DaasaVaani

An open-source project to make Hari Dasa Sahitya easy to discover and read through
an Android app and an accessible, mobile-first website.

**Status: planning / pre-implementation.** This Website repo has a placeholder,
its Pages workflow and documentation, not reviewed Library sources. The four
public repositories are bootstrapped, but app/content tools, Library Pages and
Website publication integration are not implemented. Product capabilities below
remain planned. Individual choices are recorded; final approval/contracts remain pending.

[Documentation](docs/README.md) |
[Requirements](docs/requirements.md) |
[Design decisions](docs/design-decisions.md) |
[Recorded implementation design](https://github.com/DaasaVaani/shared/blob/main/docs/implementation-specification.md) |
[Roadmap](docs/implementation-roadmap.md) |
[Contribute](docs/CONTRIBUTING.md) |
[Security](docs/SECURITY.md)

## What we are building

- A responsive, installable website/PWA and Android app for phones, tablets,
  touch laptops, and desktops.
- Canonical Kannada lyrics with reviewed transliterations into Latin/English,
  Devanagari, Telugu, Tamil, Malayalam, Gujarati, separate Bengali and Assamese, Gurmukhi,
  and Odia scripts. **Lyrics are never translated.**
- Five initial generated Latin variants: ISO 15919:2001, IAST Kannada,
  Baraha, ITRANS and Harvard-Kyoto; Hunterian is deferred. Exact profiles must be pinned
  and tested. Suitable complete supplied text may also appear as Source Latin,
  never silently mixed with generated lines. Users choose their variant; any
  recommendation awaits side-by-side sample review.
- Kannada and English interface translations, with remembered UI-language,
  lyric-script, and reading-font preferences. Light, Dark, and Warm reading
  themes, follow-device light/dark selection, and skippable preference setup.
  Choose Compact, Normal or Relaxed reading density during setup or later, with
  comfortable tablet/desktop reading columns and preserved lyric structure.
- Search across metadata and lyrics, with differentiated metadata/lyric weights
  and filters for combined Composer/Ankita, deity, composition form, broad
  category and narrative context. Tags are searchable only; no upload-year
  filter. Require all query terms, including within-word substrings and bounded
  code-point typo matches: `dir sh` matches `vadiraja krishna`. Match selected
  Kannada/Latin queries and reviewed search-only spellings, preview selected-script lines, and
  open at the matching verse. Keep active filters visible, remove them
  individually, or clear filters without losing the typed query.
  A prebuilt global JSON/gzip index is downloaded, not built on clients.
  Unprepared online website search requires Load search with size before a
  missing/new index transfer; individual online lyric reading remains available.
  Search uses 250 ms debounce and a 550 ms p95 input-to-visible-results target,
  including excerpts/highlights after index loading; this is not measured yet.
- Local favorites and multiple named, ordered recitation lists with rename,
  duplicate, editing, and share/export/import actions. Ordered entries may be
  library references or user-written single-line placeholders with an unavailable
  message; unresolved references can carry user-written fallback labels.
  Repeated entries remain independent and keep their order through transfer.
  Warn about duplicate list names but allow them after confirmation. Unresolved
  references retain generic unavailable messaging, without a special
  version-aware update action.
- Self-contained HTTPS snapshot links that prefer the installed Android app
  where verified-link settings permit, with browser fallback and preview before
  explicit saving as a new independent list, never append/merge/replace.
  Oversized lists use file export without truncation. Links/files carry
  only the list name, format version, ordered references/placeholders and approved
  user-written text, not lyric copies or live synchronized lists.
- Device-only recently opened lyrics with clear/disable controls, optional
  learning-status labels, and multiple verse bookmarks through My Library.
- Current-session search/filter/list-position restoration and natural website
  Back/Forward and Android Back navigation.
- Distraction-free recitation with optional supported screen-awake control,
  verse-by-verse learning with remembered position, and optional aligned
  Kannada/Latin helper text beneath the preferred lyric script.
  Explicitly continue the most recently recited list at its saved entry
  occurrence across restarts, separately from practice progress; this local
  position is not shared and is not an exact lyric scroll position.
- An optional Explore section for reviewed categories, another-lyric discovery,
  and newly added library items, without personalized tracking.
- Online, user-initiated inline YouTube playback and shareable item/video links.
- A small Android APK without bundled lyrics; an explicit complete-library
  download/validation is required before lyric browsing or reading. Preference
  setup can be skipped, but library preparation cannot. Settings, recovery and
  list management remain accessible before preparation.
- On-demand online lyric reading on the website/PWA, with an optional explicit
  complete-library download for offline use. Download lyrics, metadata, script
  variants, indexes and required reading assets, not thumbnails or videos.
  Use system fonts only, with explicit warnings/alternate choices for confirmed
  unsupported renderings; no bundled/downloaded fallback fonts.
- Per-list offline-readiness checks distinguish available library lyrics,
  unresolved references and intentional placeholder counts/warnings.
  Reading, search, lists, practice, and discovery work from downloaded content.
  Online thumbnails load from static hosting; offline views use icons/metadata.
- Explicit, validated content updates that preserve a working library on failure.
  After full download, use that version even online until explicit update.
  Resume validated same-version progress where safe; isolated later damage keeps
  verified unaffected features usable with degraded readiness and repair.
  Generator-assigned update-recommended dates are at least 7 days after content
  generation and never block downloaded use; successful no-newer-compatible
  checks suppress the reminder for 3 days without changing those dates.
  Distinguish a current library from newer content needing a newer client;
  offer manual Android/safe website update guidance while keeping compatible
  downloaded reading usable. Initial setup can use a published compatible
  complete library when available, otherwise explains the client-update need.
  Removing offline content preserves personal state, but Android must prepare its
  library again; there is no bundled fallback.
- A review-first content pipeline: initial historical import, then manually run
  local new-video discovery with content, thumbnails, and settings proposed in PRs.
  Actual generated variants/indexes/packages are produced only after merge, with
  no PR previews or per-item generated-text overrides. Global conversion fixes
  preserve canonical Kannada. Supplied Source Latin/status is public even when
  unsuitable, but unsuitable text is not a selectable/searchable reading variant.
- Separate full personal export/restore, with explicit recoverable replacement
  and disclosed Android Auto Backup for the personal database, never content.
- Every configurable value belongs in reviewed owning-repository `settings/`
  files, not hardcoded defaults, mappings, ranking weights or limits.

## Repository organization

- [Website/PWA](https://github.com/DaasaVaani/DaasaVaani.github.io) publishes at
  [daasavaani.github.io](https://daasavaani.github.io/) and consumes published
  Library artifacts only.
- [Android](https://github.com/DaasaVaani/AndroidApp) owns the native app and core.
- [Shared](https://github.com/DaasaVaani/shared) owns contracts, specs, portable
  fixtures, canonical UI catalogs, generator and generated UI resources.
- [Library](https://github.com/DaasaVaani/library) owns reviewed content, ingestion,
  validation and publication; its planned site is
  [daasavaani.github.io/library/](https://daasavaani.github.io/library/).

Each consumer pins Shared independently. `library/` is absent from this Website checkout and `settings/` exists but is
empty; neither contains the Library sources. Legacy-looking Markdown has been
reported in the separate sibling `WebsiteLibrary\dasasahitya` path, but it has
not been reviewed or established as authoritative. Any source assessment or
migration remains pending and unauthorized. The recorded review passes are
documented across their owning repositories; this does not migrate source content.
Library Pages and Website-side publication integration are not implemented.

See [approved individual decisions and trade-offs](docs/design-decisions.md) for
layouts, build/test choices, lifecycle and remaining gates. Overall final approval
remains pending; bootstrap does not authorize app implementation, dependencies,
release or deployment.

The source channel is
[bhajane-dasarahadugalu- on YouTube](https://www.youtube.com/@bhajane-dasarahadugalu-).
Each video is a separate library item. The project has no rights/attribution
publication gate; see [content rights](https://github.com/DaasaVaani/library/blob/main/docs/content-rights.md) for the policy.

## Availability and compatibility

The planned website will be fully static on GitHub Pages, without an application
backend, server-side database, or server-side user-list storage. Static artifact downloads,
local browser/app storage, explicit YouTube playback, and maintainer-side GitHub
Actions remain allowed. Signed Android APKs will be
distributed through [AndroidApp GitHub Releases](https://github.com/DaasaVaani/AndroidApp/releases).
This is the intended distribution route, not a claim that an app release exists.
Google Play distribution is deferred.

Verified Android App Links require a signed app association at a controllable
website host-root location; a GitHub Pages project subpath alone is insufficient.
The selected root-site target is `https://daasavaani.github.io/`, base `/`.
The repository already resolves to `DaasaVaani/DaasaVaani.github.io`; root-site
application deployment and signed association still require implementation and
validation. No old Pages URL redirect is assumed.
Automatic routing remains subject to user/platform settings. Actual APK, complete
download, installed and update peak-storage sizes must be measured before release;
the expected approximately 2,500 songs do not establish package size.

Targets include Android 8.0/API 26+, current and previous major versions of
Chrome, Edge, Firefox, and Safari, and responsive layouts from 320 CSS pixels.
Accessibility is best effort with no WCAG claim. Risk-based release evidence must
cover platform boundaries and physical devices; latest Chromium/emulator smoke
alone does not establish the supported matrix. No app/device results exist yet.
PWA installation/storage behavior varies by browser.

## Explore the repository

| Location | Purpose |
| --- | --- |
| [docs/](docs/README.md) | Requirements, architecture gates, data-contract guidance, roadmap, testing, and community policies. |
| `library/` | Absent from this Website checkout. Reported legacy-looking sources are in a separate sibling path and remain unreviewed; ownership/migration is unresolved. |
| `settings/` | Directory exists but is empty. Library is the approved target for catalog-specific settings; no source files/contracts are present here. |
| [index.html](index.html) | Website placeholder; Library publishing and Website integration are not implemented. |
| [.github/workflows/deploy.yml](.github/workflows/deploy.yml) | Stages/deploys only the Website placeholder, not Library sources or validated content. |
| [.github/copilot-instructions.md](.github/copilot-instructions.md) | Concise AI coding guidance linked to the shared docs. |

Generated groups and search/filter indexes will be built from reviewed content
and settings. Clients will query those artifacts rather than parse source
Markdown. Drafts must never enter public artifacts or offline packages.

## Getting started

Git is sufficient to clone and review the current documentation:

```text
git clone https://github.com/DaasaVaani/DaasaVaani.github.io.git
cd DaasaVaani.github.io
```

Start with the [documentation index](docs/README.md) and
[approved requirements](docs/requirements.md). There is no application dependency
manifest, Android build, content validator, or app test command yet. Do not
install an assumed stack; use the [decision gates](docs/architecture.md).
Build and test commands will be documented as tooling is implemented.

## Contributing

Documentation, accessibility feedback, Kannada/transliteration review, and
well-scoped design proposals are welcome. Read the
[contribution guide](docs/CONTRIBUTING.md) before starting and agree on significant
technical decisions before submitting a large implementation.

AI-assisted contributions follow the same review, licensing, and testing
standards. AI-generated text is not evidence of linguistic accuracy, source
permission, or working code.

## Support and community

- Use [GitHub Issues](https://github.com/DaasaVaani/DaasaVaani.github.io/issues) for
  non-sensitive bugs, feature requests, and project questions; search existing
  issues first.
- Include environment information and reproducible steps, but never credentials
  or private data.
- Follow the [Code of Conduct](docs/CODE_OF_CONDUCT.md).
- Report potential vulnerabilities privately using the
  [security policy](docs/SECURITY.md), not public issues.

This is an early-stage community project; response times and release dates are
not guaranteed. See [support guidance](docs/SUPPORT.md).

## Privacy and safety

The initial product scope excludes accounts, ads, analytics, tracking, and
cross-device synchronization. Preferences and downloads are local.
Favorites, recitation lists, most-recent-list recitation position, practice position, optional learning labels, verse
bookmarks, and enabled recently opened history also stay local. Users can clear
or disable reading history; it is not sent to an analytics/tracking service.
Users may explicitly transfer snapshot links/files, including placeholder and
fallback text. Recipients can read and forward them; do not put sensitive
information in shared text or assume links can be revoked. These do not synchronize lists
or include lyrics, favorites, recitation resume position, practice progress, history, learning labels,
bookmarks, or preferences. Clearing app/browser data may remove local personal
data. List export backs up list references and approved user-written text only,
not all personal data.
Embedded playback will contact YouTube only after the user chooses Play and
will be subject to YouTube's privacy and availability restrictions.
These are requirements, not an assertion that an implemented app has been audited.

Maintainers can use the [maintenance checklist](docs/maintenance.md) to configure
review protections, private reporting, dependency updates, and safe releases.
Documentation alone does not enable GitHub security settings.

## License and third-party content

Project-authored software is licensed under [Apache License 2.0](LICENSE).
Preserve applicable license and attribution notices when contributing or reusing
the project.

Lyrics, descriptions, thumbnails, videos, and other third-party material may
carry separate rights. The repository's software license does not grant rights
that contributors do not hold. See the [content-rights policy](https://github.com/DaasaVaani/library/blob/main/docs/content-rights.md)
for the project's current dno-gate) stance.
