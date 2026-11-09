# Select — Migrating existing Select consumers

> One example from the [Select](../components/select.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

- A named empty single Select now contributes `name=""` to `FormData`, matching the persistent native
  input contract. Previously an empty value contributed no entry. Multiple empty selections still
  contribute no entries. Disabled controls are excluded.

- Root's `id` now identifies the trigger and is forwarded there. For a separate DOM id on a Root
  wrapper, use `[attr.id]` with a different value or put that wrapper outside Root.

- Empty uncontrolled values now start as `null` (single) or `[]` (multiple), replacing `undefined`.
  Angular bindings may still write `undefined`; use nullish checks for an empty single value.
- Unparameterized TypeScript Root/Item references now use `unknown` instead of `AcceptableValue`.
  Supply `RdxSelectRoot<MyValue, false/true>` / `RdxSelectItem<MyValue>` or narrow before reading values.
- A single-mode array is now one item for labels, selection and submission. Set `[multiple]="true"`
  when the array represents a collection of selected values.
- Selection now uses `Object.is` instead of structural equality. Keep object references stable or
  supply `[isItemEqualToValue]="'id'"` / an explicit comparator. To retain the previous deep comparison,
  import `isEqual` from `@radix-ng/primitives/core` and pass it as the comparator.
- Display labels no longer depend on mounted `rdxSelectItemText` nodes. Provide `items` or
  `itemToStringLabel` when item text differs from the raw value. Object `label` / `value` properties
  remain fallback labels.
