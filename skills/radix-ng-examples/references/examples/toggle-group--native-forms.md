# Toggle Group — Native forms

> One example from the [Toggle Group](../components/toggle-group.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

Set `name` to serialize pressed item values. Multiple values become repeated entries under the same
name; `form` can associate the group with an external form. This is an Angular-native extension of
the Base UI API because Toggle Group is already a CVA/Signal Forms value control in Radix NG.

```html
<div rdxToggleGroup multiple name="format">
  <button rdxToggle value="bold">Bold</button>
  <button rdxToggle value="italic">Italic</button>
</div>
```
