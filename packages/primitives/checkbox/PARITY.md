# Checkbox — parity matrix

Reference: Base UI 1.9.0 at `cf696d6f6e08c699c5bda24d5a033430909f2285`.
[Manifest](../../../apps/parity-testing/reference.json),
[Checkbox source](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/checkbox),
[CheckboxGroup source](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/checkbox-group).

## Parts and state

| Base UI                | Angular                                                           | Contract                                                                                                                                                                                        |
| ---------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Checkbox.Root          | [Root](src/checkbox-root.ts) and [Button](src/checkbox-button.ts) | Root owns form and state wiring. Button renders the `checkbox` role, mixed state, native disabled state, and select-all relationships.                                                          |
| Root's native checkbox | [Input](src/checkbox-input.ts)                                    | The optional authored input owns browser validity and activation, with `nativeInput()` and `inputRef` on Root. A named Root can serialize through the browser bridge when the input is omitted. |
| Checkbox.Indicator     | [Indicator](src/checkbox-indicator.ts)                            | Shared enter and exit lifecycle. The directive hides its authored host after exit unless `keepMounted` is enabled.                                                                              |
| CheckboxGroup          | [Group](src/checkbox-group.ts)                                    | One array value, optional select-all cycle, and Angular Forms integration. The entry point contains both widget families.                                                                       |

Root and Button expose `data-checked`, `data-unchecked`, `data-indeterminate`, `data-disabled`,
`data-readonly` and `data-required`. Button also exposes `data-parent` for select-all.
Indicator shares the checkbox states and adds transient `data-starting-style` and `data-ending-style`.
The Angular form adapters additionally expose validity, dirty and touched state. Neither family
defines public CSS variables.

## Ownership and evidence

| Area                             | Implemented behavior                                                                                                                                                                                                                                                              | Evidence                                                                                                                                                                                                                         |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1 · Initial values              | A supplied model, controlled input or Angular Forms write takes precedence over defaults, including `false` and `[]`. Defaults resolve once. Requests stay silent during initialization. Angular model outputs follow the native model API.                                       | Paired cases `default`, `controlled`, `group-cycle` and `group-controlled`. CVA and Signal Forms precedence in units.                                                                                                            |
| P1 · Checked and group ownership | `checked` and `value` are editable Angular form models. A defined `controlledChecked` or `controlledValue` takes ownership of the effective value. Removing the controlled binding exposes the editable model.                                                                    | Paired repeat and delayed-acceptance scenarios.                                                                                                                                                                                  |
| P1 · Mixed and select-all        | `indeterminate` is a readonly input. The checked value still drives toggling and submission. Select-all derives state from the group and can restore the remembered partial selection. Disabled selections are preserved.                                                         | Paired `mixed`, `group-cycle` and `group-disabled-child`.                                                                                                                                                                        |
| P2 · Transactions                | Child or select-all emits the checked request first. Group receives the same details with reason `none`. Either handler can cancel the edit before a model write.                                                                                                                 | Paired child, parent and group vetoes, including retrying the parent cycle.                                                                                                                                                      |
| P2 · Native forms and keyboard   | Space activates the checkbox. Enter activates the owning form's default submitter and honors ancestor cancellation. Authored inputs support native validity and forward focus to the visible button. Model writes synchronize the native state without a new interaction request. | Paired `default`, `form`, `readonly`, `disabled` and `group-form`. Units cover external form ownership, Angular reset and `updateOn: 'blur'`.                                                                                    |
| P2 · Labels and lifetime         | Author-supplied IDs associate native labels and group relationships. Generated child IDs use Angular's hydration-aware allocator. Removing a child releases its ID. Indicator transition attributes clear when motion completes.                                                  | Paired `form`, `group-cycle` and `indicator`. SSR asserts precedence, native checked state and the serialized `aria-controls` relationship. The standalone SSR route reused the server button and its ID in Chromium and WebKit. |

## Angular contracts and remaining cases

- Angular adapters preserve CVA, template-driven and Signal Forms. Native reset restores the
  initial editable baseline or delegates to the owning Angular control. Angular form metadata,
  including blur-driven touched state, follows the selected form adapter.
- A named Angular group serializes its enabled selections under its own name. An unnamed group
  supports native names on individual children. Grouped children omit the standalone unchecked
  fallback entry.
- The Angular indicator remains authored in the DOM. The comparison asserts exit timing and
  settled attributes. Base UI removes its rendered indicator after exit with `keepMounted=false`.
- Further comparisons include Field/Field.Item label and description inheritance, Field focus and
  filled attributes, autofill, deferred group hydration and assistive-technology output.

Run `pnpm test-parity checkbox` for the [paired browser suite](../../../apps/parity-testing/primitives/checkbox/README.md).
The [units](__tests__) and [SSR assertions](../../../apps/radix-ssr-testing/src/ssr-rendering.spec.ts)
exercise Angular adapters and serialization.
