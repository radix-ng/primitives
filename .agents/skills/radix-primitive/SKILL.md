---
name: radix-primitive
description: Add a Radix NG headless primitive or compound part, including DI context, public exports, entry points, stories and behavior checks.
---

# Implement a Radix NG primitive

Read [patterns](../../../docs/engineering/patterns.md), then identify the matching [pinned Base UI contract](../../../docs/engineering/upstream-reference.md). Reuse an existing family of comparable complexity: Collapsible for simple state, Popover for floating composition, Checkbox for form integration.

1. Identify public parts, host elements, inputs/outputs, state attributes and keyboard/focus behavior. Preserve accepted Angular adaptations; do not reproduce React stores/refs without an Angular need.
2. Compose shared primitives and typed DI contexts. Consult [composition](../../../docs/engineering/composition.md) for projection ownership, thin positioners, portals and dismissal.
3. Add `src/<name>-<role>.ts`, barrel exports and optional NgModule, `ng-package.json`, and the secondary path in `tsconfig.base.json`. New names use `Rdx<Name><Role>` without the `Directive` suffix; follow the family's established style when extending it. [Scaffold examples](references/scaffold.md) show file structure.
4. If adding a runtime package, update library peer dependencies, the local development dependency and the `ng-add` schematic. See [installation](../../../docs/engineering/installation.md).
5. Add meaningful behavior specs for the contract, including applicable a11y and controlled/default state behavior. A creation-only spec is not sufficient coverage. Select focused layers using [radix-testing](../radix-testing/SKILL.md).
6. Use [radix-storybook](../radix-storybook/SKILL.md) for demos and public documentation. Regenerate the consumer bundle after API, MDX or demo-source changes.
7. Run `pnpm primitives:build`, affected specs and lint for changed TypeScript with `--max-warnings=0`. Expand validation for shared mechanisms or failures; follow the same scope policy as other work.

Report the public behavior/API, reference commit, intentional deviations and actual validation results.
