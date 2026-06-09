# Radix NG Primitives — Agent Skills

LLM consumer skills for building UI with `@radix-ng/primitives`. They are **self-contained**: all
docs, examples, and the styling contract are bundled offline, so they work regardless of whether any
documentation site is deployed.

Compatible with Claude Code, Cursor, GitHub Copilot, Gemini, and other agents via the open Agent
Skills ecosystem ([skills.sh](https://skills.sh)).

## Skills

| Skill               | Purpose                                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `radix-ng`          | How to write correct, accessible code on the primitives, plus the `data-*` styling contract for theming with any design system. |
| `radix-ng-examples` | Index of every documented example, with the full Angular source bundled under `references/`.                                    |

## Install (consumers)

```bash
npx skills add radix-ng/primitives/skills
```

## Generated vs hand-authored

Run after changing any primitive's Storybook docs (`packages/primitives/**/stories/*.docs.mdx`):

```bash
pnpm skills:build
```

This regenerates, from the Storybook docs (the source of truth):

- `radix-ng/references/styling-contract.json`
- `radix-ng-examples/SKILL.md`
- `radix-ng-examples/references/**` (per-component `.md` + `llms-full.txt`)

Hand-authored (never overwritten by the generator):

- `radix-ng/SKILL.md`
- `radix-ng/references/styling.md`, `composition.md`, `forms.md`

The generator and the Markdown renderer live in `tools/scripts/skills/` and have **no dependency on
the Astro docs app**.
