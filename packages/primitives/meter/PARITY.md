# Meter parity matrix

Reference: Base UI 1.9.0 at `cf696d6f6e08c699c5bda24d5a033430909f2285`.
[Manifest](../../../apps/parity-testing/reference.json),
[pinned Meter source](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/meter).

| Boundary                 | Contract                                                                                                                                                                                                | Evidence                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Readonly measurement     | Required `value` and the current bounds derive the meter state on each update.                                                                                                                          | Paired `range` and `linear`.                                  |
| P2 · Numeric state       | Clamp to the effective range. NaN starts at the minimum, infinities clamp to endpoints, and equal bounds stay equal. ARIA, display formatting and the fill use the same range.                          | Paired `range` and `non-finite`; Angular unit tests.          |
| P2 · Formatting and name | The localized text supplies the default ARIA value. Both formatting callbacks receive the formatted text and raw supplied value. Authored ARIA takes precedence. The relationship follows the Label ID. | Paired `format` and `label`; Angular unit and axe tests.      |
| P2 · Indicator           | HTML fill inherits height, sizes from the percentage and starts at the inline start. SVG circles can use the same percentage for their stroke geometry.                                                 | Paired `linear` and `svg` in Chromium, Firefox and WebKit.    |
| P2 · SSR and hydration   | Serialize the accessible name, value and sizing. Reuse Root and parts, keep IDs, then adopt the browser locale when locale was omitted.                                                                 | SSR render spec and `eager-meter` audit in all three engines. |

## Angular behavior

- Invalid minima become 0. Reversed or non-finite maxima fall back to the effective minimum plus
  100 whenever representable. The default 0–100 range is the final fallback. Ranges spanning
  opposite finite extremes still produce finite percentages.
- Root, Track, Indicator and Value expose numeric data attributes. SVG Indicator hosts keep their
  authored geometry. Base UI also applies linear inline styles to SVG hosts.
- Value is hidden from the accessibility tree. `getValueText` adapts the reference's value render
  callback for Angular text content. Accessible value text comes from the Root.
- Base UI includes a hidden presentation span as an NVDA announcement workaround. Radix NG uses the
  Label relationship and the presentation role. NVDA announcement behavior still needs manual evidence.

Run `pnpm test-parity meter` for the [paired suite](../../../apps/parity-testing/primitives/meter/README.md).
Run `node apps/radix-ssr-testing/hydration-audit/audit.mjs --case=eager-meter` for hydration.
