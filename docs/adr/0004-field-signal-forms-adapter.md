# ADR 0004: Keep Field Form-Agnostic and Defer Signal Forms Adapter

- Status: Proposed
- Date: 2026-06-03
- Decision owners: Radix NG maintainers
- Related package: `packages/primitives/field`

## Context

`@radix-ng/primitives/field` groups a form control with accessible label, description, error message,
and field state. It is intentionally headless and does not own validation, value management, or form
submission. Consumers pass state into `rdxFieldRoot` through inputs such as `invalid`, `disabled`,
`required`, `dirty`, `touched`, `filled`, and `focused`.

Base UI's Field includes form-like behavior such as validation configuration and state derivation. That
shape fits React because Base UI needs to provide more of the form coordination itself. Angular already
has form systems for this layer:

- Reactive Forms and template-driven forms are stable Angular APIs.
- Signal Forms are available from `@angular/forms/signals`, but Angular documents them as experimental:
  <https://angular.dev/guide/forms/signals/overview>
- Signal Forms expose field state through signals and bind native controls with `[formField]`:
  <https://angular.dev/essentials/signal-forms>

Because Signal Forms are experimental and their API may change, making `@radix-ng/primitives/field`
depend directly on them would couple a stable primitive API to an unstable Angular API.

## Decision

Keep `Field` form-agnostic.

Do not add Signal Forms as a dependency of `@radix-ng/primitives/field` while Signal Forms are
experimental. Do not implement a Radix NG validation engine, schema layer, submit lifecycle, or
replacement for Angular Forms.

When Signal Forms become stable enough for this library's support policy, add Signal Forms integration
as an adapter or example layer rather than changing the core Field primitive. The adapter should map
Angular field state to existing `rdxFieldRoot` inputs and should not add competing state semantics.

## Preferred Current Usage

Reactive Forms, template-driven forms, and custom controls should pass state explicitly:

```html
<div
  rdxFieldRoot
  required
  [invalid]="control.invalid && (control.touched || submitted())"
  [dirty]="control.dirty"
  [touched]="control.touched"
  [disabled]="control.disabled"
>
  <label rdxFieldLabel>Email</label>
  <input rdxFieldControl [formControl]="control" />
  <p rdxFieldDescription>Use your account email.</p>
  <p rdxFieldError>Email is required.</p>
</div>
```

Signal Forms examples should use the same shape when added:

```html
<div rdxFieldRoot [invalid]="!email().valid()" [touched]="email().touched()" [disabled]="email().disabled()">
  <label rdxFieldLabel>Email</label>
  <input rdxFieldControl [formField]="email" />
  <p rdxFieldError>Email is required.</p>
</div>
```

The exact Signal Forms property names should be verified against the stable Angular API before any
adapter is implemented.

## Proposed Signal Forms Adapter Shape

The first Signal Forms integration should be a story/docs example. If repeated code appears across
examples, consider a small adapter directive.

Possible adapter:

```html
<div rdxFieldRoot [rdxSignalField]="loginForm.email">
  <label rdxFieldLabel>Email</label>
  <input rdxFieldControl [formField]="loginForm.email" />
  <p rdxFieldError>Email is required.</p>
</div>
```

The adapter may:

- read Signal Forms field state;
- set or mirror `invalid`, `disabled`, `required`, `dirty`, `touched`, `filled`, and `focused`;
- keep using `RdxFieldControl` for ARIA relationships;
- stay optional and tree-shakeable.

The adapter must not:

- create or own the Signal Forms model;
- run validation itself;
- wrap or replace `[formField]`;
- change `RdxFieldRoot` input semantics;
- require Signal Forms for non-Signal-Forms consumers.

## Consequences

### Positive

- `Field` stays usable with Reactive Forms, template-driven forms, Signal Forms, and custom controls.
- The primitive avoids depending on an experimental Angular API.
- Validation remains in Angular Forms, where Angular users expect it.
- Future Signal Forms integration can be added without breaking existing Field consumers.
- Storybook examples can show both stable Reactive Forms and future Signal Forms usage clearly.

### Negative / Risks

- Consumers must map form state into `rdxFieldRoot` inputs manually until an adapter exists.
- Signal Forms examples may lag behind Angular changes while the API is experimental.
- A future adapter may need revision if Signal Forms state names or directives change.
- Field cannot automatically infer all form state from every possible Angular form setup.

## Alternatives Considered

### Port Base UI Field Behavior Directly

This would make Field own validation and state derivation. It is not recommended for Angular because it
duplicates Angular Forms and risks conflicting with both Reactive Forms and Signal Forms.

### Add Signal Forms Dependency Now

This would make Signal Forms examples easier to write today but couples a primitive package to an
experimental API. It also risks forcing consumers onto Signal Forms even when they use Reactive Forms.

### Auto-detect Every Angular Form API

Field could try to inject `NgControl` and later Signal Forms field state automatically. This is useful
only when it remains opportunistic. It should not become the primary contract because hidden inference
can be surprising and incomplete.

## Migration Plan

1. Keep the initial `Field` primitive form-agnostic.
2. Maintain a Reactive Forms story that demonstrates explicit state mapping.
3. Add a Signal Forms story only when the project is ready to depend on the current Angular version
   and the API shape is acceptable for examples.
4. If Signal Forms mapping repeats across examples, add an optional adapter directive in a separate
   implementation pass.
5. Re-evaluate whether the adapter belongs in `@radix-ng/primitives/field` or a separate entry point if
   it introduces a peer dependency or version constraint.

## Trigger for Revisit

Revisit this ADR when:

- Angular marks Signal Forms stable;
- the project upgrades to a version where Signal Forms are part of the supported baseline;
- multiple stories or consumers duplicate the same Signal Forms to Field state mapping;
- a consumer requests automatic Field integration with Signal Forms;
- `RdxFieldRoot` needs a new input that only exists to support Signal Forms.
