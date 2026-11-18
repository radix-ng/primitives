# Direction Provider — parity matrix

Initial inventory: 2026-11-17. Reference pin: **Base UI 1.9.0**,
`cf696d6f6e08c699c5bda24d5a033430909f2285` ([reference manifest](../../../apps/parity-testing/reference.json)).

Primary counterpart: [direction-provider](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/direction-provider).
Pinned exported parts/functions: `Provider`, `useDirection`.

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

| Angular declaration                                 | Selector / role          | Direct input/model/output declarations |
| --------------------------------------------------- | ------------------------ | -------------------------------------- |
| [`RdxDirectionProvider`](src/direction-provider.ts) | `[rdxDirectionProvider]` | `direction`, `dir`                     |

Inherited classes and composed directives may add state/API. Follow those sources when completing
the comparison; similar part names or selector counts do not prove the same contract.

## State ownership and defaults

Ownership class for this entry: **Readonly data/configuration**. The [shared contract](../../../docs/engineering/state-ownership.md)
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

| Area                         | Current observation / required target comparison                                                                                                                                                                                                                                                                                                                                                                                                            | Priority |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Direction ownership          | [Angular DI](src/direction-provider.ts) resolves `direction`, then the Angular `dir` input alias, then the parent signal. This configures primitive behavior. Native `dir` or CSS direction controls visual layout.                                                                                                                                                                                                                                         | N/A      |
| Inheritance                  | Under a parent providing RTL, a nested provider with an omitted direction inherits RTL in Angular. [The pinned provider](https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/direction-provider/DirectionProvider.tsx) resolves its omitted prop to LTR. Retain reactive inheritance as an Angular contract. [ADR 0088](../../../docs/adr/0088-inherit-primitive-direction-through-di.md) records the decision. | P2       |
| Native versus logical layout | The portalled Composite follows declaration DI for ArrowRight even under a native LTR container. The provider leaves DOM direction to the consumer.                                                                                                                                                                                                                                                                                                         | P2       |

Also compare the actual emitted per-part attributes/CSS variables with both the pinned declaration
files and runtime state mapping. Check native hosts, event reasons/details/default prevention,
accessibility relationships, keyboard/RTL and cleanup where applicable. Angular framework adapters
are permitted; changed observable behavior needs evidence or an explicitly reviewed deviation.

## Evidence inventory and next checks

- [Direction Provider units](__tests__/direction-provider.spec.ts) cover the global default, DI
  configuration, nested omission under RTL, explicit LTR and a live parent update. The portalled
  Composite moves focus leftward on ArrowRight in RTL and rightward after the parent changes to LTR.
  The native destination remains `dir="ltr"` in both cases.
- No same-family named browser behavior file was found. Cross-family consumer or shared-mechanism checks may exist; locate them before claiming absence or coverage.
- No dedicated `suite.json` was found for this entry. Check shared suites for partial consumer evidence; this page claims no new paired comparisons.
- No conventional same-family SSR page was found; inspect shared SSR/hydration fixtures for applicable cases. No SSR/hydration result is claimed here.

The 2026-11-18 audit verifies DI and actual DOM focus in Angular unit tests, with a source comparison
against the pin. CSS layout geometry and popup positioning are outside this check. See the
[verification skill](../../../.agents/skills/radix-testing/SKILL.md),
[matrix index](../../../docs/engineering/parity-matrices.md) and
[upstream preparation guide](../../../docs/engineering/upstream-reference.md).
