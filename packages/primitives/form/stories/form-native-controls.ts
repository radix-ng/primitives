import { RdxFormRoot, RdxFormSubmitEvent } from '../index';
import { formField, formInput, formLabel, formSubmit } from './form.shared';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxFieldControl, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';

/**
 * No `@angular/forms` at all — just native controls. On a valid submit the Form serializes the form's
 * `FormData` into a plain values object (repeated `name`s collapse into arrays).
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'form-native-controls-example',
    imports: [RdxFormRoot, RdxFieldRoot, RdxFieldLabel, RdxFieldControl],
    template: `
        <form class="flex w-80 flex-col gap-4" rdxFormRoot (onFormSubmit)="onSubmit($event)">
            <div name="name" rdxFieldRoot [class]="field">
                <label rdxFieldLabel [class]="label">Name</label>
                <input name="name" rdxFieldControl value="Ada" [class]="input" />
            </div>
            <div name="role" rdxFieldRoot [class]="field">
                <label rdxFieldLabel [class]="label">Role</label>
                <input name="role" rdxFieldControl value="Engineer" [class]="input" />
            </div>

            <button type="submit" [class]="submit">Submit</button>
            @if (values()) {
                <pre class="bg-muted text-foreground rounded-md p-3 text-xs">{{ values() }}</pre>
            }
        </form>
    `
})
export class FormNativeControlsExample {
    protected readonly field = formField;
    protected readonly label = formLabel;
    protected readonly input = formInput;
    protected readonly submit = formSubmit;

    readonly values = signal<string | null>(null);

    onSubmit(event: RdxFormSubmitEvent): void {
        this.values.set(JSON.stringify(event.values, null, 2));
    }
}
