# State ownership and defaults — parity work contract

This is the target contract for the parity backlog, not a claim that every primitive already
implements it. Current implementations and evidence are recorded in the
[family matrices](parity-matrices.md). Breaking changes are explicitly permitted: public models,
inputs, outputs, defaults, part boundaries and adapters may change. Do not retain compatibility
branches, aliases, shadow values or duplicate mechanisms solely for the previous API.

## Classify each field, not the entire Root

| Kind                        | Owner and target                                                                                                                                                                                              | Examples                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Controlled UI state         | A supplied input owns the rendered state. Emit a request; the parent may accept, ignore, delay or replace it. Use ordinary input/output plus computed effective state and an uncontrolled signal when needed. | Popup `open`, active UI selection, Drawer snap point. Tabs is an existing implementation.             |
| Editable form value         | Preserve a writable model where Angular's form-control contract requires it. Local edits are legitimate; coordinate model, CVA, native input and Signal Forms without competing owners.                       | Text/number/date values; checkbox-style `checked`; Combobox value and editable query.                 |
| Readonly/configuration data | Derive from inputs/DI; do not introduce local editable ownership just because a field is named `value` or has a default. Configuration changes can legitimately remain reactive.                              | Meter/Progress value, direction/locale, positioning options, disabled/required metadata.              |
| Native DOM state            | Keep the browser authoritative where the API does not explicitly control the value. Distinguish native notifications from accepted programmatic writes.                                                       | Scroll position, native input selection, browser form behavior.                                       |
| Derived/render state        | Follow actual committed owner state and DOM lifetime, rather than the requested next state. Do not publish an independently writable mirror without a separate contract.                                      | Mounted/transition status, collection indices, geometry, highlighted/preview state, ID registrations. |

One Root can contain several kinds. Combobox and Select can retain a form-value model while the
parent owns controlled `open`. In Combobox, `value` is the Signal Forms field. `inputValue` has its own
editable query contract, including the behavior when a selection replaces the text.

