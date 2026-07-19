# Menu — Custom return focus (`finalFocus`)

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

When the menu closes, focus returns to the trigger by default. Bind `finalFocus` on `rdxMenuPopup` to
send it elsewhere instead — an element to focus, `false` to suppress return-focus, or a callback
receiving the close interaction type. This maps to the floating focus manager's `returnFocus` policy.

```html
<div [finalFocus]="afterElement" rdxMenuPopup>…</div>
```
