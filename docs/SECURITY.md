# Security policy

## Project status and support

DaasaVaani is pre-implementation. There is no established supported-release or
security-backport policy yet. Reports about the current default branch and
repository automation are welcome. Before the first application release,
maintainers must publish supported versions and update instructions here.

This policy is reporting guidance, not a completed security review or guarantee.
No response-time or resolution-time commitment is currently established.

## Report privately

Do not disclose potential vulnerabilities, exploit details, or exposed secrets
in public issues, discussions, or PRs.

Use GitHub's
[Report a vulnerability](https://github.com/DaasaVaani/DaasaVaani/security/advisories/new)
route if private vulnerability reporting is enabled. You can also find it under
the repository's Security tab. Its availability has not been verified by this
documentation change; maintainers must enable it before relying on this policy.

If that private route is unavailable, open only a neutral issue titled
"Private security contact requested", containing no vulnerability details, logs,
affected secrets, or proof of concept, and request an approved private channel.
Do not add details until a private route is established. This request is not a
private vulnerability report.

Include in the private report:

- Affected commit/version and component.
- Reproduction steps and expected versus observed behavior.
- Impact and relevant environment information.
- A minimal, redacted proof of concept where safe.
- Suggested mitigation if known.

Coordinate disclosure with maintainers. Avoid accessing other people's data,
disrupting services, or testing systems without authorization.

## Exposed credentials

If you control an exposed credential, revoke/rotate it promptly and notify the
affected maintainer privately. Removing it from a file or Git history alone does
not make it safe. Never copy the credential into a report, log, or issue.

## Maintainer handling

Assess the report privately, limit access to necessary collaborators, and
coordinate fixes, verification, releases, and any advisory. Record supported
versions as releases become available. Use the [maintenance checklist](maintenance.md)
for private reporting setup and secret/dependency controls.
