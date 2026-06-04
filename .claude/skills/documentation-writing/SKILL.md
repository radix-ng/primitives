---
name: documentation-writing
description: |
  Maintain project documentation in .claude/skills/project-knowledge/: audit, edit, check consistency, track status.

  Use when: "проверь документацию", "обнови документацию", "аудит документации",
  "check docs", "audit documentation", "update docs", "проверь базу знаний проекта"

  For creating documentation from scratch use project-planning skill.
  For reading docs or explaining concepts, read project-knowledge skill directly.
---

# Documentation Management

Maintain project documentation in `.claude/skills/project-knowledge/references/`. Audit for bloat, edit files, check consistency, track status.

For creating documentation from scratch (new project or empty docs), use `project-planning` skill.

## Documentation Principles

These rules apply to ALL documentation operations (audit, edit, create).

**Goal: open docs → understand the project without reading code.** What is this project, how it's structured, what it does, where to find key things, how to deploy, where are logs. A high-level navigation guide.

**Describe what exists, what it does, and why.** High-level overview of components, how they work together, decisions made (why this stack, why this architecture), operational details (server addresses, deploy procedures, log locations, env var names). Skip what's obvious from reading the code itself — function signatures, implementation details, generic framework behavior.

**No code blocks, no pseudocode.** Code in docs gets outdated and bloats context.

**No duplication between files.** Information lives in ONE place. Cross-reference: "See deployment.md for env vars."

**patterns.md: only project-specific patterns.** Universal coding standards. Project patterns.md contains only what's unique to THIS project.

## File Structure

**4 core files** in `.claude/skills/project-knowledge/references/`:

| File            | Contains                                                                         |
| --------------- | -------------------------------------------------------------------------------- |
| project.md      | Overview, audience, problem, 3-5 key features, out of scope                      |
| architecture.md | Tech stack (with WHY), project structure, dependencies, integrations, data model |
| patterns.md     | Project-specific code patterns, git workflow, testing methods, business rules    |
| deployment.md   | Platform, env var names, CI/CD triggers, rollback, monitoring                    |

**Optional:**

- **ux-guidelines.md** — only for projects with significant UI
- **{custom}.md** — domain-specific

Templates with placeholder structure are in `.claude/shared/templates/new-project/.claude/skills/project-knowledge/references/`. The templates are self-documenting — each section has comments explaining what to write.

## Workflows

### 1. Audit

**Trigger:** User asks to audit, check quality, or find bloat.

1. Read all files from `.claude/skills/project-knowledge/references/` + CLAUDE.md + README.md
2. Flag issues:
   - Code blocks → replace with file references
   - Generic framework knowledge (belongs in official docs) → remove
   - Function-level details → suggest moving to code comments
   - Bloated sections (>3-5KB per file is suspicious) → condense
   - Duplication across files → consolidate to one place
   - Placeholder text (`[Project Name]`, `TODO`) → fill or remove
   - Inconsistent terminology → standardize
   - Outdated info (files/functions that no longer exist) → update or remove
   - Universal patterns in patterns.md → flag for removal (those belong in code-writing skill)
3. Preserve operational details: server addresses, SSH configs, deploy commands, log paths, env var names, monitoring URLs. These belong in docs even if they seem "obvious" — they can't be read from code.
4. Create audit report with issues by file
5. Ask user which to fix → apply approved changes → verify consistency

### 2. Edit

**Trigger:** User asks to edit or update specific documentation.

1. Identify target file/section (ask if unclear)
2. Read current content
3. Apply changes following documentation principles
4. Check if changes affect other files (e.g., tech stack mentioned elsewhere) → update related files

### 3. Check Consistency

**Trigger:** User asks to verify terminology or check for mismatches.

1. Read all project-knowledge files
2. Extract: tech stack names/versions, service names, DB names, env var names, platform names
3. Find inconsistencies (e.g., "PostgreSQL" vs "Postgres" vs "postgres")
4. Report → ask user for correct terminology → standardize across all files

### 4. Show Status

**Trigger:** User asks about documentation completeness.

1. Check each file: exists? filled or template? size? last modified?
2. Classify: filled / partially filled / template / missing
3. Show status report with recommendations

## Root Project Files

CLAUDE.md and README.md are entry points, not documentation. Keep them minimal — they point to project-knowledge, not contain information.

**CLAUDE.md** (for AI agents): project name, one-line description, reference to project-knowledge skill, backlog path, default branch. Template: `.claude/shared/templates/new-project/CLAUDE.md`.

**README.md** (for humans, in Russian): project title, purpose, folder structure overview, link to references/. Template: `.claude/shared/templates/new-project/README.md`.

When auditing, verify that CLAUDE.md and README.md stay minimal — detailed info belongs in project-knowledge.

## Custom Domain Files

Add when project has a significant domain not covered by 4 core files (bot.md, vault.md, trading.md).

Process: create in `references/` → update project-knowledge SKILL.md to list it → update CLAUDE.md and README.md if they list doc files.
