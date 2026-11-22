# Progress parity matrix

Reference: Base UI 1.9.0 at `cf696d6f6e08c699c5bda24d5a033430909f2285`.
[Manifest](../../../apps/parity-testing/reference.json),
[pinned Progress source](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/progress).

| Boundary                 | Contract                                                                                                                                                                                          | Evidence                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Readonly value           | Root derives state from the supplied value and current range. Zero is determinate. Null and non-finite values enter the indeterminate state.                                                      | Paired `range` and `non-finite` plus unit tests.                         |
| P2 · Numeric state       | Clamp finite values to the effective range. Share the result between ARIA, formatting and the indicator. Every part exposes the same status.                                                      | Paired `range` and `non-finite`. Angular range fallback units.           |
| P2 · Formatting and name | Use `locale` and `format` for the visible text. `getAriaValueText` receives the visible text and raw value. Authored ARIA takes precedence, and the label relationship follows the mounted Label. | Paired `format` and `label` plus unit tests.                             |
| P2 · Indicator           | HTML fill inherits height, sizes from the normalized percentage and starts at the inline start. Indeterminate sizing comes from CSS. SVG uses the percentage to update the stroke geometry.       | Paired `linear` and `svg` in Chromium, Firefox and WebKit.               |
| P2 · SSR and hydration   | Serialize the initial accessible name and value. Reuse Root, Label and the display parts, preserve IDs, then adopt the browser locale.                                                            | SSR spec and the `eager-progress` audit in Chromium, Firefox and WebKit. |

## Angular behavior

- Malformed bounds resolve to a finite ascending range. The maximum falls back to the normalized
  minimum plus 100 when that range can be represented. The default 0–100 range is the final fallback.
- Numeric data attributes remain available on the relevant parts. The SVG Indicator leaves width
  and positioning to its authored geometry. The pinned reference also applies linear inline styles
  to SVG Indicator hosts.
- `valueLabel` remains available for custom visible text and supplies the default ARIA text.
  Explicit `aria-valuetext` and `getAriaValueText` override the announcement in that order.

Run `pnpm test-parity progress` for the [paired suite](../../../apps/parity-testing/primitives/progress/README.md).
Run `node apps/radix-ssr-testing/hydration-audit/audit.mjs --case=eager-progress` for hydration.
