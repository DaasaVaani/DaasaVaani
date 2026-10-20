# DaasaVaani documentation

This folder is the shared context for humans and AI coding agents.

## Reading order

1. [Approved requirements](requirements.md): product scope, requirement IDs,
   performance targets, exclusions, and acceptance scenarios.
2. [AI development guide](ai-development.md): task workflow, repository facts,
   approval rules, and handoff expectations.
3. [Approved individual design decisions](design-decisions.md): selected
   libraries/approaches, alternatives/trade-offs, superseded choices and open
   questions; consolidated final design approval remains pending.
4. [Architecture and decision gates](architecture.md): component ownership and
   decisions that must precede implementation.
5. [Data contracts](https://github.com/DaasaVaani/shared/blob/main/docs/data-contracts.md): contract boundaries and schema-design
   checklist; not an approved serialization schema.
6. [Implementation roadmap](implementation-roadmap.md): dependency-ordered slices
   and exit criteria; not a claim of completed work.
7. [Testing and release](testing-and-release.md): validation coverage, evidence,
   and deployment safeguards.

Read the relevant sections of the requirements before using a supporting guide.
Requirements define intended behavior; code and recorded validation establish
what is actually implemented. A guide is not evidence of implementation.

## Repository ownership

- [Website/PWA](https://github.com/DaasaVaani/DaasaVaani.github.io): root Pages at [daasavaani.github.io](https://daasavaani.github.io/).
- [Android](https://github.com/DaasaVaani/AndroidApp): native app and core.
- [Shared](https://github.com/DaasaVaani/shared): contracts, specs, fixtures, UI catalogs/generator and committed UI resources.
- [Library](https://github.com/DaasaVaani/library): reviewed content, ingestion, validation and publisher; planned Pages at [daasavaani.github.io/library/](https://daasavaani.github.io/library/).

`library/` is absent and `settings/` is empty in Website. Legacy-looking Markdown
reported in a separate sibling path is unreviewed and not established as
authoritative; source assessment/migration is pending and unauthorized. Website consumes published Library
artifacts only. Consumers pin Shared independently. Bootstrap does not mean app
builds, Library Pages, Website integration or app CI are implemented.

## Documentation ownership

### Community and repository operations

- [Contributing](CONTRIBUTING.md): issue, PR, content, and AI-assisted contribution expectations.
- [Security policy](SECURITY.md): private vulnerability reporting and support status.
- [Code of Conduct](CODE_OF_CONDUCT.md): participation standards and reporting routes.
- [Support](SUPPORT.md): where and how to ask for help.
- [Content rights](https://github.com/DaasaVaani/library/blob/main/docs/content-rights.md): source permissions, attribution, and rights concerns.
- [Maintenance checklist](maintenance.md): GitHub protections, dependency review, and release upkeep.

### Placement and updates

- Keep substantive project documentation here.
- [Copilot instructions](../.github/copilot-instructions.md) are outside this
  folder because repository-wide Copilot discovery expects that location.
- Keep that instruction file short and link here rather than duplicate guides.
- GitHub issue and PR templates live in `.github/` for discovery. Community
  policies live here in GitHub-supported `docs/` locations.
- Record approved technical decisions in the relevant guide with date, rationale,
  alternatives, and affected requirements. Add a separate decision document here
  only when the detail warrants one, and link it from the relevant guide.
- Do not change approved requirements silently to fit an implementation.

The user authorized this interim documentation update on 2026-10-21. Individual
stack, repository and behavior choices are recorded, but contracts/toolchain
pins, deployment capacity/workflows and other gates remain open. Overall final
design approval remains required; this is not coding authorization or a final
specification. Do not install an assumed toolchain.
