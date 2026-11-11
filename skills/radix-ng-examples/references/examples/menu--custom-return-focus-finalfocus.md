# Menu — Custom return focus (`finalFocus`)

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

When the menu closes, focus returns to the trigger by default. Bind `finalFocus` on `rdxMenuPopup` to
send it elsewhere instead — an element to focus, `false` to suppress return-focus, or a callback
receiving the close interaction type. This maps to the floating focus manager's `returnFocus` policy.

Removing the entire Root with `@if` destroys its portals and releases background interaction and
scroll locking, including retained views and unfinished exits. Removal emits no additional close
request or completion for an unfinished exit. If the trigger is also removed, use `finalFocus` to
return to a surviving control outside that conditional block.

```html
<div [finalFocus]="afterElement" rdxMenuPopup>…</div>
```
