---
name: angular-developer
description: Angular framework reference for building this signals-first, headless directive library. Consult for API/best-practice details on reactivity (signal, computed, linkedSignal, effect, afterRenderEffect), Signal Forms, signal-based inputs/outputs, host bindings, dependency injection (inject, InjectionToken, providers, injection context, hierarchical injectors), headless accessible component patterns (ARIA), and Vitest testing. Defer to CLAUDE.md for repo-specific tooling — this is an Nx + pnpm monorepo, not an Angular CLI app.
license: MIT
metadata:
  author: Copyright 2026 Google LLC
  version: '1.0'
  note: Curated subset of angular/skills (github.com/angular/skills) for a headless library. App-only references (routing, SSR/rendering, data resolvers, reactive/template-driven forms, component styling, animations, CLI/MCP, migrations, harnesses, e2e) were removed; the Angular framework reference files are unmodified.
---

# Angular Developer Guidelines (library edition)

This is the **Radix NG primitives** library — a **signals-first, headless** set of Angular directives,
not an application. Use these references for authoritative Angular framework details; for anything
repo-specific (build/test commands, naming, the `createContext` DI pattern, story conventions, the
CDK phase-out, the `ngOn*`-hook lint rule) **CLAUDE.md and `.claude/skills/project-knowledge` take
precedence.**

Working rules:

1. **Check the Angular version first** (`packages/primitives/package.json` peers — currently Angular 21).
   Feature availability and best practice vary across versions.
2. **Tooling is Nx + pnpm, not the Angular CLI.** Do not run `ng new` / `ng generate` / `ng build`.
   Scaffold by hand following the new-primitive checklist in CLAUDE.md, and verify with
   `pnpm primitives:build` / `pnpm primitives:test`.
3. Prefer signals end to end (`input()`, `output()`, `model()`, `computed()`, `linkedSignal()`,
   `effect()`), and the constructor / `DestroyRef` / `afterNextRender` over `ngOn*` lifecycle hooks
   (see the Lifecycle section of CLAUDE.md and `patterns.md`).

## Reactivity and state

The core of this library. Consult:

- **Signals overview**: `signal`, `computed`, reactive contexts, `untracked`. Read [signals-overview.md](references/signals-overview.md)
- **`linkedSignal`**: writable state derived from source signals (used widely, e.g. the CVA value source). Read [linked-signal.md](references/linked-signal.md)
- **`effect` / side effects**: third-party DOM, `afterRenderEffect`, and **when NOT to use effects**. Read [effects.md](references/effects.md)

## Components and directives

Authoring patterns for the directive parts and the few styled components:

- **Components fundamentals**: anatomy, metadata, control flow (`@if`/`@for`/`@switch`). Read [components.md](references/components.md)
- **Inputs**: signal inputs, transforms, `model` inputs. Read [inputs.md](references/inputs.md)
- **Outputs**: signal outputs and custom-event best practices. Read [outputs.md](references/outputs.md)
- **Host elements**: host bindings and attribute injection (every primitive exposes state via `host` + `data-*`). Read [host-elements.md](references/host-elements.md)

## Dependency injection

The `createContext` pattern is `InjectionToken` + providers + `inject()`, so DI fundamentals matter:

- **DI fundamentals**: overview and the `inject()` function. Read [di-fundamentals.md](references/di-fundamentals.md)
- **Defining providers**: `InjectionToken`, `useClass`/`useValue`/`useFactory`, scopes. Read [defining-providers.md](references/defining-providers.md)
- **Injection context**: where `inject()` is allowed, `runInInjectionContext`, `assertInInjectionContext` (relevant to constructor-vs-effect timing). Read [injection-context.md](references/injection-context.md)
- **Hierarchical injectors**: `ElementInjector` vs `EnvironmentInjector`, `optional`/`skipSelf`, `providers` vs `viewProviders`. Read [hierarchical-injectors.md](references/hierarchical-injectors.md)

## Accessibility — headless ARIA patterns

Directly on-mission for this library:

- **Angular ARIA components**: building headless, accessible Accordion, Listbox, Combobox, Menu, Tabs, Toolbar, Tree, Grid, and styling ARIA attributes. Read [angular-aria.md](references/angular-aria.md)

## Forms

The library exposes controls via `ControlValueAccessor` and is being readied for Signal Forms
(`RdxFormValueControl` / `RdxFormCheckboxControl` — see `signal-forms-readiness.md`):

- **Signal Forms**: signal-based form state. Read [signal-forms.md](references/signal-forms.md)

## Testing

- **Fundamentals (Vitest + `TestBed`)**: unit-test best practices and async patterns. Read [testing-fundamentals.md](references/testing-fundamentals.md)
