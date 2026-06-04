---
name: storybook-story
description: |
  Write or update Storybook stories and docs MDX for a Radix NG primitive following project conventions.

  Use when: writing stories, updating docs, adding a new story, updating MDX, "обнови сторис", "напиши доки для", "update stories", "add story".

  Enforces: one-file-per-component rule, ?raw source imports, tailwindDemoDecorator, semantic tokens, docs MDX template.
---

# Writing Storybook Stories for Radix NG Primitives

## Checklist — run through this before writing any story file

1. **All stories are standalone Angular components — no inline templates with `props`.**
   Using `props` in a `render()` function (e.g. `props: { r: demoRadio }`) fails when a story
   is embedded via `<Canvas>` in an MDX docs page. Every story must render via its own
   standalone component:

   ```ts
   // ✅ correct
   export const Default: Story = {
     parameters: source(defaultSource),
     render: () => ({ template: `<radio-default-example />` })
   };

   // ❌ wrong — props are not available in MDX Canvas embeds
   export const Default: Story = {
     render: () => ({
       props: { r: demoRadio },
       template: `<div [class]="r.group">...`
     })
   };
   ```

2. **One component → one file.** Every standalone story component gets its own file:
   `stories/select-default.ts`, `stories/select-with-scroll.ts`, etc.
   Never put multiple story components in a single `stories/<name>.ts`.

   > Reason: `?raw` imports the entire file, so a shared file shows all source for every story.

3. **`?raw` import per story file.** In `<name>.stories.ts`:

   ```ts
   import defaultSource from './select-default?raw';
   export const Default: Story = {
     parameters: source(defaultSource),
     render: () => ({
       template: html`
         <select-default />
       `
     })
   };
   ```

   Each story export gets `parameters: source(itsOwnFile?raw)`.

4. **`tailwindDemoDecorator()`** is required in `decorators`. No `styleUrl`, no inline `<style>`.

5. **Semantic tokens only** in templates: `bg-background`, `text-foreground`, `bg-muted`, `bg-popover`, `border-border`, `text-muted-foreground`, `text-primary-foreground`. No raw colors (`violet`, `mauve`, `white`, `black`).

6. **Shared style constants** from `packages/primitives/storybook/styles.ts` (`cn`, `demoButton`, `demoMenu`, etc.). Extend `styles.ts` when a pattern recurs — don't inline long class strings.

7. **Story order:** `Default` first, then state variants, then advanced examples.

8. **Wrapper component** from `packages/primitives/storybook/tailwind-demo.ts`. It marks the root with `data-demo="tailwind"`.

## Docs MDX template

```
# Name
#### One-line summary.
<Canvas sourceState="hidden" of={Stories.Default} />
## Features  (✅ bullets)
## Import     (code block)
## Anatomy    (HTML block showing all parts)
## Examples   (### Title + one-line desc + <Canvas of={Stories.X} /> per example)
## Keyboard interactions  (table, if applicable)
## API Reference  (<ArgTypes of={Directive} /> only for parts with inputs/outputs)
```

- **No bare `<Canvas>` without a preceding `### Title`** description.
- **No empty `<ArgTypes>` tables.** Parts with no inputs → one-line prose note instead.
- Imports at the top: Storybook blocks → `* as Stories` → individual directive classes for ArgTypes.

## Files to create/update

| File                          | Purpose                            |
| ----------------------------- | ---------------------------------- |
| `stories/<name>-<variant>.ts` | One per story component            |
| `stories/<name>.stories.ts`   | CSF with imports + story exports   |
| `stories/<name>.docs.mdx`     | Docs page following template above |

## Reference examples

- Button: `packages/primitives/button/` — simplest complete example
- Menu: `packages/primitives/menu/stories/` — multiple standalone files + full MDX
- Checkbox: `packages/primitives/checkbox/stories/` — form variants, multiple files
