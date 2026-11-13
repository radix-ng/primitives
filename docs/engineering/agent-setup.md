# Contributor agent setup

`AGENTS.md` is the common instruction entrypoint. `CLAUDE.md` imports it for Claude Code. Project-owned skills live in `.agents/skills/`; `.claude/skills/` mirrors them with relative directory symlinks. Claude agent and slash-command files route into those same workflows.

`skills/` is a separate consumer distribution; its generator and CI checks remain independent of contributor setup.

## Upstream skills

Skills listed in `skills-lock.json` are managed by their installer. Keep their contents and lock entries untouched during project maintenance so updates remain reproducible. Put repository-specific overrides in `AGENTS.md` or project-owned skills. Prettier excludes the locked Angular skill, including references; the contributor check validates its structure without rewriting it.

## Checks

Run `pnpm agents:check` after changing contributor instructions, symlinks or engineering documentation. It validates skill metadata, relative Claude symlinks, Markdown file links and entrypoint size budgets. `pnpm agents:test` covers broken setups with isolated temporary fixtures. CI runs both in the existing skills job.

The budgets apply to common entrypoints and project-owned `SKILL.md` files. Detailed references load on demand. To add a project skill, create its canonical directory, link it from `AGENTS.md`, and add a matching relative symlink under `.claude/skills/`.

## Pre-commit checks

The hook runs standard lint-staged with read-only commands: `prettier --check`, stylelint and ESLint without `--fix`. Formatting/lint failures block the commit; fix the affected files separately and stage the result before retrying.

When the tracked working tree matches the index, the hook uses `--no-stash --no-hide-partially-staged`; nothing needs hiding or backing up because tasks do not edit files. This also avoids Git's “beyond a symbolic link” stash failure during a directory-to-symlink migration. When tracked unstaged edits exist, normal backup/hiding remains enabled so checks use staged content and failed checks can restore those edits. For a directory-to-symlink migration, stage or save tracked unstaged changes first. Keep hook tasks read-only while using the no-stash path.

## Environment and tool-specific settings

Use `.nvmrc` and the `package.json` engine range; select Node with `nvm use` before running package scripts. A tool's stale `PATH` override can bypass the shell's selected version.

`.claude/settings.json` contains shared Claude Code permissions/plugin settings. `.claude/settings.local.json` contains personal overrides and is not tracked. These are Claude configuration, not Codex execution permissions. Keep workflows in shared instructions rather than accumulating one-off shell commands in settings. Personal/global skills and installed plugins are outside the repository's contributor setup.
