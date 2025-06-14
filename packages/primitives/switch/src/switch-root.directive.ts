import { _IdGenerator } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    Directive,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    model,
    Signal
} from '@angular/core';
import { outputFromObservable, outputToObservable } from '@angular/core/rxjs-interop';
import { createContext, injectControlValueAccessor, RdxControlValueAccessor } from '@radix-ng/primitives/core';

export interface SwitchContext {
    required: InputSignalWithTransform<boolean, BooleanInput>;
    checked: Signal<boolean | undefined>;
    disabled: Signal<boolean | undefined>;
    ariaLabel: InputSignal<string | undefined>;
    ariaLabelledBy: InputSignal<string | undefined>;
    markAsTouched: () => void;
    toggle: () => void;
}

export const [injectSwitchRootContext, provideSwitchRootContext] = createContext<SwitchContext>('Switch');

const rootContext = () => {
    const instance = inject(RdxSwitchRootDirective);
    const cva = injectControlValueAccessor<boolean | undefined>();

    return {
        required: instance.required,
        value: instance.checked,
        checked: cva.value,
        disabled: cva.disabled,
        ariaLabel: instance.ariaLabel,
        ariaLabelledBy: instance.ariaLabelledBy,
        markAsTouched: () => cva.markAsTouched(),
        toggle: () => instance.toggle()
    };
};

/**
 * @group Components
 */
@Directive({
    selector: 'button[rdxSwitchRoot]',
    exportAs: 'rdxSwitchRoot',
    providers: [provideSwitchRootContext(rootContext)],
    hostDirectives: [
        {
            directive: RdxControlValueAccessor,
            inputs: ['value: checked', 'disabled']
        }
    ],
    host: {
        role: 'switch',
        type: 'button',
        '[id]': 'id()',
        '[attr.aria-checked]': 'cva.value()',
        '[attr.aria-required]': 'required()',
        '[attr.data-state]': 'cva.value() ? "checked" : "unchecked"',
        '[attr.data-disabled]': 'cva.disabled() ? "true" : undefined',
        '[attr.disabled]': 'cva.disabled() ? cva.disabled() : undefined',
        '[value]': 'cva.value()',

        '(click)': 'toggle()',
        '(keydown.enter)': '$event.preventDefault()'
    }
})
export class RdxSwitchRootDirective {
    protected readonly cva = injectControlValueAccessor<boolean | undefined>();

    readonly id = input<string>(inject(_IdGenerator).getId('rdx-switch-'));

    /**
     * When true, indicates that the user must check the switch before the owning form can be submitted.
     *
     * @default false
     * @group Props
     */
    readonly required = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute
    });

    /**
     * Establishes relationships between the component and label(s) where its value should be one or more element IDs.
     * @default null
     * @group Props
     */
    readonly ariaLabelledBy = input<string | undefined>(undefined, {
        alias: 'aria-labelledby'
    });

    /**
     * Used to define a string that autocomplete attribute the current element.
     * @default null
     * @group Props
     */
    readonly ariaLabel = input<string | undefined>(undefined, {
        alias: 'aria-label'
    });

    /**
     * The state of the switch when it is initially rendered. Use when you do not need to control its state.
     * @default false
     * @group Props
     */
    readonly defaultChecked = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * The controlled state of the switch. Must be used in conjunction with onCheckedChange.
     * @defaultValue false
     * @group Props
     */
    readonly checked = model<boolean>(this.defaultChecked());

    /**
     * When `true`, prevents the user from interacting with the switch.
     * @default false
     * @group Props
     */
    readonly disabled = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute
    });

    /**
     * Event handler called when the state of the switch changes.
     *
     * @param {boolean} value - Boolean value indicates that the option is changed.
     * @group Emits
     */
    readonly onCheckedChange = outputFromObservable(outputToObservable(this.cva.valueChange));

    /**
     * Toggles the checked state of the switch.
     * If the switch is disabled, the function returns early.
     * @ignore
     */
    toggle(): void {
        if (!this.disabled()) {
            this.checked.set(!this.checked());
            this.cva.setValue(this.checked());
        }
    }
}
