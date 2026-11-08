# ADR 0025: Separate Angular forms from the browser input bridge

- Status: Accepted
- Date: 2026-11-08
- Decision owners: Radix NG maintainers
- Related: ADR 0024, `core`, `select`, `field`, `form`

## Context

Select now supports browser autofill, native submission and constraint validation through a technical
input. These capabilities must be distinguished from Angular form integration when porting Base UI.
Direct DOM access in Angular does not make a button/listbox behave as an editable HTML form control.
Our Select is composed from a trigger button and popup; neither represents its selected value to the
browser as an input would.

Angular's `ControlValueAccessor` and Signal Forms `FormValueControl` already connect the primitive's
value and interaction state to Angular forms. They need no extra input for that connection. The
technical input serves the browser's form model, independently of the framework used to render it.

## Decision

Retain the implemented Select native-input bridge and keep the responsibilities separate:

| Responsibility                                                              | Owner                                              |
| --------------------------------------------------------------------------- | -------------------------------------------------- |
| Value, Angular validators, dirty/touched state                              | Primitive signals and Angular form adapters        |
| Browser submission, form association, autofill and native constraints       | Native form controls and the shared browser bridge |
| Matching autofilled text to a Select item and accepting/canceling the value | Select                                             |

`core/src/dom/use-native-form-control.ts` owns browser-only creation after hydration, attributes,
input access, event coalescing, committed-value restoration, reset coordination and disposal. It
accepts a native-control ownership signal so a consumer-rendered input can take over submission.
Existing submission-only consumers retain their hidden entries.

Reuse an existing native input when it represents the submitted value. An editable query or one
slot of a compound input may represent only part of that value; the primitive decides whether reuse
is appropriate. A separate technical input is justified for Select's current button/popup anatomy.

There are two distinct browser representations: `type="hidden"` can carry a submission entry;
a visually hidden text input can also participate in autofill and constraint validation. Hidden
inputs do not participate in constraint validation. Providing an Angular validator alone does not
require a technical input or a second validation engine.

Prefer the readonly `nativeInput()` signal for Angular access. Callback `inputRef` is retained as an
Angular adaptation of the Base UI API name, receiving an element or `null` on cleanup. Neither API
owns a separate selection model. Angular forms remain usable independently of the browser bridge.

Base UI parity means preserving the documented capabilities and behavior while expressing framework
integration through Angular. Shared browser mechanisms belong in core; React-specific state, refs
and synthetic-event machinery do not define the Angular implementation.

## Consequences

### Positive

Select interoperates with browser forms and autofill while retaining its Angular form contracts.
Future consumers can reuse the input lifecycle without duplicating Select's item-selection policy.

### Negative

The bridge adds a technical DOM element and synchronizes its serialized value. Native inputs are
created after hydration, so server HTML does not contain the generated input. Both a signal and a
callback access API are exposed.

### Risks

A named empty single Select now contributes an empty string to `FormData`; previously it contributed
no entry. Multiple empty selections still contribute no entries. Field names take precedence when
provided. These changes require the Select migration note and a breaking-change commit marker.

Automated checks simulate native autofill events in Chromium. Real saved-profile autofill,
non-Chromium behavior and assistive-technology equivalence remain separate verification work.

## Alternatives Considered

- Angular model integration alone: sufficient for Angular form values, but does not expose the
  custom Select's value to browser autofill or native constraint validation.
- A `formdata` event handler alone: can supply serialized entries, but does not provide an editable
  browser control for autofill or native constraints.
- A native select as the entire control: a different rendering/anatomy contract from the current
  headless compound Select.
- A duplicate input in every primitive: unnecessary when an existing native control represents the
  submitted value; use the shared ownership mechanism instead.

## Acceptance Criteria

1. Angular form models and validators own application state; native invalid events may mark touched
   without writing Angular validation errors.
2. Native single/repeated submission, external-form association, required checks and reset work.
3. Autofill resolves values/labels without opening the popup or stealing focus.
4. Rejected, unmatched, disabled, read-only and multiple-mode autofill preserves committed state.
5. Canceled autofill preserves server errors; accepted selection reports the committed edit to Field.
6. Input refs and listeners clean up; generated DOM and ref callbacks stay out of server rendering.

## References

- [Angular ControlValueAccessor](https://angular.dev/api/forms/ControlValueAccessor)
- [Angular FormValueControl](https://angular.dev/api/forms/signals/FormValueControl)
- [HTML form control infrastructure](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html)
- [HTML hidden input state](<https://html.spec.whatwg.org/multipage/input.html#hidden-state-(type=hidden)>)

Base UI reference: source commit `cf696d6f6e08c699c5bda24d5a033430909f2285` (package version 1.9.0),
`packages/react/src/internals/getHiddenInputType.ts` and `packages/react/src/select/root/SelectRoot.tsx`.
