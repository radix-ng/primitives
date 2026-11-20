# Checkbox and CheckboxGroup comparisons

Run `pnpm test-parity checkbox` from the repository root. The same actions run in Chromium, Firefox
and WebKit against Angular and the pinned Base UI 1.9.0 source. The React fixture renders
`Checkbox.Root` as a native button to exercise the host used by the Angular Button directive.

The suite covers initial defaults, explicit false and empty selection, late defaults, a parent
holding and later accepting requests, mixed presentation and checked submission, readonly and
disabled inputs, label and Space activation, Enter submission and cancellation, required validity,
and indicator exit. Group cases cover callback order and vetoes, the select-all cycle, preservation
of disabled selections, rendered control IDs, and submission by individually named children.

The fixtures record checked and mixed state, ARIA, native submission and change requests.
Additional Angular and browser input contracts are recorded in the
[Checkbox matrix](../../../../packages/primitives/checkbox/PARITY.md).
