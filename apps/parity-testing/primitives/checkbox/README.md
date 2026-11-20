# Checkbox and CheckboxGroup comparisons

Run `pnpm test-parity checkbox` from the repository root. The same actions run in Chromium, Firefox
and WebKit against Angular and the pinned Base UI 1.9.0 source. The React fixture renders
`Checkbox.Root` as a native button to exercise the host used by the Angular Button directive.

The suite covers initial defaults, explicit false and empty selection, late defaults, a parent
holding and later accepting requests, mixed presentation and checked submission, readonly and
disabled inputs, label and Space activation, Enter submission and cancellation, required validity,
and indicator exit. Group cases cover callback order and vetoes, the select-all cycle, preservation
of disabled selections, rendered control IDs, and submission by individually named children.
The Field cases exercise group and item label ownership, description inheritance, shared focus and
filled state, and serialization under the Field name. The required scenarios verify the linked Field
error, focus on blocked submit, and successful submission. Selecting an optional checkbox leaves a
required sibling invalid.

The fixtures record checked and mixed state, ARIA, native submission and change requests.
Additional Angular and browser input contracts are recorded in the
[Checkbox matrix](../../../../packages/primitives/checkbox/PARITY.md).

## Browser history and accessibility

The history scenarios edit the checkbox, return with the browser Back action and reload. They
record whether the browser reused the document and compare the visible state, native input,
`FormData`, and notifications. Fresh documents follow the initial application state and retained
documents keep their live selection. The default suite recreated the document in all three engines.
A separate Chromium run with BFCache enabled used a real navigation from `127.0.0.1` to
`localhost` and back. Both fixtures received a persisted `pageshow` and retained the checked value,
native input, submission entry and original change count.

Chromium previously restored the old native checkedness
after Back while Angular displayed the initial value. The input reconciles checkedness after
`pageshow`, after the browser has had a chance to restore form state.
[HTML persisted history entry state](https://html.spec.whatwg.org/multipage/browsing-the-web.html#persisted-history-entry-state)

ARIA snapshots and accessible descriptions cover mixed state, disabled controls, group and item
labels, and the required error. Chromium also records the browser's AX tree. The assertions check
that the technical input yields no extra exposed checkbox and that the visible controls carry
the expected names, checked states, relationship targets, focus and error description.
Screen-reader speech and screen-reader activation require a separate platform run.
[Chromium Accessibility protocol](https://chromedevtools.github.io/devtools-protocol/tot/Accessibility/#method-getFullAXTree)
