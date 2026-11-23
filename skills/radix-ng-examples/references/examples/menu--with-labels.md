# Menu — With labels

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Group items visually and semantically with `rdxMenuGroup` and label them with `rdxMenuGroupLabel`.
The label automatically supplies the group's `aria-labelledby` relationship.
Disabled items remain in keyboard navigation, expose `data-disabled` / `aria-disabled`, and cannot be activated.

```html
<menu-with-labels-items-story />
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
