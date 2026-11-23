# Fieldset — Default

> One example from the [Fieldset](../components/fieldset.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

A fieldset groups related Field and Input primitives under one native legend.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RdxFieldDescription, RdxFieldError, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxFieldsetLegend, RdxFieldsetRoot } from '@radix-ng/primitives/fieldset';
import { RdxInputDirective } from '@radix-ng/primitives/input';

@Component({
    host: { class: 'contents' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'rdx-fieldset-default-example',
    imports: [
        ReactiveFormsModule,
        RdxFieldDescription,
        RdxFieldError,
        RdxFieldLabel,
        RdxFieldRoot,
        RdxInputDirective,
        RdxFieldsetLegend,
        RdxFieldsetRoot
    ],
    template: `
        <fieldset class="w-64 max-w-full space-y-4" rdxFieldsetRoot>
            <legend class="border-foreground text-foreground w-full border-b text-base font-bold" rdxFieldsetLegend>
                Shipping address
            </legend>

            <div class="flex flex-col items-start gap-1" rdxFieldRoot required>
                <label class="text-foreground text-sm font-bold" rdxFieldLabel>Street address</label>
                <input class="demo-input h-8 w-full px-2" rdxInput autocomplete="shipping street-address" />
                <p class="text-muted-foreground text-sm" rdxFieldDescription>Used to calculate delivery options.</p>
                <p class="text-destructive text-sm" rdxFieldError>Street address is required.</p>
            </div>

            <div class="flex flex-col items-start gap-1" rdxFieldRoot>
                <label class="text-foreground text-sm font-bold" rdxFieldLabel>Apartment</label>
                <input class="demo-input h-8 w-full px-2" rdxInput autocomplete="shipping address-line2" />
            </div>
        </fieldset>
    `
})
export class FieldsetDefaultStory {}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
