---
name: storybook-story
description: |
  Write or update Storybook stories and docs MDX for a Radix NG primitive following project conventions.

  Use when: writing stories, updating docs, adding a new story, updating MDX, "обнови сторис", "напиши доки для", "update stories", "add story".

  Enforces: one-file-per-component rule, ?raw source imports, tailwindDemoDecorator, semantic tokens, docs MDX template.
---

# Writing Storybook Stories for Radix NG Primitives

## Checklist — run through this before writing any story file

1. **Any story embedded via `<Canvas of={X}>` must be a standalone component — `props` do not survive a Canvas embed.**
   The exception is the **primary `Default` story**, which may be a small inline template using
   `props` + `args`, _provided_ it is surfaced in the MDX via `<Primary />` / `<Controls />` (never
   `<Canvas of={Default}>`). This matches the `button` and `checkbox` references.

   ```ts
   // ✅ Default — small inline template with props/args, shown via <Primary/> in MDX
   export const Default: Story = {
     args: { disabled: false },
     render: (args) => ({
       props: { ...args, b: demoButton },
       template: html`
         <button rdxButton ${argsToTemplate(args)} [class]="b.base">Button</button>
       `
     })
   };

   // ✅ Named example — standalone component, safe to embed via <Canvas of={X}>
   export const Variants: Story = {
     parameters: source(variantsSource),
     render: () => ({
       template: html`
         <button-variants-example />
       `
     })
   };

   // ❌ wrong — a props-based story embedded via <Canvas of={WithScroll}> renders blank
   export const WithScroll: Story = {
     render: () => ({ props: { r: demoRadio }, template: `<div [class]="r.group">...` })
   };
   ```

   In the MDX: surface `Default` with `<Primary />` (+ `<Controls />`) and add `of={Stories}` to
   `<Meta>`; embed every other example with `<Canvas of={Stories.X} />`.

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
<Meta title="Primitives/Name" of={Stories} />   {/* `of=` is required for <Primary>/<Controls> */}
# Name
#### One-line summary.
<Primary />    {/* renders the inline Default story; do NOT use <Canvas of={Default}> */}
<Controls />   {/* args table for the Default story */}
## Features  (✅ bullets)
## Import     (code block)
## Anatomy    (HTML block showing all parts)
## Examples   (### Title + one-line desc + <Canvas of={Stories.X} /> per example)
## Data attributes  (optional table, if the primitive exposes data-* state separately)
## API Reference  (### per part → <ArgTypes of={Directive} /> only for parts with inputs/outputs)
## Accessibility  (a11y notes + a ### Keyboard Interactions table; goes LAST — see rules below)
```

- **Surface `Default` with `<Primary />` (+ `<Controls />`)**, not `<Canvas of={Default}>` — see checklist item 1. A simple primitive may instead use `<Canvas sourceState="hidden" of={Stories.SomeStandaloneStory} />` as the hero (e.g. Button uses `Variants`).
- **No bare `<Canvas>` without a preceding `### Title`** description.
- **API Reference parts are `###` subheadings** under the `## API Reference` `##` — never repeat `##` for each directive (that makes them siblings of API Reference, not children).
- **No empty `<ArgTypes>` tables.** Parts with no inputs → one-line prose note instead.
- Imports at the top: Storybook blocks (incl. `Primary`, `Controls`) → `* as Stories` → individual directive classes for ArgTypes.

### Keyboard Interactions & Accessibility (canonical convention)

Every keyboard-interactive primitive documents its keys the same way. Match this exactly:

- **Nesting & placement.** A `## Accessibility` section holds a `### Keyboard Interactions` subsection
  (Title Case, level 3). `## Accessibility` is the **last** section on the page, after `## API Reference`.
  Never use a standalone `## Keyboard interactions` heading. If `## Accessibility` already exists, add the
  subsection inside it — never a second Accessibility section.
- **Table shape.** `| Key | Description |`. One key (or key combo) per row. Descriptions are concise and
  end with a period. (Prettier aligns the pipes — don't hand-pad.)
- **Key formatting.** Each key token in backticks. Arrow keys are `ArrowUp` / `ArrowDown` / `ArrowLeft` /
  `ArrowRight` (no space, not "Arrow Up"). Join alternatives with `/` (e.g. `Enter` / `Space`); join
  chords with `+` (e.g. `Shift` + `Tab`). Use a `Character keys` row for typeahead. Function keys like
  `F8` also go in backticks.
- **Ground every key in source — never invent.** A key belongs in the table only if you can trace it to a
  real handler: a `(keydown.*)` host listener, `useArrowNavigation`/roving-focus, a native `<button>`
  trigger (Space/Enter activation counts), or a composed layer (`dismissable-layer` → `Escape`;
  `focus-scope` → `Tab` / `Shift` + `Tab`). If a primitive has no keyboard handling at all (purely
  pointer-driven, e.g. Toast), **omit the section** rather than fabricate one.
- **User-facing language.** Describe behavior, not implementation — never name internal directives
  (`RdxDismissableLayer`, `RdxEscapeKeyDown`, "roving-focus group") in the table.
- **Reference sections to copy:** Tabs, Menu (rich nav + typeahead), Dialog (Escape + focus trap),
  Time Field / Date Field (segmented input), Switch / Toggle (minimal Space/Enter).

### TOC gotcha — real headings in demos

The docs "On this page" TOC is built by tocbot from `h2, h3` in `.sbdocs-content`. Storybook's default
`toc.ignoreSelector` is `.docs-story *`, which keeps headings **rendered inside story previews** out of
the TOC. This repo sets it in `apps/radix-storybook/.storybook/preview.ts` as `'#primary, .docs-story *'`
— **keep `.docs-story *`**. Dropping it makes demos that render real heading elements (e.g. Accordion's
`<h3 rdxAccordionHeader>`) leak their text into the TOC. Prefer real semantic headings in demos where the
ARIA pattern calls for them; rely on the ignore selector rather than downgrading to `<div>`.

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
