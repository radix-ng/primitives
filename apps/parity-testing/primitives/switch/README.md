# Switch comparisons

Run `pnpm test-parity switch` from the repository root. Playwright runs the same fixtures in
Chromium, Firefox and WebKit against Angular and the pinned Base UI 1.9.0 source. The React fixture
uses `nativeButton` to match the Angular host.

The suite checks the initial and late defaults, parent-owned changes, callback cancellation, native
label and keyboard activation, modifier keys, disabled and read-only state, the generated and
authored native checkbox, external form association, `required` and reset. The form assertions read
real `FormData` and native events. The activation fixtures also verify that the technical checkbox
is hidden from the accessibility tree.

The Field cases cover native label activation, an explicit name and label reference, the combined
accessible description, and shared Root and Thumb state. They exercise focus cleanup on disable
or unmount, blocked required submission, and server errors through canceled and held requests.

See the [Switch matrix](../../../../packages/primitives/switch/PARITY.md) for Angular-specific
behavior and [expected differences](expected-differences.json).
