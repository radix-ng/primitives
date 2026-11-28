# OTP Field — parity matrix

Initial inventory: 2026-11-17. Reference pin: **Base UI 1.9.0**,
`cf696d6f6e08c699c5bda24d5a033430909f2285` ([reference manifest](../../../apps/parity-testing/reference.json)).

Primary counterpart: [otp-field](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/otp-field).
Pinned exported parts/functions: `Root`, `Input`, `Separator`.

The 2026-11-28 audit compares the source at this pin and records Angular diagnostics,
unit, browser and server-rendering evidence.

**Breaking changes are permitted; backward compatibility does not constrain the target.** Apply the
[state ownership/defaults contract](../../../docs/engineering/state-ownership.md) per field. Inputs,
models, outputs, defaults and part boundaries may change; do not retain compatibility mirrors or
aliases solely for the old API. Review earlier ADR decisions explicitly when replacing them.

## Public surface inventory

Source of truth: [entry barrel](index.ts). These are directly exported decorated classes, not a
claim that inherited/host-directive APIs or every upstream prop have already been compared. Exported
composition bases, guards and internal helpers are not thereby promoted to stable public widget parts.

| Angular declaration                                  | Selector / role             | Direct input/model/output declarations                                                                                                                                                                                                                                                                |
| ---------------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`RdxOtpFieldInput`](src/otp-field-input.ts)         | `input[rdxOtpFieldInput]`   | `type`, `aria-label`                                                                                                                                                                                                                                                                                  |
| [`RdxOtpFieldRoot`](src/otp-field-root.ts)           | `div[rdxOtpFieldRoot]`      | `id`, `length`, `validationType`, `normalizeValue`, `mask`, `autoComplete`, `autoSubmit`, `inputMode`, `dir`, `name`, `form`, `disabled`, `readOnly`, `required`, `defaultValue`, `controlledValue`, `value` (model), `onValueChange` (output), `onValueInvalid` (output), `onValueComplete` (output) |
| [`RdxOtpFieldSeparator`](src/otp-field-separator.ts) | `div[rdxOtpFieldSeparator]` | `orientation`                                                                                                                                                                                                                                                                                         |

Inherited classes and composed directives may add state/API. Follow those sources when completing
the comparison; similar part names or selector counts do not prove the same contract.

## State ownership and defaults

Ownership class for this entry: **Editable form value and auxiliary state**. The [shared contract](../../../docs/engineering/state-ownership.md)
distinguishes controlled UI requests, editable form models, readonly configuration, native DOM state
and derived/render state. Local writes to required form models are legitimate Angular behavior.
For strict controlled UI state, a request must not mutate the effective value before parent acceptance.

| State field / source                                       | Current declaration       | Ownership review                                                                                                             |
| ---------------------------------------------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| [`RdxOtpFieldRoot.value`](src/otp-field-root.ts)           | `model<string \| null>()` | Editable value for two-way binding and Signal Forms. A same-host CVA owns its own form value.                                |
| [`RdxOtpFieldRoot.controlledValue`](src/otp-field-root.ts) | `input<string>()`         | A defined value stays with the parent. `onValueChange` proposes an edit and matching acceptance drives focus and completion. |

| Declared default / source                               | Declaration                | Required comparison                                                                                                                                         |
| ------------------------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`RdxOtpFieldRoot.defaultValue`](src/otp-field-root.ts) | `input<string>(undefined)` | Initial supplied/falsy/empty/form priority, initial-only snapshot, late changes and reset baseline. Distinguish state defaults from reactive configuration. |

Value ownership tests should cover an empty string, initial parent and Angular Forms values,
late defaults, ignored and delayed controlled requests, cancellation and native/Angular Forms reset.

## Family-specific comparison matrix

“Source” identifies a local implementation fact. “Compare/verify/audit” is pending work. Priorities
describe the target work, not a certificate or a reproduced defect count.

| Area                           | Current observation / required target comparison                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Status   |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Value and focus slots          | `[controlledValue]` waits for the parent to apply the proposal. Focus, completion and auto-submit follow the matching accepted code, and replacement invalidates the proposal. The editable model serves `[(value)]` and Signal Forms.                                                                                                                                                                                                                                                                                                | Verified |
| Default/reset ownership        | The initial editable value or CVA wins over the one-time seed, including an empty code. Standalone reset restores the editable baseline. Reactive and template-driven controls keep their Angular reset value.                                                                                                                                                                                                                                                                                                                        | Verified |
| Native form name               | The hidden input serializes exactly once under the enclosing Field name, with the OTP Root name as fallback. External native form association is retained.                                                                                                                                                                                                                                                                                                                                                                            | Verified |
| Native entry and event details | A paste of `9` into the second slot of `1234` produces `1934`; Radix NG suppresses completion and Base UI treats it as a completing paste. Pasting `987654` at length four stores `9876`; the pinned normalizer reports the overflow through `onValueInvalid` and Radix NG has no invalid event for it. Partial autofill of `12` in Radix NG focuses slot three; the pinned hidden input queues focus on slot two. Compare event reasons, cancellation, masks, IME, Unicode code points and keyboard propagation in paired scenarios. | P2       |
| Native attributes and labeling | Root and Input expose the same named state attributes. The native contracts differ in label forwarding, disabled `aria-invalid`, per-slot `required`, `pattern` and `enterkeyhint`. Radix NG emits attempted text for `onValueInvalid`; Base UI also supplies the reason and native event. Verify the accessible name, description and validation target in Field composition before changing these contracts.                                                                                                                        | P2       |

## Evidence and next checks

- The [unit tests](__tests__/otp-field.spec.ts) cover initial ownership, late defaults, reset, the
  editable Angular form adapters, controlled focus and completion, and inherited native form
  names. Other coverage includes paste, composition, RTL and cancellation.
- The [browser spec](../../../apps/visual-regression/tests/otp-field.behavior.spec.ts) verifies the
  controlled paste and accepted submission in Chromium, Firefox and WebKit alongside typing and
  grouped slot navigation. It runs in the [affected browser catalog](../../../tools/playwright/test-catalog.ts).
- The [SSR rendering case](../../../apps/radix-ssr-testing/src/ssr-rendering.spec.ts) verifies the
  initial slot values and label markup. A hydration scenario should check native input ownership,
  preserved focus and initial FormData once the client mounts the native input.
- The [pinned Root tests](https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/otp-field/root/OTPFieldRoot.test.tsx)
  exercise delayed acceptance and stale completion. The remaining P2 rows need a paired browser
  suite that compares the native event and accessibility contracts.

See the [verification skill](../../../.agents/skills/radix-testing/SKILL.md),
[matrix index](../../../docs/engineering/parity-matrices.md) and
[upstream preparation guide](../../../docs/engineering/upstream-reference.md).
