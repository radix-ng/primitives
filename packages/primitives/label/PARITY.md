# Label parity matrix

Native HTML `<label>` is the reference for standalone association and activation. Base UI 1.9.0
`Field.Label` is the related reference for labels associated through a Field context.
[Reference manifest](../../../apps/parity-testing/reference.json),
[pinned Field.Label source](https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/field/label/FieldLabel.tsx).

| Boundary                  | Contract                                                                                                                                                                       | Evidence                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| P2 · Explicit association | Preserve authored `for`, including an empty attribute. A defined `htmlFor` overrides it. Clearing the input restores the authored attribute when present.                      | Label units and `eager-label`.                 |
| P2 · Native activation    | Support explicit and wrapping associations, accessible names and forwarding one click. Disabled controls stay inactive, and nested buttons and links retain their own actions. | `eager-label` in Chromium, Firefox and WebKit. |
| P2 · Live association     | Replacing the label and control with the same IDs preserves the association. Changing `htmlFor` moves the accessible name and activation to the new target.                    | `eager-label` and Label units.                 |
| P2 · SSR and hydration    | Serialize generated and authored label IDs and explicit associations. Hydration reuses the label and control nodes, preserving the IDs, association and focus.                 | SSR rendering spec and `eager-label`.          |
| State ownership           | `id` and `htmlFor` are readonly configuration. The associated control owns form state.                                                                                         | Directive source.                              |

The [Label units](__tests__/label-root.directive.spec.ts) also cover the double-click selection guard
for label text and nested controls. Run the standalone browser regression with
`node apps/radix-ssr-testing/hydration-audit/audit.mjs --case=eager-label`.
See the [hydration audit](../../../apps/radix-ssr-testing/hydration-audit/README.md).
