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

Small corrections do not require a separate design discussion. Do not report
security issues publicly; use the [security policy](SECURITY.md).

## Working on a change

- Fork the repository if needed, create a focused branch, and keep the PR scoped.
- Preserve unrelated changes and existing reviewed content.
- Update directly related documentation and tests with the behavior change.
- Use the [testing guide](testing-and-release.md). No application toolchain or
  test runner exists yet; do not claim checks passed when they are unavailable.
- For documentation, check relative links and run `git --no-pager diff --check`.
- Never commit secrets, signing keys, private data, or live credentials in fixtures.
- Treat downloaded descriptions and Markdown as untrusted input.

## Content and language changes

- Kannada is canonical; lyrics are transliterated, never translated.
- Preserve verse structure and manual corrections. Explain source changes.
- Flag uncertain/missing lyrics as drafts rather than fabricate them.
- Include required thumbnail assets and reviewed filter-setting changes with the
  corresponding content PR.
- Follow the [content-rights policy](content-rights.md); public availability is
  not permission to redistribute.
- Identify the script reviewed and any linguistic uncertainty. Automated output
  alone does not establish accuracy.

## Pull request expectations

Use the PR template to explain the change, requirement IDs or issue, tests run,
results, and remaining gaps. Include screenshots for relevant UI changes and
device/browser details where behavior differs. Remove sensitive data from logs.

Reviewers may request smaller changes, additional tests, content-rights evidence,
or explicit design approval. Do not bypass failing checks or review requirements.
Maintainers decide when a change is ready to merge; submission does not promise
acceptance or a response deadline.

## AI-assisted contributions

Use the [AI development guide](ai-development.md). Contributors remain responsible
for correctness, permission, security, and validation of all submitted material.
Explain material AI assistance and review performed in the PR when relevant.
Do not submit fabricated tests, citations, lyrics, or approval claims.

## Licensing

Submit only material you have the right to contribute. Project-authored code
contributions are subject to the repository's [Apache 2.0 license](../LICENSE);
retain required third-party notices and identify separately licensed material.
Do not assume the software license covers channel content or media.
