# DaasaVaani documentation

This folder is the shared context for humans and AI coding agents.

## Reading order

1. [Approved requirements](requirements.md): product scope, requirement IDs,
   performance targets, exclusions, and acceptance scenarios.
2. [AI development guide](ai-development.md): task workflow, repository facts,
   approval rules, and handoff expectations.
3. [Architecture and decision gates](architecture.md): component ownership and
   decisions that must precede implementation.
4. [Data contracts](data-contracts.md): contract boundaries and schema-design
   checklist; not an approved serialization schema.
5. [Implementation roadmap](implementation-roadmap.md): dependency-ordered slices
   and exit criteria; not a claim of completed work.
6. [Testing and release](testing-and-release.md): validation coverage, evidence,
   and deployment safeguards.

Read the relevant sections of the requirements before using a supporting guide.
Requirements define intended behavior; code and recorded validation establish
what is actually implemented. A guide is not evidence of implementation.

## Documentation ownership

### Community and repository operations

- [Contributing](CONTRIBUTING.md): issue, PR, content, and AI-assisted contribution expectations.
- [Security policy](SECURITY.md): private vulnerability reporting and support status.
- [Code of Conduct](CODE_OF_CONDUCT.md): participation standards and reporting routes.
- [Support](SUPPORT.md): where and how to ask for help.
- [Content rights](content-rights.md): source permissions, attribution, and rights concerns.
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

There are no approved technology-stack decisions in this documentation pack.
The next prerequisite for implementation is the applicable architecture decision
gate, not an assumed framework installation.
