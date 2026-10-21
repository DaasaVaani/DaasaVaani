# Repository maintenance checklist

The checklist below describes ongoing targets. The dated verification records
settings actually checked; revisit them after incidents, major tooling changes,
and releases.

## Verified configuration on 2026-10-21

- The repository is public; organization base access is read-only. Only the two
  organization owners were listed with repository administration access.
- Website PR/check ruleset 25497312 retains one approval, stale-review dismissal,
  last-push approval, resolved conversations and the up-to-date `Workflow lint`
  check. Its explicitly authorized temporary repository-admin bypass is now
  `always`, permitting direct pushes as well as PR merges. Separate active
  ruleset 25525161 forbids force pushes/deletion with no bypass, including admins.
- Secret scanning, push protection, private vulnerability reporting, Dependabot
  alerts, and Dependabot security updates are enabled.
- Actions default to read-only tokens and cannot approve PR reviews. Only
  GitHub-owned actions are allowed, and all outside contributors require workflow
  approval. The deploy workflow runs only on pushes to `main`; the Pages
  environment permits only `main`.
- Ordinary members cannot create repositories, teams, or Pages sites. New
  repositories default to enabled secret scanning, push protection, Dependabot
  alerts, and Dependabot security updates.

Remaining owner tasks:

- Have every owner enroll in 2FA, retain recovery methods, then require
  organization-wide 2FA. One owner was still unenrolled; enforcement was left
  disabled to avoid removing their access.
- Repository deletion/transfer and visibility restrictions remained enabled for
  repository administrators after the API update attempt. Review these controls
  manually in organization member privileges; do not assume they were disabled.
- Organization Actions policies and PAT/OAuth approval and expiration controls
  could not be fully verified with the available token permissions.
- After the pinned workflows merge, enable repository SHA-pin enforcement.
  Enabling it prematurely would block the existing tag-based deploy workflow.

### Temporary direct-main exception across all four repositories

The user explicitly approved this temporary configuration and will restore
normal protection before release. API reads verified all sibling mains protected.
Only the PR/check rulesets have repository-admin role 5 `always` bypass:

| Repository | PR/check ruleset | No-bypass force/delete guard | Required existing check |
| --- | --- | --- | --- |
| Website | 25497312 | 25525161 | Workflow lint |
| Shared | 25526641 | 25526636 | Bootstrap files and YAML syntax |
| AndroidApp | 25526642 | 25526638 | Bootstrap files and YAML syntax |
| Library | 25526643 | 25526637 | Bootstrap files and YAML syntax |

The three siblings previously had no main protection. Their new PR rules require
zero approving reviews, no code-owner/last-push approval and no extra approval
for unattributed changes; the last setting was explicitly disabled after GitHub
defaulted it to true. Resolved conversations and up-to-date hygiene checks remain
required for non-bypassing writers. No nonexistent application check is required.
Website's existing review parameters were otherwise left unchanged.

**Release blocker:** remove temporary admin PR/check bypass and verify the
approved normal policy in every repository: required PR/named checks, no admin
exemption, no mandatory second reviewer, no force pushes/deletion. Do not revert
siblings to unprotected main or blindly restore Website's original one-reviewer
snapshot as though it were the newer approved normal policy. The original
Website ruleset was exported for recovery outside the repositories.

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
- Resolve the provider-policy hold before first ingestion. Maintain applicable
  legal responsibilities without inventing a per-item rights publication gate.

## Deployment and release safety

- The Pages workflow stages only the current `index.html` placeholder in a
  dedicated artifact directory. When the real site build is introduced, replace
  this allowlist with validated public build output and verify that internal
  data is absent. All tracked source files remain public in this repository.
- Configure Pages environments/deployment permissions deliberately.
- Keep the local ingestion API credential and APK signing key outside CI,
  repositories and logs. CI builds unsigned APK candidates; a maintainer verifies
  and signs locally; a protected workflow verifies/publishes the signed APK.
  Retain secure key backup and restricted release access.
- Establish compatible content versions, signed APK verification, and rollback
  procedures before production releases.
- Publish supported versions/security-update expectations in the security policy
  before the first application release.
- Verify the [release evidence checklist](testing-and-release.md).

## Dependency and workflow updates

- GitHub Actions are pinned to immutable commits. Dependabot proposes weekly
  updates; review them and their corresponding release versions before merging.
  The workflow linter release and archive checksum are pinned separately in
  `validate.yml`; update both together after checking the upstream release.
- Once manifests/toolchains exist, configure an appropriate dependency update
  service and commit lockfiles as required by the selected ecosystem.
- Review release notes, license changes, security advisories, and compatibility;
  run relevant checks before merging updates. Avoid blind automatic merges.
- Test updates against API 26, supported browsers, and content-format compatibility.
- Repository CI checks hygiene, not app/content correctness. Selected Node/npm
  and Android directions are not installed manifests, verified pins or app CI.

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
