# Checkbox — Labeling

> One example from the [Checkbox](../components/checkbox.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Associate a standalone checkbox with a native `<label>`. Set its `for` attribute to the checkbox button’s `id`.

```html
<div rdxCheckboxRoot>
  <button id="terms" rdxCheckboxButton>
    <svg *rdxCheckboxIndicatorPresence rdxCheckboxIndicator lucideCheck />
  </button>
</div>
<label for="terms">Accept terms and conditions</label>
```

Inside `rdxFieldRoot`, use `rdxFieldLabel` and `rdxFieldDescription`. The label associates with the
button's ID automatically. The checkbox inherits the Field's native name, disabled and required
state. Supply `aria-labelledby` or `aria-label` on the button to override its accessible name.

Inside `rdxFieldRoot`, a checkbox moved through `rdxPortal` contributes its checked value or
`uncheckedValue` to the declaring `rdxFormRoot`. Resetting that form restores the initial editable
state. An explicit `form` assigns native ownership, so the declaring form collects the value only
when it is the assigned owner.

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
