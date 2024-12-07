import { booleanAttribute, ContentChildren, Directive, EventEmitter, Input, Output, QueryList } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { RdxRadioItemDirective } from './radio-item.directive';
import { RadioGroupDirective, RadioGroupProps, RDX_RADIO_GROUP } from './radio-tokens';

@Directive({
    selector: '[rdxRadioRoot]',
    exportAs: 'rdxRadioRoot',
    standalone: true,
    providers: [
        { provide: RDX_RADIO_GROUP, useExisting: RdxRadioGroupDirective },
        { provide: NG_VALUE_ACCESSOR, useExisting: RdxRadioGroupDirective, multi: true }
    ],
    host: {
        role: 'radiogroup',
        '[attr.aria-orientation]': '_orientation',
        '[attr.data-disabled]': 'disabled ? "" : null',
        '[attr.tabindex]': '-1',
        '[attr.dir]': 'dir',
        '(keydown)': 'onKeydown()'
    }
})
export class RdxRadioGroupDirective implements RadioGroupProps, RadioGroupDirective, ControlValueAccessor {
    @ContentChildren(RdxRadioItemDirective, { descendants: true }) radioItems!: QueryList<RdxRadioItemDirective>;

    name?: string | undefined;
    @Input() value?: string;

    @Input({ transform: booleanAttribute }) disabled = false;

    @Input() dir?: string;

    @Input() defaultValue?: string;

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
     */
    private onChange: (value: string) => void = () => {
        /* Empty */
    };

    /**
     * The callback function to call when the radio group is touched.
     */
    onTouched: () => void = () => {
        /* Empty */
    };

    /**
     * Select a radio item.
     * @param value The value of the radio item to select.
     */
    select(value: string): void {
        this.value = value;
        this.onValueChange.emit(value);
        this.onChange?.(value);
        this.onTouched();
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

    protected onKeydown(): void {
        if (this.disabled) return;
    }
}
