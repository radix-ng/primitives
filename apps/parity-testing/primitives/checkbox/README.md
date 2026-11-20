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

## Portal and Indicator

The `group-portal` case compares registration with the declaring Form, repeated values,
native form association, disabled items and focus on an invalid portaled checkbox. The
`group-portal-reset` case checks cancellation and the Angular reset baseline. The pinned Base UI
group retains its selection after the accepted reset because the native inputs are outside the form.
The comparison records that difference.

The structural Indicator cases check initial absence, interrupted exit, removal after real
CSS animation completes, and retention with `keepMounted`.

## Screen reader checks

Build and serve the fixtures locally.

```sh
pnpm parity:build checkbox
PARITY_PRIMITIVE=checkbox pnpm exec vite preview --config apps/parity-testing/vite.config.mts
```

Use `/angular.html` and `/react.html` under the preview URL at port 4518. Run the same actions with
VoiceOver and Safari or NVDA and Firefox. For VoiceOver, navigate with VO-Right Arrow and activate
with VO-Space. For NVDA, move focus to the checkbox and use Space. Record spoken output with NVDA's
Speech Viewer when available. [VoiceOver keyboard commands](https://support.apple.com/guide/voiceover/vo2681/mac),
[NVDA Speech Viewer](https://download.nvaccess.org/releases/2025.3.3/documentation/userGuide.html#SpeechViewer)

| Query                | Action                                                        | Observe                                                                                                                                        |
| -------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `?case=mixed`        | Focus Terms and activate it once with the screen reader.      | One checkbox named Terms with a mixed state. The fixture holds the mixed presentation while its checked value changes.                         |
| `?case=group-portal` | Navigate to Features and its three checkboxes. Activate All.  | Group and item names are available. All changes from mixed to checked and both options become checked.                                         |
| `?case=group-portal` | Uncheck Alpha and activate Submit on the declaring form.      | Focus lands on Alpha and its accessible description includes Choose Alpha. The other checked option leaves Alpha's required constraint active. |
| `?case=disabled`     | Navigate through the visible controls and attempt activation. | Terms is exposed as disabled and the screen-reader action leaves it unchecked.                                                                 |

Record browser, operating system, screen-reader version, inputs used, and what was spoken.
Playwright ARIA snapshots and the Chromium AX tree are available as automated evidence for the
same fixtures. A platform run is pending.
