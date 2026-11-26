# Separator parity matrix

Reference pin **Base UI 1.9.0** at `cf696d6f6e08c699c5bda24d5a033430909f2285`.
[Reference manifest](../../../apps/parity-testing/reference.json) ·
[Pinned Separator source](https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/separator/Separator.tsx)

[RdxSeparatorRootDirective](src/separator.directive.ts) applies to an authored host. The Base UI
`Separator` renders a `div` by default and accepts a custom host through `render`. Orientation is
[readonly configuration](../../../docs/engineering/state-ownership.md), with no form or interaction
state.

| Area                       | Contract                                                                                                                                                                                                                               | Evidence                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Defaults and accessibility | Omitted or undefined `orientation` resolves to `horizontal`. Both orientations expose `role="separator"`, `aria-orientation`, and `data-orientation`. A default separator is skipped in the Tab order.                                 | Paired scenarios and [Separator units](__tests__/separator.directive.spec.ts).   |
| Reactive orientation       | External updates change both orientation attributes. Clearing a vertical binding restores horizontal.                                                                                                                                  | Paired scenario.                                                                 |
| Native host                | An authored `hr` retains its tag and exposes both orientation attributes for an explicit vertical orientation.                                                                                                                         | Paired scenario and Separator units.                                             |
| Toolbar                    | Omitting `orientation` follows the opposite of the Toolbar Root reactively. An explicit orientation overrides the Root. Explicit `undefined` uses the standalone horizontal default, including when clearing a previously bound value. | Paired scenario and [Toolbar units](../toolbar/__tests__/toolbar.spec.ts).       |
| Stepper                    | Defaults to the Stepper Root orientation. Clearing an explicit binding restores the Stepper default. The reference pin has no public Stepper.                                                                                          | [Stepper units](../stepper/__tests__/stepper.spec.ts).                           |
| SSR                        | Angular renders the standalone separator role and both horizontal orientation attributes in the initial HTML.                                                                                                                          | [SSR rendering spec](../../../apps/radix-ssr-testing/src/ssr-rendering.spec.ts). |

The [paired suite](../../../apps/parity-testing/primitives/separator/README.md) exercises four
scenarios in Chromium, Firefox, and WebKit. Run `pnpm test-parity separator`. The SSR check covers
server serialization. Hydration and screen-reader output are outside this evidence.
