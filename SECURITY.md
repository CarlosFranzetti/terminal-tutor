# Security Policy

## Supported version

Security fixes are applied to the current default branch and published releases.

## Report a vulnerability

Do not open a public issue if a lesson, parser, dependency, or generated command could
execute unintended shell operations, expose local files, or leak credentials.

Use GitHub's private vulnerability reporting feature if it is enabled. Otherwise,
contact the repository owner through the contact method listed on the GitHub profile.

Include the operating system, shell, lesson or command involved, reproduction steps,
and impact. Do not include real credentials or sensitive local file contents.

## Safety rules

- Treat lesson input as untrusted.
- Never construct shell commands by concatenating unsanitized input.
- Keep destructive examples in isolated temporary directories.
- Require explicit confirmation before commands that modify or delete files.
- Never ask learners to paste tokens or secrets into lesson output.
