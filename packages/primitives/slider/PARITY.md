# Slider — parity matrix

Reference pin **Base UI 1.9.0**, `cf696d6f6e08c699c5bda24d5a033430909f2285`.
See the [reference manifest](../../../apps/parity-testing/reference.json) and
[pinned Slider implementation](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/slider).

## Anatomy

| Pinned part | Angular selector                                                  |
| ----------- | ----------------------------------------------------------------- |
| Root        | `div[rdxSliderRoot]`                                              |
| Label       | `div[rdxSliderLabel]`                                             |
| Value       | `output[rdxSliderValue]`                                          |
| Control     | `div[rdxSliderControl]`                                           |
| Track       | `div[rdxSliderTrack]`                                             |
| Thumb       | `div[rdxSliderThumb]`, with authored `input[rdxSliderThumbInput]` |
| Indicator   | `div[rdxSliderIndicator]`                                         |

The [entry point](index.ts) exports the directives. The [component docs](stories/slider.docs.mdx)
describe the public inputs, events, data attributes and accessible names. Angular authors the
native input explicitly and accepts per-thumb accessible names on that input.

## Completed increments

| Priority | Area                          | Behavior and evidence                                                                                                                                                                                                                                                                                                                                                                                                                           |
| -------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1       | Value ownership               | `controlledValue` owns strict parent-controlled state. The change request and final proposal reach the parent even if it leaves its value in place. The editable `value` model drives `[(value)]`, Reactive Forms, template-driven forms and Signal Forms. Native edits reconcile the input and form submission on cancellation. Paired controlled, canceled and native edit cases exercise these paths in all three engines.                   |
| P1       | Defaults, bounds and reset    | The initial `defaultValue` or initial `min` supplies the uncontrolled seed. Zero, null and empty arrays have explicit behavior. Live bounds constrain the rendered value. Accepted native reset restores the initial uncontrolled value and respects the Angular form control's reset baseline. Paired browser tests cover late defaults, live bounds and external form resets. Units cover nullable and empty values and the Angular adapters. |
| P2       | Interaction, focus and layout | Paired scenarios cover push, swap, none, range focus order, keyboard steps, RTL, vertical orientation, touch, disabling mid-drag, native input changes, and label focus. The two inset alignments have paired browser geometry checks. The Angular SSR and hydration checks verify initial values, stable label and input IDs, node reuse and measured geometry.                                                                                |

## Angular contracts and reference differences

- Angular allows `controlledValue` to be added or cleared during a component instance. When cleared,
  the editable model or initial fallback resumes. The pinned hook fixes controlled mode at mount.
  Angular Forms can supply `null`, which displays the live minimum, or an empty array, which supplies
  no thumb values. Base UI does not type its value as nullable.
- Angular resets the standalone range to its initial values on an accepted external form reset.
  The pinned fixture keeps the edited values. Angular also preserves an authored off-grid value
  in the native input and `FormData`. The pinned native range rounds it to the configured step.
- Angular clears the active drag and its styling marker on disable. Both implementations stop
  applying movement. See the paired [difference records](../../../apps/parity-testing/primitives/slider/expected-differences.json).
- Angular publishes `data-filled` on Slider parts for an enclosing Field with a value. The pin does
  not mark a Field containing only a Slider as filled.
- When a Control is replaced and resized while the Thumb stays mounted, Angular recomputes the
  inset geometry against the new Control. The pin retains the old position percentages in this
  fixture.
- The pin exposes disabled behavior and does not provide a Slider read-only mode. Angular uses
  disabled behavior as well. Real assistive technology, physical devices and per-part callback
  coverage remain open.

## Field composition and SSR geometry

- Slider registers its native input as the Field's focus target, inherits the Field name and
  Fieldset disabled state, and links its native thumbs to Field descriptions and visible errors.
  Paired cases cover focus between thumbs, blur validation, submission, and disabling the Fieldset.
  Angular unit tests also cover Reactive Forms `updateOn: 'blur'` and focusing the first enabled
  thumb on invalid submit.
- Root, Label, Control, Track, Thumb, Indicator and Value reflect the same Field hooks. Paired
  checks cover neutral validity, focus, touched and dirty state, revealed errors, return to valid
  state, and inherited disabled state.
- `edge` positions the thumbs and indicator before Angular's client bundle runs. It uses the same
  CSP-aware serialization helper as Tabs. `edge-client-only` waits for client measurement.
  The hydration audit checks horizontal, vertical and RTL range geometry with the Angular bundle
  blocked, then checks server node reuse, keyboard edits and native reset.
- A browser scenario replaces the Control while retaining the native range input and resizes the
  replacement. Angular keeps the thumb edge flush and the indicator aligned to its center.

## Verification

- [Paired browser suite](../../../apps/parity-testing/primitives/slider/README.md)
- [Unit tests](__tests__/slider.spec.ts)
- [SSR assertions](../../../apps/radix-ssr-testing/src/ssr-rendering.spec.ts)
- [Angular hydration regression](../../../apps/radix-ssr-testing/hydration-audit/README.md)
