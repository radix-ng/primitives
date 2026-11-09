# Select — Base UI compatibility

> One example from the [Select](../components/select.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

The [versioned Select parity matrix](https://github.com/radix-ng/primitives/blob/main/packages/primitives/select/PARITY.md)
records the exact Base UI source commit, Angular adaptations, linked coverage and remaining gaps.
The Select contract now initializes an empty single selection to `null` and an empty multiple
selection to `[]`, compares values with `Object.is` by default, and exposes `items` and
`highlightItemOnHover`. The matrix tracks the remaining differences; this is not a claim of complete
behavioral parity.
