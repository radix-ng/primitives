# Navigation Menu — parity matrix

Initial inventory: 2026-11-17. Reference pin: **Base UI 1.9.0**,
`cf696d6f6e08c699c5bda24d5a033430909f2285` ([reference manifest](../../../apps/parity-testing/reference.json)).

Primary counterpart: [navigation-menu](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/navigation-menu).
Pinned exported parts/functions: `Root`, `List`, `Item`, `Content`, `Trigger`, `Portal`, `Positioner`, `Viewport`, `Backdrop`, `Popup`, `Arrow`, `Link`, `Icon`.

**Scope: initial source inventory and comparison backlog.** Exported local declarations and evidence
locations were inventoried; complete per-handler, per-attribute and browser equivalence has not been
established. A source observation below is not a newly passing runtime or differential result.

**Breaking changes are permitted; backward compatibility does not constrain the target.** Apply the
[state ownership/defaults contract](../../../docs/engineering/state-ownership.md) per field. Inputs,
models, outputs, defaults and part boundaries may change; do not retain compatibility mirrors or
aliases solely for the old API. Review earlier ADR decisions explicitly when replacing them.

## Public surface inventory

Source of truth: [entry barrel](index.ts). These are directly exported decorated classes, not a
claim that inherited/host-directive APIs or every upstream prop have already been compared. Exported
composition bases, guards and internal helpers are not thereby promoted to stable public widget parts.

| Angular declaration                                                   | Selector / role                              | Direct input/model/output declarations                                                                                                                           |
| --------------------------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`RdxNavigationMenuArrow`](src/navigation-menu-arrow.ts)              | `[rdxNavigationMenuArrow]`                   | No direct signal input/model/output declaration.                                                                                                                 |
| [`RdxNavigationMenuBackdrop`](src/navigation-menu-backdrop.ts)        | `[rdxNavigationMenuBackdrop]`                | No direct signal input/model/output declaration.                                                                                                                 |
| [`RdxNavigationMenuContent`](src/navigation-menu-content.ts)          | `[rdxNavigationMenuContent]`                 | `rdxNavigationMenuContent`, `forceMount`                                                                                                                         |
| [`RdxNavigationMenuIcon`](src/navigation-menu-icon.ts)                | `[rdxNavigationMenuIcon]`                    | No direct signal input/model/output declaration.                                                                                                                 |
| [`RdxNavigationMenuItem`](src/navigation-menu-item.ts)                | `[rdxNavigationMenuItem]`                    | `value`                                                                                                                                                          |
| [`RdxNavigationMenuLink`](src/navigation-menu-link.ts)                | `[rdxNavigationMenuLink]`                    | `active`, `closeOnClick`, `onSelect` (output)                                                                                                                    |
| [`RdxNavigationMenuList`](src/navigation-menu-list.ts)                | `[rdxNavigationMenuList]`                    | No direct signal input/model/output declaration.                                                                                                                 |
| [`RdxNavigationMenuPopup`](src/navigation-menu-popup.ts)              | `[rdxNavigationMenuPopup]`                   | `escapeKeyDown` (output), `pointerDownOutside` (output), `focusOutside` (output)                                                                                 |
| [`RdxNavigationMenuPortal`](src/navigation-menu-portal.ts)            | `ng-template[rdxNavigationMenuPortal]`       | `keepMounted`                                                                                                                                                    |
| [`RdxNavigationMenuPortalMisuseGuard`](src/navigation-menu-portal.ts) | `[rdxNavigationMenuPortal]:not(ng-template)` | No direct signal input/model/output declaration.                                                                                                                 |
| [`RdxNavigationMenuPositioner`](src/navigation-menu-positioner.ts)    | `[rdxNavigationMenuPositioner]`              | No direct signal input/model/output declaration.                                                                                                                 |
| [`RdxNavigationMenuRoot`](src/navigation-menu-root.ts)                | `[rdxNavigationMenuRoot]`                    | `value` (model), `defaultValue`, `orientation`, `dir`, `delay`, `closeDelay`, `onValueChange` (output), `onOpenChange` (output), `onOpenChangeComplete` (output) |
| [`RdxNavigationMenuTrigger`](src/navigation-menu-trigger.ts)          | `button[rdxNavigationMenuTrigger]`           | `disabled`, `openOnHover`                                                                                                                                        |
| [`RdxNavigationMenuViewport`](src/navigation-menu-viewport.ts)        | `[rdxNavigationMenuViewport]`                | `forceMount`                                                                                                                                                     |

