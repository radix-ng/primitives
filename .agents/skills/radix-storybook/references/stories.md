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

## CSF contract

When creating or rewriting primitive stories, follow this format by default:

- Imports: Storybook APIs → primitive dependencies → `../../storybook/styles` helpers → `tailwindDemoDecorator` → primitive directives/components → standalone demo components → raw `?raw` sources for standalone demos.
- Define `const source = (code: string) => ({ docs: { source: { code, language: 'typescript' } } });` when a story renders only a standalone component tag.
- Define `const html = String.raw;`, `export default { title, decorators: [moduleMetadata({ imports: [...] }), tailwindDemoDecorator()] } as Meta;`, then `type Story = StoryObj;`.
- Story order: `Default` first, then state variants (`Disabled`, `Readonly`, `Required`, etc.), then form/value examples (`ReactiveForms`, `TemplateDrivenForms`, `Validation`) and advanced examples.
- `Default` should be a small inline template using shared style constants from `packages/primitives/storybook/styles.ts`; standalone component stories must set `parameters: source(rawSource)` so "Show code" displays the full source.
- For form controls, include form integration and controlled/template-driven examples when the primitive supports them. Prefer Checkbox/Radio/Switch stories as references.
- In form stories and demos, every visible `<label>` for an interactive control must be explicitly associated with the control: use `for`/`id` for native controls, `htmlFor` when using `RdxLabelDirective`, or `rdxFieldLabel` when the control is inside `rdxFieldRoot`. Do not leave a visual label next to an input, checkbox, radio, or switch without a programmatic association.
- Story export names should describe the behavior, not implementation details (`TemplateDrivenForms`, not `RadioGroupComponent`).

## Full source in Show code

- The demo wrapper is already stripped from the snippet globally via `parameters.docs.source.excludeDecorators` in `apps/radix-storybook/.storybook/preview.ts`.
- **Each standalone story component must live in its own file.** Never put multiple story components in a single `stories/<name>.ts` — `?raw` imports the entire file, so a shared file would show all components' source for every story. One component = one file: `stories/checkbox-validation.ts`, `stories/checkbox-indeterminate.ts`, etc.
- For a story that renders a standalone component tag (e.g. `<checkbox-validation-example />`), the "Show code" panel would only show that tag. To show the **full component source**, import the file raw and feed it to `source.code`:

  ```ts
  import validationSource from './checkbox-validation?raw';
  const source = (code: string) => ({ docs: { source: { code, language: 'typescript' } } });

  export const Validation: Story = {
    parameters: source(validationSource),
    render: () => ({
      template: html`
        <checkbox-validation-example />
      `
    })
  };
  ```

- `*.ts?raw` is wired by the `rawTsPlugin` in `.storybook/main.ts` (the AnalogJS Angular plugin shadows Vite's built-in `?raw`); types come from `packages/primitives/storybook/raw.d.ts`. Inline-template stories (source lives in `.stories.ts`) don't need this.
- Each story export gets `parameters: source(itsOwnRawFile)` — never point two story exports at one combined source file.
