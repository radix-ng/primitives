# Select — Base UI compatibility

> One example from the [Select](../components/select.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

The [versioned Select parity matrix](https://github.com/radix-ng/primitives/blob/main/packages/primitives/select/PARITY.md)
records the exact Base UI source commit, Angular adaptations, linked coverage and remaining gaps.
The pilot preserves the existing runtime defaults and equality behavior; it does not claim complete
behavioral parity. In particular, the initial value is still `undefined`, default object comparison is
structural, and Root's upstream `items` and `highlightItemOnHover` inputs are not implemented yet.
