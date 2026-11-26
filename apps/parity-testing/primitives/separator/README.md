# Separator comparisons

Run `pnpm test-parity separator` to compare Angular with pinned Base UI in Chromium, Firefox, and
WebKit. The suite checks the default role and Tab order, live orientation updates, an authored
`hr`, and how Toolbar separators resolve omitted, explicit, and undefined orientation inputs.

The [Separator matrix](../../../../packages/primitives/separator/PARITY.md) also records Angular's
server-rendering evidence and the Stepper composition contract.
