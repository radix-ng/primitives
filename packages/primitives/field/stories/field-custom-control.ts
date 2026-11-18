import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
    RdxFieldControl,
    RdxFieldDescription,
    RdxFieldError,
    RdxFieldLabel,
    RdxFieldRoot
} from '@radix-ng/primitives/field';

import { fieldCustomTrigger, fieldDescription, fieldError, fieldLabel } from './field.shared';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'field-custom-control-example',
    imports: [RdxFieldRoot, RdxFieldLabel, RdxFieldControl, RdxFieldDescription, RdxFieldError],
    template: `
        <div class="flex w-80 flex-col gap-2" [filled]="selected()" [focused]="open()" rdxFieldRoot>
            <label [class]="labelClass" rdxFieldLabel>Plan</label>
            <button [class]="triggerClass" (click)="open.update((value) => !value)" type="button" rdxFieldControl>
                {{ selected() ? 'Pro' : 'Choose a plan' }}
            </button>
            <p [class]="descriptionClass" rdxFieldDescription>Custom controls can pass state into the field root.</p>
            <p [class]="errorClass" rdxFieldError>Choose a plan.</p>
        </div>
    `
})
export class FieldCustomControlExample {
    readonly open = signal(false);
    readonly selected = computed(() => this.open());

    protected readonly triggerClass = fieldCustomTrigger;
    protected readonly labelClass = fieldLabel;
    protected readonly descriptionClass = fieldDescription;
    protected readonly errorClass = fieldError;
}
