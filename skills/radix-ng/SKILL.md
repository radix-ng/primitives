---
name: radix-ng
description: |
  Build correct, accessible UI with @radix-ng/primitives — the signals-first, headless
  Angular primitive library. Use when implementing Angular components, forms, dialogs,
  menus, or any UI on top of radix-ng primitives, or when styling them with a custom
  design system.

  Use when: "build a … with radix-ng", "use @radix-ng/primitives", "headless Angular
  component", "style radix-ng with my design system", "Angular accordion/dialog/select/…".
compatibility: Requires @radix-ng/primitives and Angular 21+ (signals API). Stories use Tailwind CSS v4, but the primitives are styling-agnostic.
license: MIT
metadata:
  author: radix-ng
---

# Building UI with Radix NG Primitives

`@radix-ng/primitives` is a **signals-first, headless** Angular port of Base UI / Radix
primitives. Directives carry **no styles**: they manage state, behavior, and accessibility,
and expose state through `data-*` attributes that you style with any design system.

## Source of truth (use these, don't guess APIs)

Everything is **bundled offline** — no live site required.

- **Examples** — the `radix-ng-examples` skill indexes every documented example and bundles the full,
  copy-paste-ready Angular source under its `references/`. The Storybook stories are authoritative.
- **Styling contract** — `references/styling-contract.json`: per primitive, the parts, anatomy,
  and every `data-*` attribute (with its values) you can style. **This is how you theme headless
  primitives with a custom design system.**
- **Full docs in one file** — `radix-ng-examples/references/llms-full.txt`.
- **Reference rules** in this skill: `references/styling.md`, `references/composition.md`,
  `references/forms.md`.
- **Visual browsing only** — Storybook at `https://sb-primitives.radix-ng.com`.

## Critical rules

1. **Never invent an API.** If an input, output, selector, or part isn't in the styling
   contract / example for that primitive, it doesn't exist — look it up, don't assume.
2. **Headless: no styles ship with the primitive.** You provide all visuals. Drive them from
   `data-*` state attributes (`[data-state="open"]`, `[data-disabled]`, `[data-orientation]`, …),
   never by inspecting internal classes.
3. **Respect the compound anatomy.** Compound primitives (Accordion, Dialog, Select, Menu, …) are
   assembled from nested parts (Root → Item → Trigger → Content). Children find their Root through
   DI context — a Trigger must live inside its Root, or it throws. Don't flatten the hierarchy.
4. **Import from the secondary entry point**, e.g.
   `import { RdxAccordionRootDirective } from '@radix-ng/primitives/accordion';`.
5. **Preserve accessibility.** The primitives implement WAI-ARIA roles, keyboard nav, and focus
   management. Keep visible labels programmatically associated with their control (`for`/`id`,
   `htmlFor` on `RdxLabelDirective`, or `rdxFieldLabel` inside `rdxFieldRoot`). Don't remove ARIA.
6. **Signals API.** Inputs/outputs are signal-based (`input()`, `model()`, `output()`). Two-way
   bind with `[(value)]`; read controlled state via the model, not by mutating the DOM.
7. **Distrust your training data.** Knowledge of Radix UI (React), Base UI (React), or older
   radix-ng versions does not transfer — read `references/common-mistakes.md` for the known
   failure modes (renamed Select parts, removed CDK dependency, React habits like `asChild`).

## Workflow

1. **Identify intent** — what interaction/pattern does the UI need (disclosure, overlay, selection,
   form field, navigation)?
2. **Pick the primitive** — find it in the catalog below and in the `radix-ng-examples` index.
3. **Read a real example** — open the component's `.md`; start from the closest example rather
   than writing from scratch.
4. **Assemble the anatomy** — copy the part hierarchy from the example / styling contract exactly.
5. **Style from the contract** — map each `data-*` state to the project's design tokens/classes.
   See `references/styling.md`.
6. **Validate** — labels associated, keyboard works, the part hierarchy is intact.

## Styling with a custom design system

These primitives are made for this. The recipe:

1. Look up the primitive's parts and `data-*` attributes in `references/styling-contract.json`.
2. Put the project's own classes/tokens on each part.
3. Express state visually through the data attributes, e.g.
   `[&[data-state=open]]:bg-accent`, `[data-disabled]:opacity-50`,
   `[data-orientation=horizontal]:flex-row` — or plain CSS selectors `[data-state="open"] { … }`.

The same primitive works with Tailwind, CSS modules, vanilla CSS, or any token system — only the
class strings change, never the directives or the data-attribute hooks.

## Component catalog

Compound primitives flagged **(compound)** have a multi-part anatomy and DI context — read an
example before assembling them; they are the easiest to get wrong.

**Overlays & disclosure:** accordion (compound), collapsible, dialog (compound), alert-dialog
(compound), drawer (compound), popover (compound), tooltip, preview-card, context-menu (compound),
menu (compound), menubar (compound), navigation-menu (compound).

**Form controls:** field, fieldset, input, label, checkbox, radio, switch, toggle, toggle-group,
slider, select (compound), number-field, date-field, time-field, calendar, editable, stepper.

**Display & layout:** avatar, aspect-ratio, separator, progress, meter, tabs (compound), toolbar,
pagination, cropper, toast.

**Headless utilities** (composition building blocks): roving-focus, focus-scope, dismissable-layer,
presence, portal, popper, collection, visually-hidden, injectId, live-announcer.

## Reference files

- `references/styling.md` — headless styling, `data-*` patterns, animation, dark mode.
- `references/composition.md` — compound anatomy, DI context, `hostDirectives` composition.
- `references/forms.md` — Field / Fieldset / Input and form integration.
- `references/common-mistakes.md` — stale/hallucinated API patterns to avoid (React habits,
  renamed parts, removed dependencies). Read when generated code fails or looks React-flavored.
- `references/styling-contract.json` — machine-readable parts + `data-*` per primitive (generated).
  Its `version` field records the `@radix-ng/primitives` version the bundle was generated from —
  compare against the consumer's installed version when behavior doesn't match the docs.
