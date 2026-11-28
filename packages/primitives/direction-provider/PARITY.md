# Direction Provider — parity matrix

The reference is **Base UI 1.9.0** at
`cf696d6f6e08c699c5bda24d5a033430909f2285` ([reference manifest](../../../apps/parity-testing/reference.json)).
The pinned [direction-provider](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/direction-provider)
exports `Provider` and `useDirection`. The Angular [entry point](index.ts) provides a directive
and DI helpers for reading and configuring primitive direction.

## Direction contract

Direction is [read-only configuration](../../../docs/engineering/state-ownership.md). The
input values are `ltr`, `rtl` and `undefined` for inheritance. This utility contributes DI
configuration and has no state attributes, CSS variables or form behavior to compare.

| Area                                 | Radix NG contract                                                                                                                                                                                                                                                       | Evidence                                                                                                                                    |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| App and feature defaults             | The unconfigured root defaults to LTR. An application can set `provideRadixNG({ dir })` and a feature can configure `provideDirection()`.                                                                                                                               | Source comparison and [DI tests](__tests__/direction-provider.spec.ts)                                                                      |
| Provider input precedence            | `direction` takes precedence over `dir`, then the nearest DI provider. Clearing each override restores the next source.                                                                                                                                                 | [DI tests](__tests__/direction-provider.spec.ts)                                                                                            |
| Nested inheritance                   | Omission in a nested provider reactively inherits the parent direction. The pinned Base UI provider defaults an omitted direction to LTR. Radix NG records this intentional difference in [ADR 0088](../../../docs/adr/0088-inherit-primitive-direction-through-di.md). | [DI tests](__tests__/direction-provider.spec.ts) and [browser regression](../../../apps/visual-regression/tests/composite.behavior.spec.ts) |
| Portalled keyboard and native layout | A portalled Composite follows the direction of its declaring view. The actual DOM destination supplies its CSS direction.                                                                                                                                               | [Browser regression](../../../apps/visual-regression/tests/composite.behavior.spec.ts)                                                      |

## Browser and pinned-reference coverage

- The Composite regression switches the outer provider from RTL to LTR while the nested provider
  inherits. ArrowRight moves from the middle item to the first in RTL and to the last in LTR.
  The Composite remains a direct child of the LTR portal destination and its computed CSS
  direction stays LTR. [Browser spec](../../../apps/visual-regression/tests/composite.behavior.spec.ts)
- Tabs exercises explicit RTL provider direction through horizontal keyboard navigation and
  controlled selection. The `hydration-prepaint-rtl` case also checks server markup, node
  reuse and interaction after hydration. [Tabs keyboard fixture](../../../apps/parity-testing/primitives/tabs/src/keyboard.angular.ts)
  · [Tabs hydration spec](../../../apps/parity-testing/primitives/tabs/tests/tabs.hydration.spec.ts)
- Menu exercises the `dir` input alias through RTL logical placement of a portalled submenu
  and a vertical Menubar popup. [Menu placement fixture](../../../apps/parity-testing/primitives/menu/src/placement.angular.ts)
  · [Menu placement scenarios](../../../apps/parity-testing/primitives/menu/tests/placement.scenarios.ts)

The Tabs and Menu suites provide paired evidence against the pinned Base UI. The Composite
scenario verifies the Angular inheritance decision directly in Chromium, Firefox and WebKit.
