import { RdxFieldControl } from '../src/field-control';
import { RdxFieldDescription } from '../src/field-description';
import { RdxFieldError } from '../src/field-error';
import { RdxFieldLabel } from '../src/field-label';
import { RdxFieldRoot } from '../src/field-root';
import { fieldCustomTrigger, fieldDescription, fieldError, fieldLabel } from './field.shared';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'field-custom-control-example',
    imports: [RdxFieldRoot, RdxFieldLabel, RdxFieldControl, RdxFieldDescription, RdxFieldError],
    template: `
        <div class="flex w-80 flex-col gap-2" rdxFieldRoot [filled]="selected()" [focused]="open()">
            <label rdxFieldLabel [class]="labelClass">Plan</label>
            <button type="button" rdxFieldControl [class]="triggerClass" (click)="open.update((value) => !value)">
                {{ selected() ? 'Pro' : 'Choose a plan' }}
            </button>
            <p rdxFieldDescription [class]="descriptionClass">Custom controls can pass state into the field root.</p>
            <p rdxFieldError [class]="errorClass">Choose a plan.</p>
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
