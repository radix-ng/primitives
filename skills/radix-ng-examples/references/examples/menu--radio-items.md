# Menu — Radio items

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

A radio group selects exactly one option. Selecting an item keeps the menu open (`closeOnClick`
defaults to `false` for radio items). Bind `[(value)]` for controlled state or use `defaultValue` for
uncontrolled state. Values may be strings, numbers, objects, or other types and are compared by identity.
Set `disabled` on the group to disable all of its radio items. A nested `rdxMenuGroupLabel`
automatically labels the group through `aria-labelledby`.

`defaultValue` is an initial fallback only when `value` is `undefined`. Explicit values, including
`null`, `false` and `0`, take precedence. Later default changes are ignored even when the group
started without a default; they do not replace a user's selection. Use `[(value)]` for asynchronous
or live application values. Both models retain Angular's normal writable and two-way binding behavior.

```html
<menu-radio-items-story />
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
