import { _IdGenerator } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    Directive,
    inject,
    input,
    InputSignalWithTransform,
    model,
    ModelSignal
} from '@angular/core';
import { outputFromObservable, outputToObservable } from '@angular/core/rxjs-interop';
import { createContext, injectControlValueAccessor, RdxControlValueAccessor } from '@radix-ng/primitives/core';

export interface SwitchContext {
    checked: ModelSignal<boolean>;
    disabled: InputSignalWithTransform<boolean, BooleanInput>;
    toggle: () => void;
}

export const [injectSwitchRootContext, provideSwitchRootContext] = createContext<SwitchContext>('Switch');

@Directive({
    selector: 'button[rdxSwitchRoot]',
    exportAs: 'rdxSwitchRoot',
    providers: [
        provideSwitchRootContext(() => {
            const instance = inject(RdxSwitchRootDirective);
            return {
                checked: instance.checked,
                disabled: instance.disabled,
                toggle: () => instance.toggle()
            };
        })

    ],
    hostDirectives: [
        { directive: RdxControlValueAccessor, inputs: ['value: checked', 'disabled'] }],
    host: {
        type: 'button',
        '[id]': 'id()',
        '[attr.aria-checked]': 'cva.value()',
        '[attr.aria-required]': 'required()',
        '[attr.data-state]': 'cva.value() ? "checked" : "unchecked"',
        '[attr.data-disabled]': 'cva.disabled() ? "true" : null',
        '[attr.disabled]': 'cva.disabled() ? cva.disabled() : null',

        '(click)': 'toggle()'
    }
})
export class RdxSwitchRootDirective {
    protected readonly cva = injectControlValueAccessor();

    readonly id = input<string>(inject(_IdGenerator).getId('rdx-switch'));

    readonly inputId = input<string | null>(null);

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
        const checked = this.cva.value();

        this.cva.setValue(!checked);
    }
}
