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

// eslint-disable-next-line @nx/enforce-module-boundaries
import { RdxRovingFocusGroupDirective } from '@radix-ng/primitives/roving-focus';

export const RdxRadioGroupToken = new InjectionToken<RdxRadioGroupDirective>('RdxRadioGroupToken');

export function injectRadioGroup(): RdxRadioGroupDirective {
    return inject(RdxRadioGroupToken);
}

interface RadioGroupProps {
    name?: string;
    disabled?: boolean;
    // TODO: dir?: string;
    // TODO: loop?: string;
    defaultValue?: string;
    value?: string;
    onValueChange?: EventEmitter<string>;
}

@Directive({
    selector: 'div[RadioRoot]',
    exportAs: 'RadioRoot',
    standalone: true,
    providers: [
        { provide: RdxRadioGroupToken, useExisting: RdxRadioGroupDirective },
        { provide: NG_VALUE_ACCESSOR, useExisting: RdxRadioGroupDirective, multi: true }
    ],
    hostDirectives: [RdxRovingFocusGroupDirective],
    host: {
        role: 'radiogroup',
        '[attr.aria-orientation]': '_orientation',
        '[attr.data-disabled]': 'disabled ? "" : null',
        '[attr.dir]': 'dir',

        '(focusout)': '_onFocusout()'
    }
})
export class RdxRadioGroupDirective implements RadioGroupProps, ControlValueAccessor {
    @Input() value?: string;

    @Input({ transform: booleanAttribute }) disabled = false;

    @Input() dir?: string;

    /**
     * The orientation of the radio group only vertical.
     * Horizontal radio buttons can sometimes be challenging to scan and localize.
     * The horizontal arrangement of radio buttons may also lead to difficulties in determining which
     * label corresponds to which button: whether the label is above or below the button.
     * @default 'vertical'
     */
    readonly _orientation = 'vertical';

    /**
     * Event handler called when the value changes.
     */
    @Output() readonly onValueChange = new EventEmitter<string>();

    /**
     * The callback function to call when the value of the radio group changes.
     * @internal
     */
    private onChange?: (value: string) => void;

    /**
     * The callback function to call when the radio group is touched.
     * @internal
     */
    private onTouched?: () => void;

    /**
     * Select a radio item.
     * @param value The value of the radio item to select.
     */
    select(value: string): void {
        this.value = value;
        this.onValueChange.emit(value);
        this.onChange?.(value);
    }

    /**
     * Update the value of the radio group.
     * @param value The new value of the radio group.
     * @internal
     */
    writeValue(value: string): void {
        this.value = value;
    }

    /**
     * Register a callback function to call when the value of the radio group changes.
     * @param fn The callback function to call when the value of the radio group changes.
     * @internal
     */
    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    /**
     * Set the disabled state of the radio group.
     * @param isDisabled Whether the radio group is disabled.
     * @internal
     */
    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    /**
     * When focus leaves the radio group.
     */
    _onFocusout(): void {
        this.onTouched?.();
    }
}
