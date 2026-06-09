---
name: project
description: Overview of Radix NG Primitives — what it is, who it's for, core features, and scope
metadata:
  type: project
---

# Radix NG Primitives

**Package:** `@radix-ng/primitives` (v1.0.0-beta.0; last stable 0.51.0)
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

## Available primitives (48+)

accordion, alert-dialog, arrow, aspect-ratio, avatar, button, calendar, checkbox, collapsible, collection, config, context-menu, core, cropper, date-field, date-time, dialog, dismissable-layer, editable, field, fieldset, focus-guards, focus-scope, input, label, menu, menubar, meter, navigation-menu, number-field, pagination, popover, popper, portal, presence, preview-card, progress, radio, roving-focus, select, separator, slider, switch, tabs, time-field, toast, toggle, toggle-group, toolbar, tooltip, visually-hidden
