# Fieldset — Default

> One example from the [Fieldset](../components/fieldset.md) docs — imports, anatomy, and the data-attribute styling contract live there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

A fieldset groups related Field and Input primitives under one native legend.

```html
<fieldset class="border-border w-80 space-y-4 rounded-md border p-4" rdxFieldsetRoot>
    <legend class="text-foreground px-1 text-sm font-semibold" rdxFieldsetLegend>Shipping address</legend>

    <div class="space-y-2" rdxFieldRoot required>
        <label class="text-foreground text-sm font-medium" rdxFieldLabel>Street address</label>
        <input [class]="inputClass" rdxInput autocomplete="shipping street-address" />
        <p class="text-muted-foreground text-sm" rdxFieldDescription>Used to calculate delivery options.</p>
        <p class="text-destructive text-sm" rdxFieldError>Street address is required.</p>
    </div>

    <div class="space-y-2" rdxFieldRoot>
        <label class="text-foreground text-sm font-medium" rdxFieldLabel>Apartment</label>
        <input [class]="inputClass" rdxInput autocomplete="shipping address-line2" />
    </div>
</fieldset>
```
