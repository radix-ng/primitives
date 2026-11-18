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
        <fieldset class="border-border w-80 space-y-4 rounded-md border p-4" rdxFieldsetRoot disabled>
            <legend class="text-foreground px-1 text-sm font-semibold data-[disabled]:opacity-50" rdxFieldsetLegend>
                Billing address
            </legend>

            <div class="space-y-2" rdxFieldRoot disabled>
                <label class="text-foreground text-sm font-medium data-[disabled]:opacity-50" rdxFieldLabel>
                    Company
                </label>
                <input class="demo-input h-9 w-full px-3" rdxInput defaultValue="Acme Inc." />
            </div>
        </fieldset>
    `
})
export class FieldsetDisabledStory {}
