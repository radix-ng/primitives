# Input comparisons

Run `pnpm test-parity input` to compare Angular Input with the pinned Base UI Input in Chromium,
Firefox and WebKit. Cases exercise editable and controlled text, default and reset, canceled
`beforeinput` and change requests, composition and replacement sequences, readonly and disabled,
and native submission and validation through Field.

Chromium also runs native composition and autofill via DevTools Protocol. Autofill uses full
headless Chromium for its Autofill domain. The cross-engine composition and replacement cases
exercise the event sequences without an installed IME or saved profile.

See the [Input matrix](../../../../packages/primitives/input/PARITY.md) for exact scope and reviewed
differences.
