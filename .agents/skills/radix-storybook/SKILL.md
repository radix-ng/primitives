---
name: radix-storybook
description: Create or update Radix NG Storybook stories, demos and public MDX; use for changes under primitive stories or Storybook documentation.
---

# Radix NG Storybook

Follow the styling constraints in [AGENTS.md](../../../AGENTS.md).

1. For stories/demos, read [the CSF and source contract](references/stories.md). Reuse `tailwindDemoDecorator()` and semantic tokens; one standalone demo component per file, with its own `?raw` source.
2. For public MDX, read [the documentation contract](references/docs.md). Trace API, state attributes, CSS variables and keyboard behavior to actual source. Attribute directives **apply to** consumer elements; they do not render their own host.
3. For theme, animation or forms, consult only the relevant part of [UX guidance](../../../docs/engineering/ux-guidelines.md) or [the handbook map](../../../docs/engineering/handbook.md).
4. Regenerate `skills/` with `pnpm skills:build` after MDX, API or demo-source changes. See [pipeline troubleshooting](../../../docs/engineering/consumer-skills.md) for compodoc and production ArgTypes issues.
5. Validate the affected stories. Layout/positioning/interaction fixes need a browser regression; use [radix-testing](../radix-testing/SKILL.md) to choose focused checks.
