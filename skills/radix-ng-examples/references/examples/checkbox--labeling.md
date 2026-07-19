# Checkbox — Labeling

> One example from the [Checkbox](../components/checkbox.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

Always associate a checkbox with a label. Link a sibling `rdxLabel` to the button with `htmlFor` / `id`:

```html
<div rdxCheckboxRoot>
  <button id="terms" rdxCheckboxButton>
    <svg rdxCheckboxIndicator lucideCheck />
  </button>
  <input rdxCheckboxInput />
</div>
<label rdxLabel htmlFor="terms">Accept terms and conditions</label>
```

Inside a `rdxFieldRoot`, use `rdxFieldLabel` instead — it wires the association and the shared
invalid / disabled / required state automatically (see the form examples below).
