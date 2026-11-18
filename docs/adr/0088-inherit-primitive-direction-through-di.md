# ADR 0088: Inherit primitive direction through Angular DI

- Status: Accepted
- Date: 2026-11-18
- Decision owners: Radix NG maintainers
- Related: ADR 0085, `packages/primitives/direction-provider`, `packages/primitives/portal`

## Context

Base UI 1.9.0 defaults each `DirectionProvider` to LTR when its direction is omitted. A
nested Radix NG provider can instead inherit an app or feature direction through Angular DI.
Portal relocation changes an element's physical ancestors while preserving its declaring view.

## Decision

Keep inheritance as an intentional Angular difference. An explicit `direction` or `dir` input
sets the subtree behavior. When both are omitted, follow the nearest DI provider reactively.
The app fallback is LTR when no direction is configured. Feature wrappers can therefore
introduce a provider without resetting their host application's RTL behavior. An explicit
`direction="ltr"` sets that boundary when needed.

Portalled consumers keep the behavior of their declaring view. Native layout direction is
authored independently through DOM `dir` or CSS and follows the content's physical location.
The provider never writes a DOM direction attribute. Use `[attr.dir]` to bind the native
attribute separately. A literal `dir` on the provider host also initializes its input alias.

## Verification

The [Direction Provider regression](../../packages/primitives/direction-provider/__tests__/direction-provider.spec.ts)
checks nested inheritance, explicit LTR, reactive updates and ArrowRight in a Composite moved
into a native LTR container. The
[pinned provider](https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/direction-provider/DirectionProvider.tsx)
supplies the LTR comparison.
