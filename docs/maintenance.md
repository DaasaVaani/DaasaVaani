# Repository maintenance checklist

These are recommended setup and recurring tasks, **not claims that settings are
enabled**. Repository settings were not changed or verified as part of this
documentation update. Record dated setup evidence and revisit this checklist
after incidents, major tooling changes, and releases.

## Before inviting broader contributions

- Enable GitHub private vulnerability reporting and verify the route in
  [SECURITY.md](SECURITY.md) works for contributors.
- Review repository/organization access, use strong authentication, and remove
  unnecessary collaborator permissions.
- Configure a ruleset or branch protection for `main`: reviewed PRs, no force
  pushes/deletion, and required checks once real validation jobs exist.
  Do not require nonexistent checks or claim reviews are enforced by workflow YAML.
- Review Actions permissions and allowed actions. Give each job only necessary
  privileges; do not expose secrets to untrusted PR execution.
- Enable secret scanning/push protection and dependency alerts where available.
  Review feature availability for this repository rather than assume it.
- Verify community-policy links, issue/PR templates, and reporting routes.
- Obtain content/media permissions before historical imports.

## Deployment and release safety

- The current Pages workflow uploads the repository root. Before adding real
  drafts/provenance, switch it to validated public build output and verify that
  internal data is absent. Until then, treat tracked files as potentially public.
- Configure Pages environments/deployment permissions deliberately.
- Store API and APK signing credentials in protected secret storage. Keep a
  secure signing-key backup and restrict release access.
- Establish compatible content versions, signed APK verification, and rollback
  procedures before production releases.
- Publish supported versions/security-update expectations in the security policy
  before the first application release.
- Verify the [release evidence checklist](testing-and-release.md).

## Dependency and workflow updates

- Review GitHub Actions dependencies regularly; evaluate immutable commit pinning
  and track corresponding release versions when workflow changes are approved.
- Once manifests/toolchains exist, configure an appropriate dependency update
  service and commit lockfiles as required by the selected ecosystem.
- Review release notes, license changes, security advisories, and compatibility;
  run relevant checks before merging updates. Avoid blind automatic merges.
- Test updates against API 26, supported browsers, and content-format compatibility.
- No dependency automation or additional CI is configured by these documents.

## Suggested recurring review

| Cadence | Review |
| --- | --- |
| Weekly | Import failures/pending PRs once implemented, vulnerability/dependency alerts, and incoming reports. |
| Monthly | Access/Actions settings, dependency updates, stale documentation/links, and unresolved drafts/rights concerns. |
| Each release | Supported versions, acceptance evidence, rights/attribution, signing, changelog/release notes, and rollback readiness. |
| After an incident | Rotate affected secrets, verify scope, repair controls, and document non-sensitive lessons. |

These are maintainer recommendations, not response-time commitments. Do not close
valid issues solely because they are old; request missing context or explain
decisions. Prefer accurate release notes over an empty or fabricated changelog.

## Keeping documentation current

Update the root README status, setup/build/test commands, roadmap progress,
approved design decisions, and support/security policies alongside implementation.
Remove obsolete statements only after verifying the replacement behavior.
Keep substantive docs in this folder and GitHub-only discovery files in their
required locations.
