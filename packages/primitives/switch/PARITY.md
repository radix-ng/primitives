# Switch parity matrix

Reference: Base UI 1.9.0 at `cf696d6f6e08c699c5bda24d5a033430909f2285`.
[Manifest](../../../apps/parity-testing/reference.json),
[pinned Switch source](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/switch).

## Anatomy

| Base UI                | Angular                      | Contract                                                                           |
| ---------------------- | ---------------------------- | ---------------------------------------------------------------------------------- |
| Switch.Root            | [Root](src/switch-root.ts)   | Native button with the switch role. Owns the value, requests and form behavior.    |
| Switch.Thumb           | [Thumb](src/switch-thumb.ts) | Reflects checked, disabled, read-only and required state from Root.                |
| Root's native checkbox | [Input](src/switch-input.ts) | Generated beside Root after browser rendering. An authored input takes precedence. |

Root and Thumb expose `data-checked`, `data-unchecked`, `data-disabled`, `data-readonly` and
`data-required`. Both parts expose displayed validity, dirty and touched state. Inside a Field,
they also reflect its filled and focused state. The parts define no public CSS variables.

## State and browser forms

| Area                                    | Implemented contract                                                                                                                                                               | Evidence                                                      |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| P1 · Initial ownership                  | Editable `checked` and initial Angular form writes take precedence over `defaultChecked`, including explicit false.                                                                | Paired `default` and `late-default`; unit and SSR assertions. |
| P1 · Parent-owned requests              | A defined `controlledChecked` owns the effective state. The parent may ignore or defer a request.                                                                                  | Paired `controlled`.                                          |
| P1 · Default and reset                  | Default resolves once. Native reset restores the editable baseline or delegates to the Angular control, and honors reset cancellation.                                             | Paired `reset` and Angular forms units.                       |
| P1 · Change veto                        | The callback receives a cancelable request with the click event. A veto leaves the old value in the switch and native input.                                                       | Paired `canceled`.                                            |
| P2 · Native activation                  | Label, Space, Enter and native input activation share a single state request. Accepted edits produce native input and change events.                                               | Paired `activation` and `authored`.                           |
| P2 · Disabled and read-only             | Disabled uses the native button state and excludes the value from submission. Read-only stays focusable and keeps its value.                                                       | Paired `disabled` and `readonly`.                             |
| P2 · Native form ownership              | Generated input enforces `required`, supports explicit form ownership, and forwards invalid focus to the visible button. The form receives `value` or `uncheckedValue`.            | Paired `external-form`.                                       |
| P2 · Field and accessible relationships | Field supplies the native name, disabled and required state. The visible button registers its ID and merges explicit and Field descriptions. Explicit ARIA labels take precedence. | Paired `field` and SSR.                                       |
| P2 · Field validation                   | The active input supplies the native required constraint. A blocked submit focuses the switch and exposes the linked error. Server errors clear after a committed edit.            | Paired `field-required` and `field-errors`.                   |

The Angular controlled channel is `controlledChecked`; `checked` remains a writable form model.
The native submission token is a separate configuration input exposed as `value`.
See the [state ownership contract](../../../docs/engineering/state-ownership.md).

The browser-generated input appears after Angular renders the view. An authored input can appear
in the server HTML, and both variants are exposed by `nativeInput()` and `inputRef`.

## Reviewed differences

- Angular suppresses native `input` and `change` notifications when the callback vetoes an edit.
  The pinned Switch restores its state and still emits those notifications.
- Angular restores the committed baseline and emits one form entry after an accepted native reset.
  In the paired fixture Base UI resets the native input while its visible state stays off and its
  unchecked fallback stays in the form.
- Angular inherits `required` from Field in addition to supporting it on Switch. Base UI's pinned
  Switch declares the native constraint on its own Root.

Run [the paired suite](../../../apps/parity-testing/primitives/switch/README.md) with
`pnpm test-parity switch`. The [unit suite](__tests__) covers the Angular adapters and the
[SSR suite](../../../apps/radix-ssr-testing/src/ssr-rendering.spec.ts) covers server defaults and
authored input.
