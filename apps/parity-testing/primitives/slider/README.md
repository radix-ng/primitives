# Slider comparisons

Run `pnpm test-parity slider` against pinned Base UI in Chromium, Firefox and WebKit.
The fixtures check an initial controlled zero, ignored requests, delayed and replacement writes,
commit proposals on release, late defaults, a live minimum, canceled keyboard and track edits,
and native input and form submission.

The browser scenarios also cover focus on the named single-thumb input, separate accessible
names and Tab traversal for a range, thumb collisions with `push`, `swap` and `none`, keyboard
navigation in RTL and vertical layouts, fractional steps, a touch tap, disabling during a drag,
and start/end geometry for both inset alignments.

The [exact difference records](expected-differences.json) capture the external form reset
baseline, off-grid form value and drag marker after disable. Angular restores an uncontrolled
range to its initial values, submits authored off-grid values, and clears the drag marker on
disable. The reference fixture keeps the edited values after native reset, rounds off-grid
values in the native input, and retains its drag marker after disable.

The [Slider matrix](../../../../packages/primitives/slider/PARITY.md) links the Angular Forms,
SSR and hydration evidence.
