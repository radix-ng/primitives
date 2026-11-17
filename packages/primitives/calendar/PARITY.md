# Calendar — parity matrix

Initial inventory: 2026-11-17. Reference pin: **Base UI 1.9.0**,
`cf696d6f6e08c699c5bda24d5a033430909f2285` ([reference manifest](../../../apps/parity-testing/reference.json)).

No direct public counterpart exists in this pin. Record the Angular-specific contract and applicable shared behavior; direct Base UI part parity is **not applicable**, rather than an automatically missing upstream feature.

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

| Angular declaration                                                         | Selector / role              | Direct input/model/output declarations                                                                                                                                                                                                                                                                                                                                                                   |
| --------------------------------------------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`RdxCalendarCellTriggerDirective`](src/calendar-cell-trigger.directive.ts) | `[rdxCalendarCellTrigger]`   | `day`, `month`                                                                                                                                                                                                                                                                                                                                                                                           |
| [`RdxCalendarCellDirective`](src/calendar-cell.directive.ts)                | `td[rdxCalendarCell]`        | `date`                                                                                                                                                                                                                                                                                                                                                                                                   |
| [`RdxCalendarGridBodyDirective`](src/calendar-grid-body.directive.ts)       | `tbody[rdxCalendarGridBody]` | No direct signal input/model/output declaration.                                                                                                                                                                                                                                                                                                                                                         |
| [`RdxCalendarGridHeadDirective`](src/calendar-grid-head.directive.ts)       | `thead[rdxCalendarGridHead]` | No direct signal input/model/output declaration.                                                                                                                                                                                                                                                                                                                                                         |
| [`RdxCalendarGridRowDirective`](src/calendar-grid-row.directive.ts)         | `tr[rdxCalendarGridRow]`     | No direct signal input/model/output declaration.                                                                                                                                                                                                                                                                                                                                                         |
| [`RdxCalendarGridDirective`](src/calendar-grid.directive.ts)                | `table[rdxCalendarGrid]`     | No direct signal input/model/output declaration.                                                                                                                                                                                                                                                                                                                                                         |
| [`RdxCalendarHeadCellDirective`](src/calendar-head-cell.directive.ts)       | `th[rdxCalendarHeadCell]`    | No direct signal input/model/output declaration.                                                                                                                                                                                                                                                                                                                                                         |
| [`RdxCalendarHeaderDirective`](src/calendar-header.directive.ts)            | `div[rdxCalendarHeader]`     | No direct signal input/model/output declaration.                                                                                                                                                                                                                                                                                                                                                         |
| [`RdxCalendarHeadingDirective`](src/calendar-heading.directive.ts)          | `div[rdxCalendarHeading]`    | No direct signal input/model/output declaration.                                                                                                                                                                                                                                                                                                                                                         |
| [`RdxCalendarNextDirective`](src/calendar-next.directive.ts)                | `button[rdxCalendarNext]`    | `nextPage`                                                                                                                                                                                                                                                                                                                                                                                               |
| [`RdxCalendarPrevDirective`](src/calendar-prev.directive.ts)                | `button[rdxCalendarPrev]`    | `prevPage`                                                                                                                                                                                                                                                                                                                                                                                               |
| [`RdxCalendarRootDirective`](src/calendar-root.directive.ts)                | `[rdxCalendarRoot]`          | `value` (model), `defaultPlaceholder` (model), `locale`, `placeholder` (model), `multiple`, `fixedWeeks`, `disabled`, `preventDeselect`, `weekStartsOn`, `numberOfMonths`, `dir`, `minValue`, `maxValue`, `weekdayFormat`, `calendarLabel`, `readonly`, `pagedNavigation`, `propsNextPage`, `propsPrevPage`, `isDateDisabled`, `isDateUnavailable`, `initialFocus`, `months` (model), `weekDays` (model) |

Inherited classes and composed directives may add state/API. Follow those sources when completing
the comparison; similar part names or selector counts do not prove the same contract.

## State ownership and defaults

Ownership class for this entry: **Editable form value and auxiliary state**. The [shared contract](../../../docs/engineering/state-ownership.md)
distinguishes controlled UI requests, editable form models, readonly configuration, native DOM state
and derived/render state. Local writes to required form models are legitimate Angular behavior.
For strict controlled UI state, a request must not mutate the effective value before parent acceptance.