Inherited classes and composed directives may add state/API. Follow those sources when completing
the comparison; similar part names or selector counts do not prove the same contract.

## State ownership and defaults

Ownership class for this entry: **UI request/controlled state**. The [shared contract](../../../docs/engineering/state-ownership.md)
distinguishes controlled UI requests, editable form models, readonly configuration, native DOM state
and derived/render state. Local writes to required form models are legitimate Angular behavior.
For strict controlled UI state, a request must not mutate the effective value before parent acceptance.

| State field / source                                                               | Current declaration                     | Ownership review                                                                           |
| ---------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------ |
| [`RdxNavigationMenuItem.valueInput`](src/navigation-menu-item.ts) (public `value`) | `input<string \| undefined>(undefined)` | Readonly supplied data/identity/configuration; no local model write.                       |
| [`RdxNavigationMenuRoot.value`](src/navigation-menu-root.ts)                       | `model<string \| null>(null)`           | Define navigation/draft/presentation ownership separately from the form or business value. |

| Declared default / source                                           | Declaration                   | Required comparison                                                                                                                                         |
| ------------------------------------------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`RdxNavigationMenuRoot.defaultValue`](src/navigation-menu-root.ts) | `input<string \| null>(null)` | Initial supplied/falsy/empty/form priority, initial-only snapshot, late changes and reset baseline. Distinguish state defaults from reactive configuration. |

Always include allowed `false`, `0`, `''`, `[]` and `null` cases; initial parent/CVA/Signal Forms
writes; default changes after initialization; ignored/delayed/replaced controlled requests; cancellation
and native/form reset. Not every case applies to readonly or infrastructure entries: mark those
boundaries explicitly instead of converting all models to readonly inputs.

## Family-specific comparison matrix

“Source” identifies a local implementation fact. “Compare/verify/audit” is pending work. Priorities
describe the target work, not a certificate or a reproduced defect count.

| Area                    | Current observation / required target comparison                                                                                                                              | Priority |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Value/default ownership | Source: value is a model with a first-non-null defaultValue latch. Compare explicit null/no-active-item, parent refusal and a late default; target one uncontrolled snapshot. | P1       |
| Accepted navigation     | Compare hover/click/native key requests, canceled active item changes, trigger identity and Popup/Viewport transitions following the accepted value.                          | P1       |
| Composition/focus       | Preserve the recorded native Tab policy while comparing arrow navigation, links, nested content, projected wrappers, RTL, pointer grace and multi-root Portal exits.          | P2       |

Also compare the actual emitted per-part attributes/CSS variables with both the pinned declaration
files and runtime state mapping. Check native hosts, event reasons/details/default prevention,
accessibility relationships, keyboard/RTL and cleanup where applicable. Angular framework adapters
are permitted; changed observable behavior needs evidence or an explicitly reviewed deviation.

## Evidence inventory and next checks

- [Local unit files](__tests__): **1 file discovered**; not a passing-test count.
- Named browser regression files: [navigation-menu.behavior.spec.ts](../../../apps/visual-regression/tests/navigation-menu.behavior.spec.ts). Scenario scope and freshness still need review; none was run by this inventory.
- No dedicated `suite.json` was found for this entry. Check shared suites for partial consumer evidence; this page claims no new paired comparisons.
- No conventional same-family SSR page was found; inspect shared SSR/hydration fixtures for applicable cases. No SSR/hydration result is claimed here.

No runtime suite was executed for this initial matrix sweep. Complete focused state/DI units,
native/layout browser cases and SSR/hydration checks before promoting rows; add a paired pinned
fixture before certifying equivalent observable behavior. See the
[verification skill](../../../.agents/skills/radix-testing/SKILL.md),
[matrix index](../../../docs/engineering/parity-matrices.md) and
[upstream preparation guide](../../../docs/engineering/upstream-reference.md).
