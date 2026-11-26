# Switch — Field

> One example from the [Switch](../components/switch.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

Import `RdxFieldRoot`, `RdxFieldLabel`, `RdxFieldDescription`, and `RdxFieldError` from
`@radix-ng/primitives/field` and `RdxFormRoot` from `@radix-ng/primitives/form`. Switch registers
its button with Field and inherits its form name, disabled state and required state.

```html
<form rdxFormRoot>
    <div rdxFieldRoot name="alerts" required validationMode="onSubmit">
        <label rdxFieldLabel>Email alerts</label>
        <p rdxFieldDescription>Send account updates by email.</p>
        <button rdxSwitchRoot>
            <span rdxSwitchThumb></span>
        </button>
        <p rdxFieldError match="valueMissing">Enable email alerts to continue.</p>
    </div>
    <button type="submit">Save</button>
</form>
```

The button uses the Field label as its accessible name. Set `[aria-label]` to supply a name directly
or `[aria-labelledby]` to point to a label by ID. `[aria-describedby]` adds descriptions to those
registered by Field. A blocked submit focuses the switch and links the visible error to it.

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