| State field / source                                                            | Current declaration                                                        | Ownership review                                                                                               |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| [`RdxCalendarRootDirective.value`](src/calendar-root.directive.ts)              | `model<DateValue \| DateValue[] \| undefined>(undefined)`                  | Editable form model where the actual Angular control contract requires it; coordinate CVA/native/Signal Forms. |
| [`RdxCalendarRootDirective.defaultPlaceholder`](src/calendar-root.directive.ts) | `model<DateValue>(undefined)`                                              | Default/initial seed; being a model does not make it a live authoritative edited value.                        |
| [`RdxCalendarRootDirective.placeholder`](src/calendar-root.directive.ts)        | `model<DateValue>(this.defaultPlaceholder() ?? this.defaultDate().copy())` | Define navigation/draft/presentation ownership separately from the form or business value.                     |
| [`RdxCalendarRootDirective.months`](src/calendar-root.directive.ts)             | `model<Month<DateValue>[]>(undefined)`                                     | Derived calendar presentation; audit why a writable public model is needed.                                    |
| [`RdxCalendarRootDirective.weekDays`](src/calendar-root.directive.ts)           | `model<string[]>(undefined)`                                               | Derived calendar presentation; audit why a writable public model is needed.                                    |

| Declared default / source                                                       | Declaration                   | Required comparison                                                                                                                                         |
| ------------------------------------------------------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`RdxCalendarRootDirective.defaultPlaceholder`](src/calendar-root.directive.ts) | `model<DateValue>(undefined)` | Initial supplied/falsy/empty/form priority, initial-only snapshot, late changes and reset baseline. Distinguish state defaults from reactive configuration. |

Always include allowed `false`, `0`, `''`, `[]` and `null` cases; initial parent/CVA/Signal Forms
writes; default changes after initialization; ignored/delayed/replaced controlled requests; cancellation
and native/form reset. Not every case applies to readonly or infrastructure entries: mark those
boundaries explicitly instead of converting all models to readonly inputs.

## Family-specific comparison matrix

“Source” identifies a local implementation fact. “Compare/verify/audit” is pending work. Priorities
describe the target work, not a certificate or a reproduced defect count.

| Area                   | Current observation / required target comparison                                                                                                                                                             | Priority |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| Date versus navigation | Source: value and placeholder/defaultPlaceholder are models; months and weekDays are also writable models. Distinguish selected date, visible-page navigation and derived calendar views.                    | P1       |
| Initialization         | Source: placeholder is seeded from defaultPlaceholder/defaultDate in its field initializer. Verify initially bound locale/date/default placeholder before asserting a correct initial snapshot.              | P1       |
| Calendar contract      | No public Calendar entry exists in the pin. Verify date identity, multiple selection, unavailable/min/max dates, locale/RTL, roving date focus, navigation and SSR using the Angular-specific date contract. | P2       |

Also compare the actual emitted per-part attributes/CSS variables with both the pinned declaration
files and runtime state mapping. Check native hosts, event reasons/details/default prevention,
accessibility relationships, keyboard/RTL and cleanup where applicable. Angular framework adapters
are permitted; changed observable behavior needs evidence or an explicitly reviewed deviation.

## Evidence inventory and next checks

- [Local unit files](__tests__): **1 file discovered**; not a passing-test count.
- No same-family named browser behavior file was found. Cross-family consumer or shared-mechanism checks may exist; locate them before claiming absence or coverage.
- No dedicated `suite.json` was found for this entry. Check shared suites for partial consumer evidence; this page claims no new paired comparisons.
- No conventional same-family SSR page was found; inspect shared SSR/hydration fixtures for applicable cases. No SSR/hydration result is claimed here.

No runtime suite was executed for this initial matrix sweep. Complete focused state/DI units,
native/layout browser cases and SSR/hydration checks before promoting rows; add a paired pinned
fixture before certifying equivalent observable behavior. See the
[verification skill](../../../.agents/skills/radix-testing/SKILL.md),
[matrix index](../../../docs/engineering/parity-matrices.md) and
[upstream preparation guide](../../../docs/engineering/upstream-reference.md).
