import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, inject, input, model } from '@angular/core';
import { outputFromObservable, outputToObservable } from '@angular/core/rxjs-interop';
import { createContext, RdxControlValueAccessor } from '@radix-ng/primitives/core';

export type CheckedState = boolean | 'indeterminate';

export function isIndeterminate(checked?: CheckedState): checked is 'indeterminate' {
    return checked === 'indeterminate';
}

export function getState(checked: CheckedState) {
    return isIndeterminate(checked) ? 'indeterminate' : checked ? 'checked' : 'unchecked';
}

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
        readonly: checkbox.readonly,
        state: checkbox.state,
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
    ],
    host: {
        '[attr.data-state]': 'state()'
    }
})
export class RdxCheckboxRootDirective {
    private readonly controlValueAccessor = inject(RdxControlValueAccessor);

    /**
     * The controlled checked state of the checkbox. Must be used in conjunction with onCheckedChange.
     * @group Props
     */
    readonly checked = model<CheckedState>(false);

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
     * Whether the user should be unable to tick or untick the checkbox.
     * @group Props
     */
    readonly readonly = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

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

    readonly state = computed(() => {
        const checked = this.controlValueAccessor.value();

        if (checked === 'indeterminate') {
            return checked;
        }

        return checked ? 'checked' : 'unchecked';
    });

    toggle() {
        const checked = this.controlValueAccessor.value();

        if (checked === 'indeterminate') {
            this.controlValueAccessor.setValue(true);
        }

        this.controlValueAccessor.setValue(!checked);
    }
}
