import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    computed,
    Directive,
    EventEmitter,
    inject,
    InjectionToken,
    input,
    InputSignalWithTransform,
    model,
    ModelSignal,
    Output
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export const RdxSwitchToken = new InjectionToken<RdxSwitchRootDirective>('RdxSwitchToken');

export function injectSwitch(): RdxSwitchRootDirective {
    return inject(RdxSwitchToken);
}

export interface SwitchProps {
    checked?: ModelSignal<boolean>;
    defaultChecked?: boolean;
    required?: InputSignalWithTransform<boolean, BooleanInput>;
    onCheckedChange?: EventEmitter<boolean>;
}

let idIterator = 0;

@Directive({
    selector: 'button[rdxSwitchRoot]',
    exportAs: 'rdxSwitchRoot',
    standalone: true,
    providers: [
        { provide: RdxSwitchToken, useExisting: RdxSwitchRootDirective },
        { provide: NG_VALUE_ACCESSOR, useExisting: RdxSwitchRootDirective, multi: true }
    ],
    host: {
        role: 'switch',
        type: 'button',
        '[id]': 'elementId()',
        '[attr.aria-checked]': 'checked()',
        '[attr.aria-required]': 'required',
        '[attr.data-state]': 'checked() ? "checked" : "unchecked"',
        '[attr.data-disabled]': 'disabledState() ? "true" : null',
        '[attr.disabled]': 'disabledState() ? disabledState() : null',

        '(focus)': '_onTouched?.()',
        '(click)': 'toggle()'
    }
})
export class RdxSwitchRootDirective implements SwitchProps, ControlValueAccessor {
    readonly id = input<string>(`rdx-switch-${idIterator++}`);
    protected readonly elementId = computed(() => (this.id() ? this.id() : null));

    // When true, indicates that the user must check
    // the switch before the owning form can be submitted.
    readonly required = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute
    });

    // The controlled state of the switch
    readonly checked = model<boolean>(false);

    // When true, prevents the user from interacting with the switch.
    readonly disabled = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute
    });

    /*
     * @ignore
     */
    readonly disabledState = computed(() => this.disabled());

    @Output() onCheckedChange = new EventEmitter<boolean>();

    /**
     * The method to be called in order to update ngModel.
     */
    _onChange?: (checked: boolean) => void;

    /**
     * onTouch function registered via registerOnTouch (ControlValueAccessor).
     */
    _onTouched?: () => void;

    /**
     * Registers a function to call when the checked state changes.
     * @param fn Function to call on change.
     */
    registerOnChange(fn: (checked: boolean) => void): void {
        this._onChange = fn;
    }

    /**
     * Registers a function to call when the component is touched.
     * @param fn Function to call on touch.
     */
    registerOnTouched(fn: () => void): void {
        this._onTouched = fn;
    }

    /**
     * Writes a new value to the model.
     * @param checked The new checked value.
     */
    writeValue(checked: boolean): void {
        this.checked.set(checked);
    }

    /**
     * Toggles the checked state of the switch.
     * If the switch is disabled, the function returns early.
     */
    protected toggle(): void {
        if (this.disabledState()) {
            return;
        }

        this.checked.set(!this.checked());
        this._onChange?.(this.checked());

        this.onCheckedChange.emit(this.checked());
    }
}
