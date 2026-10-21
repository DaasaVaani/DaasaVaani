# Contributing to DaasaVaani

Thank you for helping make Hari Dasa Sahitya more accessible.
Participation is subject to the [Code of Conduct](CODE_OF_CONDUCT.md).

## Before you start

1. Read the [requirements](requirements.md) and [documentation index](README.md).
2. Search existing issues and PRs to avoid duplicate work.
3. For significant work, open an issue describing the outcome, requirement IDs,
   acceptance criteria, and proposed approach.
4. Obtain maintainer agreement before selecting a framework, schema, library, or
   other open [architecture decision](architecture.md).
   Preserve the [approved individual choices](design-decisions.md); overall
   final design approval is still pending.

Small corrections do not require a separate design discussion. Do not report
security issues publicly; use the [security policy](SECURITY.md).

## Working on a change

- Work in the owning repository: [Website](https://github.com/DaasaVaani/DaasaVaani.github.io), [Android](https://github.com/DaasaVaani/AndroidApp), [Shared](https://github.com/DaasaVaani/shared), or [Library](https://github.com/DaasaVaani/library).
- Source PRs belong in Library; contracts/specs/fixtures/UI catalogs belong in Shared. Consumers update their own Shared pins separately; no lockstep is required.
- Fork the owning repo if needed, create a focused branch, and keep the PR scoped.
- Preserve unrelated changes and reviewed content; update related docs and tests.
- Use the [testing guide](testing-and-release.md) for actual Node/React and native
  build/test commands. Fixture tests are not complete production conformance.
- For documentation, check relative links and run `git --no-pager diff --check`.
- Focused tests are incremental only. Finalization/confirmation and every push
  require complete applicable builds and all tests under the testing guide.
  Documentation-only work has the all-available-checks exception only while app
  tooling is absent; missing/failing required code checks are blockers, not passes.
- Keep current guides synchronized with changes. Move superseded decisions,
  chronology and dated validation records only to [HISTORY.md](../HISTORY.md).
- Never commit secrets, signing keys, private data, or live credentials in fixtures.
- Treat downloaded descriptions and Markdown as untrusted input.

## Content and language changes

- Kannada is canonical; lyrics are transliterated, never translated.
- Preserve verse structure, stable UUIDs and reviewed source corrections.
  Explain source changes; missing saved anchors are not heuristically remapped.
- Source PRs contain canonical Kannada, supplied Source Latin and metadata, not
  generated variants/previews or companion source files. Generate actual variants
  only after merge; generated-text fixes are global rule/profile changes, never
  item/line overrides or edits to correct Kannada solely to force conversion.
- Flag uncertain/missing lyrics as drafts rather than fabricate them.
- Include required thumbnail assets and catalog-setting changes with the Library
  source PR. `library/` is absent in Website; web settings live under `settings/`.
  Legacy-looking Markdown
  reported in a sibling path has not been reviewed; no migration is authorized.
- Follow the [content-rights policy](https://github.com/DaasaVaani/library/blob/main/docs/content-rights.md); public availability is
  not permission to redistribute.
- Identify the script reviewed and any linguistic uncertainty. Automated output
  alone does not establish accuracy.

## Pull request expectations

Use the owning repository's PR template to explain the change, requirement IDs
or issue, tests run, results, and remaining gaps. Include screenshots for relevant UI changes and
device/browser details where behavior differs. Remove sensitive data from logs.

Reviewers may request smaller changes, additional tests, content-rights evidence,
or explicit design approval. Do not bypass failing checks or review requirements.
Maintainers decide when a change is ready to merge; submission does not promise
acceptance or a response deadline.

## AI-assisted contributions

Use [AGENTS.md](../AGENTS.md) and the [AI development guide](ai-development.md). Contributors remain responsible
for correctness, permission, security, and validation of all submitted material.
Explain material AI assistance and review performed in the PR when relevant.
Do not submit fabricated tests, citations, lyrics, or approval claims.

## Licensing

Submit only material you have the right to contribute. Project-authored code
contributions are subject to the repository's [Apache 2.0 license](../LICENSE);
retain required third-party notices and identify separately licensed material.
Do not assume the software license covers channel content or media.
