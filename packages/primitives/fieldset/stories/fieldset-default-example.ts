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
        <fieldset class="border-border w-80 space-y-4 rounded-md border p-4" rdxFieldsetRoot>
            <legend class="text-foreground px-1 text-sm font-semibold" rdxFieldsetLegend>Shipping address</legend>

            <div class="space-y-2" rdxFieldRoot required>
                <label class="text-foreground text-sm font-medium" rdxFieldLabel>Street address</label>
                <input class="demo-input h-9 w-full px-3" rdxInput autocomplete="shipping street-address" />
                <p class="text-muted-foreground text-sm" rdxFieldDescription>Used to calculate delivery options.</p>
                <p class="text-destructive text-sm" rdxFieldError>Street address is required.</p>
            </div>

            <div class="space-y-2" rdxFieldRoot>
                <label class="text-foreground text-sm font-medium" rdxFieldLabel>Apartment</label>
                <input class="demo-input h-9 w-full px-3" rdxInput autocomplete="shipping address-line2" />
            </div>
        </fieldset>
    `
})
export class FieldsetDefaultStory {}
