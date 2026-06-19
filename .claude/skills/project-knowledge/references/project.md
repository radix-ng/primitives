---
name: project
description: Overview of Radix NG Primitives — what it is, who it's for, core features, and scope
metadata:
  type: project
---

# Radix NG Primitives

**Package:** `@radix-ng/primitives` (v1.0.0-beta.2; last stable 0.51.0)
**npm:** published, tree-shakeable secondary entries (`@radix-ng/primitives/<name>`)

## What it is

A headless, signals-first UI primitive library for Angular. Primitives ship **no styles** — they expose state via `data-*` attributes so consumers can build any design system on top. Modeled on [Base UI](https://base-ui.com/) (primary API/behavior reference) and originally ported from [Radix UI](https://www.radix-ui.com/) (secondary reference for patterns Base UI doesn't cover).

## Audience

Angular developers building their own design systems or adopting accessible headless components. Supports Angular 19–21, targets modern Angular signals API.

## Core features

- **Headless** — no styles; state via `data-*` attributes
- **Accessible** — WAI-ARIA authoring practices, keyboard nav, focus management
- **Signals-first** — `input()`, `model()`, `computed()`, `signal()`, `linkedSignal()`
- **Composable** — `hostDirectives` composition pattern; primitives reuse each other
- **Granular** — each primitive is a separate secondary entry point; tree-shakeable
- **`ng add` schematic** — installs peer deps automatically

## Out of scope

- No visual styling or CSS shipped
- No opinionated design tokens (consumers bring their own)
- Not a full component library — consumers compose the headless primitives with their own styling

## Available primitives (50+)

accordion, alert-dialog, arrow, aspect-ratio, autocomplete, avatar, button, calendar, checkbox, collapsible, collection, combobox, composite, config, context-menu, core, cropper, date-field, date-time, dialog, dismissable-layer, drawer, editable, field, fieldset, focus-guards, focus-scope, form, input, label, menu, menubar, meter, navigation-menu, number-field, pagination, popover, popper, portal, presence, preview-card, progress, radio, scroll-area, select, separator, slider, stepper, switch, tabs, time-field, toast, toggle, toggle-group, toolbar, tooltip, visually-hidden

The form layer composes as **Form → Fieldset → Field → control** (`input`, checkbox, radio, …): `field` owns one control's label/description/error/state, `fieldset` groups fields, and `form` (top layer) maps server errors onto fields by name, intercepts submit, and resets field state. See architecture.md for the cross-entry dependency direction.
