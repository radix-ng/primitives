# ADR 0024: Share label registration and interaction

- Status: Accepted
- Date: 2026-11-08
- Decision owners: Radix NG maintainers
- Related: ADR 0014, `core`, `field`, `select`, `combobox`, `autocomplete`

## Context

Select's Base UI audit identified a missing Label and control id input. Field already associates
native labels, and Combobox's label is reused by Autocomplete. Base UI solves their registration,
cleanup and interaction concerns in shared labelable-provider internals.

## Decision

Extract shared behavior when the upstream implementation and concrete Angular consumers establish
a common responsibility. Adopt it in those consumers in the same change. Finishing Select first
would duplicate an already understood mechanism. A shared React abstraction is evidence to inspect,
rather than an instruction to reproduce React ownership and ref APIs in Angular.

`core/src/labelable.ts` owns:

- `createLabelRegistry`: signal-based registration with an unregister function owned by each label.
  Removing an old view cannot clear a replacement with the same id. Removing the current label
  restores the preceding live label.
- `useLabel`: reactive registration, native `for`, non-native focus, double-click selection
  prevention and protection of nested interactive elements.
- `getLabelControl`: lookup in the label's ShadowRoot, enclosing shadow trees and owner document.

Field Root and Field Item own separate registries. Select owns a local registry; its Label also
registers with an enclosing Field. Combobox's existing engine owns its registry and shares the
mechanism with Autocomplete. Core receives callbacks and registries, without importing the consumers.

Each primitive retains control identity, focus-target policy, value, popup state and Field state
bindings. Select Root's id identifies Trigger without duplicating it on a separate root element.
Container roots and Root/Trigger on one button remain supported.

## Consequences

### Positive

Registration and interaction fixes apply across consumers with shared regression coverage. Select
adds its public Label without establishing a parallel label engine.

### Negative

Helpers must be exported from core for secondary entry points. They are internal machinery;
applications should compose the public Field and primitive Label directives.

### Risks

Last-registration precedence and restoration of a preceding live label are explicit. Test conditional
labels and Field Item isolation. Preserve native activation and explicit accessible-name references.

## Alternatives Considered

- Finish Select before extraction: duplicates behavior needed by Field and Combobox now.
- One universal control engine: mixes labels with value, validation and popup policy.
- Migrate every labeled control at once: expands scope beyond the consumers proving this seam.

## Acceptance Criteria

1. Field, Select and Combobox use the shared code; Autocomplete composes Combobox.Label.
2. Conditional replacement/removal preserves references to live labels.
3. Label text focuses its control without opening a popup; nested controls retain activation.
4. Dynamic Select ids, native labels, same-host composition and container roots stay associated.
5. Server HTML includes associations and no duplicate forwarded ids before hydration.
6. Browser checks cover all four consumers and existing Select/Combobox/Autocomplete behavior.

## Base UI References

Source commit `cf696d6f6e08c699c5bda24d5a033430909f2285` (package version 1.9.0):

- `packages/react/src/internals/labelable-provider/useLabel.ts`
- `packages/react/src/utils/useRegisteredLabelId.ts`
- `packages/react/src/select/label/SelectLabel.tsx`
- `packages/react/src/select/trigger/SelectTrigger.tsx`

Angular keeps a live registration stack rather than React state setters. Existing Angular
Combobox.Label continues to support an outside input; current upstream uses this part for its
trigger. This change shares behavior without claiming complete Combobox API parity.
