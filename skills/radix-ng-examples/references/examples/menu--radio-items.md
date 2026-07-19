# Menu — Radio items

> One example from the [Menu](../components/menu.md) docs — imports, anatomy, and the data-attribute styling contract live there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

A radio group selects exactly one option. Selecting an item keeps the menu open (`closeOnClick`
defaults to `false` for radio items). Bind `[(value)]` for controlled state or use `defaultValue` for
uncontrolled state. Values may be strings, numbers, objects, or other types and are compared by identity.
Set `disabled` on the group to disable all of its radio items. A nested `rdxMenuGroupLabel`
automatically labels the group through `aria-labelledby`.

```html
<menu-radio-items-story />
```
