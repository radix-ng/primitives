---
name: radix-primitive
description: Add a Radix NG headless primitive or compound part, including DI context, public exports, entry points, stories and behavior checks.
---

# Implement a Radix NG primitive

Read [patterns](../../../docs/engineering/patterns.md) and the matching [pinned Base UI contract](../../../docs/engineering/upstream-reference.md). Inspect the existing family and choose the branch below. [Implementation references](references/implementation.md) point to live examples rather than copied scaffolds.

## New secondary entry

- Define the family anatomy, host elements, public inputs/outputs, state attributes and keyboard/focus behavior.
- Create `packages/primitives/<name>/` with source, `index.ts`, `ng-package.json`, tests and stories. Register the secondary path in `tsconfig.base.json`.
- Provide explicit typed contexts and compose shared mechanisms. New families use `Rdx<Name><Role>` / `<name>-<role>.ts`; add an imports array when consistent with the public API.

## New part in an existing family

- Read the family's Root/context, a neighboring part and its exports first. Reuse existing state and ownership; extend the context only when the new behavior needs it.
- Add the part within the existing entry. Follow that family's naming, host semantics and composition pattern, including established `Directive` suffixes.
- Export the public part and update the family's existing imports array where applicable. Keep its `ng-package.json` and tsconfig alias unchanged unless the task actually introduces a separate entry.
- Cover the part's behavior and integration with the existing family; update that family's anatomy/examples rather than scaffolding another root.

## Shared implementation and verification

- Preserve accepted Angular adaptations; a React store/ref is not by itself a reason to add one. See [composition](../../../docs/engineering/composition.md) for projection, thin positioners, portals and dismissal.
- If introducing an external runtime package, update library peers, the local development dependency and `ng-add`; see [installation](../../../docs/engineering/installation.md).
- Add meaningful behavior/a11y checks; a creation-only spec is not sufficient. Use [radix-testing](../radix-testing/SKILL.md) to select affected checks and consumers.
- Use [radix-storybook](../radix-storybook/SKILL.md) for demos/docs. Regenerate the consumer bundle after public API, MDX or demo-source changes.
- Build a new entry with `pnpm primitives:build`. For an existing family, use the same build when runtime/public API changes require it, plus focused specs and lint for changed TypeScript (`--max-warnings=0`). Expand coverage for shared dependencies or failures.

Report the public behavior/API, reference commit, intentional deviations and actual validation results.
