# Input parity matrix

Reference: Base UI 1.9.0 at `cf696d6f6e08c699c5bda24d5a033430909f2285`.
The pinned `Input` delegates to `Field.Control`.
[Manifest](../../../apps/parity-testing/reference.json),
[pinned Field.Control source](https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/field/control/FieldControl.tsx).

| Boundary                | Contract                                                                                                                                                                                                   | Evidence                                                                                            |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| P1 · Editable model     | `value` remains the editable model for Angular Forms and two-way binding. Initial Angular Forms values take precedence, including an empty string.                                                         | Reactive Forms, Signal Forms and SSR tests.                                                         |
| P1 · Parent ownership   | `controlledValue` holds the effective text, including an empty string. The parent can ignore, delay or replace a request. Field observes committed text.                                                   | Paired `controlled`.                                                                                |
| P1 · Default and reset  | Snapshot the standalone default once. An accepted reset restores the initial native baseline, or the current controlled value. Angular Forms retain their own reset APIs.                                  | Paired `default`, `late-default`, `reset` and Angular Forms units.                                  |
| P2 · Native edits       | Preserve canceled `beforeinput`, composition, replacement input and one notification from an input/change sequence. Read-only controls submit their text, and disabled controls are excluded.              | Paired `beforeinput`, `composition`, `replacement`, `locked`, and native Chromium IME and autofill. |
| P2 · Controlled editing | Reconcile the native edit after the parent binding updates. Accepted edits preserve the caret and native IME session. Rapid ordinary keystrokes resolve the previous request before editing again.         | Paired `controlled-caret` and native Chromium `controlled-ime`.                                     |
| P2 · Field and forms    | Field name takes precedence for submission to the native owner. Field exposes native constraint errors and associates their messages with the control. The paired case checks required and email validity. | Paired `field`, Field and Signal Forms units.                                                       |

## Reviewed differences

- Angular snapshots the initial default and retains that reset baseline. The pinned reference
  reflects late defaults into the native default value, which can also update a pristine field.
- Angular rolls back a canceled uncontrolled request. The pinned reference leaves the native
  text in place and skips validation. Both preserve a parent-owned value on refusal.

Run `pnpm test-parity input` for the [paired suite](../../../apps/parity-testing/primitives/input/README.md).
The SSR spec covers initial text and native label association with an authored ID. Generated ID
stability across requests and preservation during hydration remain follow-up checks.
