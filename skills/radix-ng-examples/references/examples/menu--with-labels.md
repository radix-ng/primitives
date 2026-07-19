# Menu — With labels

> One example from the [Menu](../components/menu.md) docs — imports, anatomy, and the data-attribute styling contract live there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

Group items visually and semantically with `rdxMenuGroup` and label them with `rdxMenuGroupLabel`.
The label automatically supplies the group's `aria-labelledby` relationship.
Disabled items remain in keyboard navigation, expose `data-disabled` / `aria-disabled`, and cannot be activated.

```html
<menu-with-labels-items-story />
```
