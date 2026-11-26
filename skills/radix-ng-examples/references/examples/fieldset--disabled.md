# Fieldset — Disabled

> One example from the [Fieldset](../components/fieldset.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

Disabled state is applied to the native fieldset and exposed to the legend for styling.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxFieldsetLegend, RdxFieldsetRoot } from '@radix-ng/primitives/fieldset';
import { RdxInputDirective } from '@radix-ng/primitives/input';

@Component({
    host: { class: 'contents' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'rdx-fieldset-disabled-example',
    imports: [ReactiveFormsModule, RdxFieldLabel, RdxFieldRoot, RdxInputDirective, RdxFieldsetLegend, RdxFieldsetRoot],
    template: `
        <fieldset class="border-border w-80 space-y-4 border p-4" rdxFieldsetRoot disabled>
            <legend class="text-foreground px-1 text-sm font-semibold data-[disabled]:opacity-50" rdxFieldsetLegend>
                Billing address
            </legend>

            <div class="space-y-2" rdxFieldRoot disabled>
                <label class="text-foreground text-sm font-medium data-[disabled]:opacity-50" rdxFieldLabel>
                    Company
                </label>
                <input class="demo-input h-8 w-full px-2" rdxInput defaultValue="Acme Inc." />
            </div>
        </fieldset>
    `
})
export class FieldsetDisabledStory {}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
