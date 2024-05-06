import {
    booleanAttribute,
    Directive,
    EventEmitter,
    inject,
    InjectionToken,
    Input,
    Output
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export const RdxSwitchToken = new InjectionToken<RdxSwitchRootDirective>('RdxSwitchToken');

export function injectSwitch(): RdxSwitchRootDirective {
    return inject(RdxSwitchToken);
}

export interface SwitchProps {
    checked?: boolean;
    defaultChecked?: boolean;
    required?: boolean;
    onCheckedChange?: EventEmitter<boolean>;
}

@Directive({
    // TODO: added Forms input
    selector: 'button[SwitchRoot]',
    exportAs: 'SwitchRoot',
    standalone: true,
    providers: [
        { provide: RdxSwitchToken, useExisting: RdxSwitchRootDirective },
        { provide: NG_VALUE_ACCESSOR, useExisting: RdxSwitchRootDirective, multi: true }
    ],
    host: {
        role: 'switch',

        '[attr.aria-checked]': 'checked',
        '[attr.aria-required]': 'required',
        '[attr.data-state]': 'checked ? "checked" : "unchecked"',
        '[attr.data-disabled]': 'disabled ? "true" : null',
        '[attr.disabled]': 'disabled ? disabled : null',

        '(focus)': '_onTouched?.()',
        '(click)': '_toggle()'
    }
})
export class RdxSwitchRootDirective implements SwitchProps, ControlValueAccessor {
    @Input({ transform: booleanAttribute }) required = false;

    @Input({ transform: booleanAttribute }) checked = false;

    @Input({ transform: booleanAttribute }) disabled = false;

    @Output() readonly onCheckedChange = new EventEmitter<boolean>();

    /**
     * The method to be called in order to update ngModel.
     */
    _onChange?: (checked: boolean) => void;

    /**
     * onTouch function registered via registerOnTouch (ControlValueAccessor).
     */
    _onTouched?: () => void;

    registerOnChange(fn: (checked: boolean) => void): void {
        this._onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this._onTouched = fn;
    }

    writeValue(checked: boolean): void {
        this.checked = checked;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    _toggle(): void {
        if (this.disabled) {
            return;
        }

        this.checked = !this.checked;
        this._onChange?.(this.checked);
    }
}
