# Framework adaptation during parity work

preserve the observable Base UI contract while using
Angular's `model`, outputs, DI, reactive queries/collections and view lifecycle. Derive state with
`computed` when it follows existing signals. A React ref, store, controlled-prop mirror or forced
render requires an independent Angular need; its presence upstream is not a reason to port it.
Keep browser requirements separate from framework workarounds (ADR 0025/0026).
