# ADR 0021: Bridge `NgControl` State into Field Explicitly

- Status: Accepted
- Date: 2026-07-11
- Decision owners: Radix NG maintainers
- Related packages: `core`, `field`, `form`

## Context

Reactive Forms and template-driven controls already synchronize their own value, validation status,
errors, dirty, touched, disabled, and reset state through the shared same-host `NgControl` bridge.
However, an enclosing `rdxFieldRoot` intentionally owns displayed validity. Without an adapter,
consumers had to repeat `[invalid]`, `[pending]`, `[disabled]`, `[dirty]`, and `[touched]` bindings on
every Field, and separately supply a `name` for Form server-error routing.

Signal Forms solved the equivalent boundary with the explicit same-host `rdxSignalField` directive.
The classic Angular Forms path needs the same release-ready composition without adding a validation
engine to Field or relying on hidden descendant discovery.

## Decision

Ship `RdxNgControlField` (`rdxNgControlField`) from `@radix-ng/primitives/field`.

- Place it on the control that already carries `formControl`, `formControlName`, or `ngModel`.
- It lazily reads the same-host `NgControl` after value-accessor construction, then registers an
  `RdxFieldState` provider on the enclosing Field.
- Angular owns values, validators, async status, errors, interaction state, and reset. The adapter only
  reports actual state; Field's `validationMode` remains the sole presentation gate.
- `PENDING` and computed `DISABLED` validity are neutral. Explicit/client or Form server invalidity may
  still win, matching Base UI's controlled-invalid precedence.
- `NgControl.name` becomes the fallback Field name for `rdxFormRoot[errors]`; an explicit Field `name`
  always wins for nested or remapped server keys.
- Normalized Angular errors keep their arbitrary keys. `RdxFieldError.match` accepts a key such as
  `required`, `email`, or `unavailable`; only visible error ids enter `aria-describedby`. Validators
  that return a string or `{ message }` remain available through `RdxFieldError.messages()`.

This keeps the adapter explicit and tree-shakeable. `rdxFieldRoot` itself does not search descendants,
inject a form model, run validation, or change its input semantics.

## Base UI Parity and Angular Divergence

The Field validity contract remains Base UI's tri-state `true | false | null`, including neutral
pending/disabled presentation and match-specific error parts. The source of validity deliberately
differs: Base UI can run native/custom validation inside Field, while Radix NG delegates that work to
Angular Forms and only adapts its result.

## Alternatives Considered

### Infer every descendant `NgControl` automatically

Rejected. Angular DI flows from the control toward its ancestors, and a Field may own a compound root
or several item controls. Descendant queries would be implicit, timing-sensitive, and ambiguous.

### Keep manual Field bindings

Supported as the low-level escape hatch, but no longer the recommended Angular Forms recipe. Repeating
five state bindings obscures the actual Field anatomy and is easy to make inconsistent with async,
disabled, programmatic touched/dirty, and reset transitions.

### Port Base UI's validation engine

Rejected. It would compete with Angular validators, duplicate async/submission semantics, and weaken
the Angular-native positioning of the project.

## Consequences

- Reactive Forms, `ngModel`, and Signal Forms now use parallel explicit Field adapters.
- Native and compound CVA controls share one recipe.
- Form server errors can route from `formControlName` / named `ngModel` without duplicating a Field name.
- Custom form systems continue to use the existing explicit Field inputs and `RdxFieldState` seam.