Angular permits local writes to model inputs. Its `FormValueControl` requires
`value: ModelSignal<T>`. `FormCheckboxControl` requires `checked: ModelSignal<boolean>` and reserves
the `value` member for standard value controls.
A native submission token can use a differently named TS field with a public alias, as existing
checkbox-style controls do. See [custom controls](https://angular.dev/guide/forms/signals/custom-controls),
[FormValueControl](https://angular.dev/api/forms/signals/FormValueControl),
[model inputs](https://angular.dev/guide/components/inputs#model-inputs) and the
[project's form readiness guide](signal-forms-readiness.md).

**A writable model is not itself a defect.** Conversely, an ordinary one-way binding to a model does
not implement the strict parent-owned behavior of React controlled props. If an API needs both a
strict controlled contract and form-control interoperability, define the boundary explicitly;
do not pretend that one model supplies both contracts or add a second mirrored store.

## Initialization and defaults

1. Define what “supplied” means for each API. `false`, `0`, `''`, `[]` and permitted `null` values are
   authoritative values, not evidence that an input was omitted. If `undefined` is valid data,
   choose another explicit presence contract rather than inferring presence from truthiness.
2. A state default initializes uncontrolled state **once**, after initial bindings and initial form
   writes are available. A bound/CVA/Signal Forms value takes precedence, including an empty value.
3. Initial absence/false also finishes initialization. A default changing from absent/false to a
   value later must not become a delayed initialization that overwrites current state.
4. Later default changes do not replace edits, reopen a popup or change selection. Constructors and
   field initializers must not read an input default as though Angular had already set its binding.
5. Initializing a default or receiving an external value must not impersonate a user request, mark
   a form dirty or synthesize interaction callbacks. Actual lifecycle-completion notifications are
   a separate contract and follow the effective state.
6. A primitive that owns native reset through the browser input bridge captures its baseline after
   resolving initial ownership. Later default changes must leave that baseline intact. Angular forms
   keep their reset contracts. With no reset argument, a Reactive Forms control returns to its
   `defaultValue`, which is `null` by default and the initial value with `nonNullable`. An explicit
   reset value takes precedence. Signal Forms `reset()` clears interaction state and can take an
   optional new value.
   [Browser input bridge](../adr/0025-separate-angular-forms-from-browser-input-bridge.md),
   [Reactive Forms reset](https://angular.dev/api/forms/FormControl#reset),
   [Signal Forms reset](https://angular.dev/guide/forms/signals/field-state-management#resetting-forms-after-submission).

These rules concern **state defaults**. Reactive provider configuration, locale/direction inheritance,
positioning defaults and readonly formatting inputs are not uncontrolled state seeds. Audit those
contracts on their own terms.

## Request, acceptance and commit

For parent-owned UI state:

1. Create the request with its native event, reason and target metadata.
2. Run the documented cancelable callbacks in order. A veto prevents the accepted-request output
   and internal uncontrolled commit.
3. If uncontrolled, commit accepted state in the documented order relative to outputs.
4. If controlled, emit the accepted request but leave the effective value to its input. A parent
   can retain the current value, apply a replacement or update it later.
5. Rendering, transitions, focus, modal isolation, scroll locking and committed selection follow the
   effective value. They must not act as if an ignored controlled request was already committed.

For editable form values, preserve Angular's model-edit contract. Perform applicable cancellation and
normalization before the local write, then propagate the accepted edit through the supported form
channels once. Specify draft/preview versus committed value and reset/validation timing per control.
Do not mechanically migrate all form models to readonly inputs.

Automatic consistency changes, data removal and native/form reset are not necessarily user requests.
Document their reason, cancellation and notification rules instead of silently treating them as the
same event. Compare them with the pinned reference where a counterpart exists.

Record how each field treats a change in binding presence during the same instance's lifetime.
The pinned `useControlled` captures its mode on the first render. The popup store resolves
effective `open` through `openProp ?? open` and active trigger through
`triggerIdProp ?? activeTriggerId`. Test omission, explicit `null` for trigger identity and adding
or removing the binding where the public contract supports it.
[Pinned controlled hook](https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/utils/src/useControlled.ts),
[pinned popup selectors](https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/utils/popups/store.ts).

## Shared implementation boundary

Use the Tabs pattern for parent-owned UI requests. Menu and Autocomplete demonstrate one-time
initialization with writable models, including model outputs on default writes where their API
preserves that behavior. Their defaults tests cover initialization. To verify strict ownership,
test a parent that ignores a request through a one-way binding. Breaking changes allow the readonly
input to express presence directly where that contract fits.
[Tabs ownership](../adr/0081-tabs-controlled-selection-ownership.md),
[Menu and Autocomplete initialization](../adr/0071-menu-initial-model-defaults.md).

Angular input/output declarations must remain statically visible to its compiler. A shared helper may
coordinate already declared signals, request callbacks or initialization; it must not hide `input()`
or `model()` declarations in an arbitrary runtime factory. Prefer small shared mechanisms for the
actual policies over a universal React-style controlled store.

When a lasting implementation choice replaces an accepted decision, update/supersede the relevant
ADR according to [the ADR criteria](../adr/README.md#when-to-write-or-update-an-adr). A matrix entry is
planning evidence and does not silently supersede an ADR or change runtime behavior.

## Required comparison cases

| Boundary            | Cases                                                                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Initial state       | Omitted input/default, explicit falsy/empty/null, conflicting input and default, initial form write, silent initialization.                      |
| Late defaults       | Undefined/false to a supplied default after initialization; default replacement after edit/close/reset.                                          |
| Controlled requests | Parent ignores/repeats, accepts through two-way binding, delays, replaces or clears; consumer callback changes the value during the request.     |
| Cancellation        | Cancel before commit/output; native default prevention; nested Item/Root callback order and shared details.                                      |
| External changes    | Parent updates without a synthetic request; transitions/focus follow actual state; automatic data fallback has its own contract.                 |
| Forms               | Model-only, CVA, Signal Forms, native/external FormData, reset baseline, readonly/disabled, dirty/touched and duplicate-notification prevention. |
| Views/browser       | Destroy/recreate versus retention, closing/reopening, actual focus/scroll/isolation, native keyboard/pointer activation.                         |
| SSR/hydration       | Initial precedence before serialization, stable IDs, delayed child creation and server/client state consistency.                                 |

Use focused units for state/DI; actual browser checks for native interaction, layout and view timing;
and pinned differential scenarios before claiming equivalent behavior. Inventory links, passing
unrelated suites and skipped constructor placeholders are not parity certification.
