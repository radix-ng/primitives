# Portal — parity matrix

Initial inventory: 2026-11-17. Reference pin: **Base UI 1.9.0**,
`cf696d6f6e08c699c5bda24d5a033430909f2285` ([reference manifest](../../../apps/parity-testing/reference.json)).

No same-name public entry exists in this pin. The related [utils/popups/portal/FloatingPortal.tsx](https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/utils/popups/portal/FloatingPortal.tsx) is an internal/reference mechanism or another public family, not a drop-in public API.

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

| Angular declaration                           | Selector / role                                    | Direct input/model/output declarations |
| --------------------------------------------- | -------------------------------------------------- | -------------------------------------- |
| [`RdxPortal`](src/portal.ts)                  | `[rdxPortal]`                                      | `container`                            |
| [`RdxPortalPresence`](src/portal-presence.ts) | Base/composition directive; inspect its consumers. | `container`, `keepMounted`             |

Inherited classes and composed directives may add state/API. Follow those sources when completing
the comparison; similar part names or selector counts do not prove the same contract.

## State ownership and defaults

Ownership class for this entry: **Shared mechanism / delegated ownership**. The [shared contract](../../../docs/engineering/state-ownership.md)
distinguishes controlled UI requests, editable form models, readonly configuration, native DOM state
and derived/render state. Local writes to required form models are legitimate Angular behavior.
For strict controlled UI state, a request must not mutate the effective value before parent acceptance.

No direct open/value/checked/pressed model was found in the exported decorated classes.
This is **not** a claim of statelessness: composition, services, native DOM or internal signals can
own state. The family-specific matrix below identifies the relevant boundary.

No explicit default-prefixed signal input/model was found in these local declarations. Inherited
defaults still require inspection. Readonly input/configuration defaults are not uncontrolled state
seeds; do not add dummy defaultValue/valueChange APIs to satisfy a template.

Always include allowed `false`, `0`, `''`, `[]` and `null` cases; initial parent/CVA/Signal Forms
writes; default changes after initialization; ignored/delayed/replaced controlled requests; cancellation
and native/form reset. Not every case applies to readonly or infrastructure entries: mark those
boundaries explicitly instead of converting all models to readonly inputs.

## Family-specific comparison matrix

“Source” identifies a local implementation fact. “Compare/verify/audit” is pending work. Priorities
describe the target work, not a certificate or a reproduced defect count.

| Area             | Current observation / required target comparison                                                                                                                                                                                                                                                                    | Priority |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| View owner       | Source: host relocation and structural PortalPresence adapt Angular views. Render only the owning committed presence/lifetime; an ignored open request is not a mount.                                                                                                                                              | P1       |
| Target semantics | Compare omitted/null/custom/ShadowRoot containers, moving live views, declaration order, nested ownership and destroyed/pending targets.                                                                                                                                                                            | P2       |
| Hydration        | The structural Portal moves live physical view ranges, including dehydrated and newly materialized roots. Existing Angular SSR/browser checks cover stable IDs, reversed hydration, event replay, destination changes and owner disposal during lazy import. Retain those invariants when changing popup ownership. | P2       |

Also compare the actual emitted per-part attributes/CSS variables with both the pinned declaration
files and runtime state mapping. Check native hosts, event reasons/details/default prevention,
accessibility relationships, keyboard/RTL and cleanup where applicable. Angular framework adapters
are permitted; changed observable behavior needs evidence or an explicitly reviewed deviation.

## Evidence inventory and next checks

- [Local unit files](__tests__): **5 files discovered**; not a passing-test count.
- No same-family named browser behavior file was found. Cross-family consumer or shared-mechanism checks may exist; locate them before claiming absence or coverage.
- No dedicated `suite.json` was found for this entry. Check shared suites for partial consumer evidence; this page claims no new paired comparisons.
- The [AOT hydration suite](../../../apps/radix-ssr-testing/hydration-audit/README.md)
  exercises native node reuse, pre-bootstrap edits and focus across declaration-owned Portal
  moves. The [existing audit](../../../docs/engineering/mechanisms/portal-hydration-audit.md#implementation-and-current-regressions)
  records the three-engine Angular 22 results and the `@defer` cancellation limitation. Portal
  cleans up its owned nodes; destroying a block while its lazy import is pending can leave Angular
  unstable. [ADR 0085](../../../docs/adr/0085-hydration-owned-identity-and-view-ranges.md).

The 2026-11-18 audit passed 45 AOT cases in each of Chromium, Firefox and WebKit on Angular 22.0.2.
The [runner](../../../apps/radix-ssr-testing/hydration-audit/run.ts) checks server node identity,
stable IDs and ARIA targets, once-only event replay, and retargeting before and after hydration.
Destroying the owner or closing the Portal during a gated import left zero probe roots and no new
child instances. The ordinary `@if` control retained its dehydrated probe. All three cancellation
cases left `ApplicationRef.isStable` false in each engine, and all remained interactive. Retargeting
without destruction hydrated the same nodes at the new destination and reached stability.

The pinned [Combobox Portal](https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/combobox/portal/ComboboxPortal.tsx)
renders a portal wrapper under the chosen container. Angular preserves the declaration-owned view
by moving the physical range. Keep that contract for hydration and native state. The cancellation
control isolates Angular's pending hydration task from Portal cleanup. Paired comparisons of other
popup behaviors remain separate. See the
[verification skill](../../../.agents/skills/radix-testing/SKILL.md),
[matrix index](../../../docs/engineering/parity-matrices.md) and
[upstream preparation guide](../../../docs/engineering/upstream-reference.md).
