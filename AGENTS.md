# Agent Guide

Read `CLAUDE.md` for the full project conventions.

## Storybook Styling

- Use Tailwind v4 utilities directly in story templates and standalone story components.
- Do not add story-local CSS files, Angular `styleUrl` / `styleUrls` / `styles`, inline `<style>` blocks, or `style="..."` attributes.
- Use semantic tokens such as `bg-background`, `text-foreground`, `bg-muted`, `border-border`, and `text-primary-foreground`.
- Use `packages/primitives/storybook/tailwind-demo.ts` for the shared Storybook demo shell.
- If a demo cannot reasonably be expressed with Tailwind utilities, explain why and ask before adding CSS.
