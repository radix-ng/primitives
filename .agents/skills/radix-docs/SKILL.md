---
name: radix-docs
description: Maintain Radix NG engineering documentation, contributor instructions and skills; audit stale paths, duplicated rules and source/configuration mismatches.
---

# Maintain contributor documentation

Use [the engineering map](../../../docs/engineering/README.md) to locate the subject. Public Storybook MDX belongs to [radix-storybook](../radix-storybook/SKILL.md).

1. Read the affected guide and its actual source: manifests/CI for commands and versions, primitive source for API, accepted ADRs for design decisions. Read neighboring guides only when the change crosses their boundaries.
2. Keep common mandatory rules in [AGENTS.md](../../../AGENTS.md), workflow instructions in project-owned skills, project knowledge in `docs/engineering/`, and decision rationale in `docs/adr/`. Keep `CLAUDE.md` and Claude agent/command files as thin adapters.
3. Prefer links to duplicated rules. Include small code examples when they clarify a real contract; preserve the repository's established documentation language and format.
4. Link new guides from the relevant map or skill. Put detailed or conditional guidance in references, not in every skill entrypoint. Keep operational instructions reproducible without private memory or machine-specific paths.
5. Do not edit upstream skills listed in `skills-lock.json` or their lock entries during routine documentation maintenance. Keep project adaptations outside those skills.
6. Run `pnpm agents:check` and format the changed files. If the change also affects public API, MDX or example source, run `pnpm skills:build` and include its generated output; internal engineering prose alone does not require that rebuild.

For an audit request, report concrete inconsistencies and their consequences. For an authorized edit, fix the affected references and validate them without adding another approval step.
