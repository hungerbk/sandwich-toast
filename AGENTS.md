## Working Style

- Focus only on the requested task and avoid unrelated repository management.
- Keep repository exploration scoped to what is necessary for the current task.
- Do not repeat checks or re-read files when the required context is already available.
- Prefer focused tests during implementation when they are sufficient.
- Keep completion reports concise: summarize meaningful changes, tests or checks performed, and important caveats only.

## Task Planning

- For tasks with multiple implementation steps, create `.tasks.md` before implementation.
- Use the repository's existing GitHub Issue template as the format for `.tasks.md`.
- Fill it based on the requested task and the current codebase.
- Keep its checklist updated as implementation progresses.
- For small tasks that do not benefit from a checklist, do not create `.tasks.md`.
- `.tasks.md` is temporary local working state and must never be committed.

## GitHub Issues

- Do not read GitHub Issues for task context or progress tracking unless explicitly requested.
- Do not create, edit, close, or update GitHub Issues unless explicitly requested.
- Use `.tasks.md` for progress tracking instead.

## Git

- Do not routinely inspect Git status, branches, history, or remote state unless necessary for the requested task.
- Create commits when requested.
- Do not push unless explicitly requested or as part of an explicit PR creation request.
- Do not report that changes have not been pushed.

## Pull Requests

- Create a PR only when explicitly requested.
- When asked to create a PR, push the required commits and create the PR on GitHub.
- Use the repository's existing PR template.
- Fill the template using only actual changes and verification results.
- Leave image, screenshot, and other media sections empty for the user to complete manually.
- Do not add placeholder text such as "user needs to attach", "manual verification required", "not provided", or similar notes.
- Do not mark manual verification as completed unless it was actually performed.
- Do not merge PRs.
- Do not report that a PR was not merged.
