# Fieldset — Disabled

> One example from the [Fieldset](../components/fieldset.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

Disabled state is applied to the native fieldset and exposed to the legend for styling.

```html
<fieldset class="border-border w-80 space-y-4 rounded-md border p-4" rdxFieldsetRoot disabled>
    <legend class="text-foreground px-1 text-sm font-semibold data-[disabled]:opacity-50" rdxFieldsetLegend>
        Billing address
    </legend>

    <div class="space-y-2" rdxFieldRoot disabled>
        <label class="text-foreground text-sm font-medium data-[disabled]:opacity-50" rdxFieldLabel>
            Company
        </label>
        <input [class]="inputClass" rdxInput defaultValue="Acme Inc." />
    </div>
</fieldset>
```
