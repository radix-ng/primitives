# Toggle Group — Two-way binding

> One example from the [Toggle Group](../components/toggle-group.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Bind `[(value)]` to read and write the pressed values.
An initial `value` or Angular Forms write takes precedence over `defaultValue`, including an empty
array. Later defaults leave the selection and reset baseline intact.

```html
<toggle-group />
```
