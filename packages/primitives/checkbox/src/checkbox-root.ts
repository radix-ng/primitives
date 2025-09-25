import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, inject, input } from '@angular/core';
import { outputFromObservable, outputToObservable } from '@angular/core/rxjs-interop';
import { createContext, RdxControlValueAccessor } from '@radix-ng/primitives/core';

export type CheckedState = boolean | 'indeterminate';

const rootContext = () => {
    const checkbox = inject(RdxCheckboxRootDirective);
    const controlValueAccessor = inject<RdxControlValueAccessor<CheckedState>>(RdxControlValueAccessor);

    return {
        checked: controlValueAccessor.value,
        disabled: controlValueAccessor.disabled,
        required: checkbox.required,
        value: checkbox.value,
        name: checkbox.name,
        form: checkbox.form,
        state: computed(() => {
            const checked = controlValueAccessor.value();

            if (checked === 'indeterminate') {
                return checked;
            }

            return checked ? 'checked' : 'unchecked';
        }),
        toggle() {
            checkbox.toggle();
        }
    };
};

export type CheckboxRootContext = ReturnType<typeof rootContext>;

export const [injectCheckboxRootContext, provideCheckboxRootContext] =
    createContext<CheckboxRootContext>('CheckboxRootContext');

/**
 * @group Components
 */
@Directive({
    selector: '[rdxCheckboxRoot]',
    providers: [provideCheckboxRootContext(rootContext)],
    hostDirectives: [
        {
            directive: RdxControlValueAccessor,
            inputs: ['value:checked', 'disabled']
        }
    ]
})
export class RdxCheckboxRootDirective {
    private readonly controlValueAccessor = inject(RdxControlValueAccessor);

    /**
     * The controlled checked state of the checkbox. Must be used in conjunction with onCheckedChange.
     * @group Props
     */
    readonly checked = input<CheckedState, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * The value of the checkbox. This is what is submitted with the form when the checkbox is checked.
     * @group Props
     */
    readonly value = input<string>('on');

    /**
     * Whether or not the checkbox button is disabled. This prevents the user from interacting with it.
     * @group Props
     */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Whether or not the checkbox is required.
     * @group Props
     */
    readonly required = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Name of the form control. Submitted with the form as part of a name/value pair.
     * @group Props
     */
    readonly name = input<string>();

    /**
     * Associates the control with a form element.
     * @group Props
     */
    readonly form = input<string>();

    /**
     * Event emitted when the checkbox checked state changes.
     * @group Emits
     */
    readonly onCheckedChange = outputFromObservable(outputToObservable(this.controlValueAccessor.valueChange));

    toggle() {
        const checked = this.controlValueAccessor.value();

        if (checked === 'indeterminate') {
            this.controlValueAccessor.setValue(true);
        }

        this.controlValueAccessor.setValue(!checked);
    }
}
