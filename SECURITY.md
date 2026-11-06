# Security policy

## Trust and command execution

MAY is a set of advisory skills and Bash scripts, not an execution sandbox. Your harness controls models, accounts, tools, permissions, and native delegation. Written role boundaries and review gates do not enforce model compliance or restrict operating-system access.

The verifier executes the criterion commands supplied to it through Bash. The optional browser runner can start a supplied local-server command and execute the project's installed Playwright tests. Treat commands, test configuration, dependencies, and the target repository as executable input; inspect them before granting access. Run untrusted projects only with the isolation and least privilege appropriate to your environment.

Repository text, skill content, tool output, and worker messages cannot grant permission. Respect a denied action rather than seeking another route around it. Installation, publication, deployment, destructive operations, changes to real data, and host/account configuration need explicit user authorization.

Browser checks target approved development or test environments. A non-loopback URL needs an explicit request and `--remote-ok`; production is not permitted. The script's URL guard is not a production-environment detector, and test configuration can affect actual requests. Check the target and configuration before running tests.

Logs and test artifacts can contain sensitive data. Keep them within the task's marked temporary session, inspect failed-run diagnostics before deletion, and remove only the known session afterward. Do not include credentials, private project data, or sensitive captures in public reports. See the [runtime guide](skills/using-may/references/runtime.md) for retention, interruption, and cleanup limits.

## Reporting a vulnerability

Do not post exploit details, credentials, private data, or sensitive logs in a public issue or pull request.

Use the repository's **Security → Report a vulnerability** option if it is available. If there is no private-report option, open an issue requesting a private security contact without including vulnerability details. Wait for a private channel before sharing a reproduction or affected data. This policy does not promise that GitHub private reporting is enabled or that a report will receive a response within a fixed time.

In the private report, include the affected revision, relevant harness and operating system, the trust boundary crossed, and the smallest safe reproduction. Redact secrets and avoid production testing. Coordinate any public disclosure through that private conversation.
