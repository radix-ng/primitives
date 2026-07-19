# Signal Forms — Pending async validation

> One example from the [Signal Forms](../components/signal-forms.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

Signal Forms exposes `pending()` directly. Radix NG does not invent a `data-pending` attribute that Base
UI does not publish; it uses pending internally only to preserve tri-state validity. While validation is
pending, Field and control publish neither `data-valid` nor `data-invalid`.

```html
@if (accountForm.email().pending()) {
  <p role="status">Checking email…</p>
}
```
