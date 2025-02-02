import { booleanAttribute, Directive, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { RdxCheckboxToken } from './checkbox.token';

export type CheckboxState = 'unchecked' | 'checked' | 'indeterminate';

/**
 * @group Components
 */
@Directive({
    selector: '[rdxCheckboxRoot]',
    standalone: true,
    providers: [
        { provide: RdxCheckboxToken, useExisting: RdxCheckboxDirective },
        { provide: NG_VALUE_ACCESSOR, useExisting: RdxCheckboxDirective, multi: true }
    ],
    host: {
        '[disabled]': 'disabled',
        '[attr.data-disabled]': 'disabled ? "" : null',
        '[attr.data-state]': 'state',

        '(keydown)': 'onKeyDown($event)',
        '(click)': 'onClick($event)',
        '(blur)': 'onBlur()'
    }
})
export class RdxCheckboxDirective implements ControlValueAccessor, OnChanges {
    /**
     * The controlled checked state of the checkbox. Must be used in conjunction with onCheckedChange.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) checked = false;

    /**
     * Defines whether the checkbox is indeterminate.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) indeterminate = false;

    /**
     * Defines whether the checkbox is disabled.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) disabled = false;

    /**
     * @group Props
     */
    @Input({ transform: booleanAttribute }) required = false;

    /**
     * Event emitted when the checkbox checked state changes.
     * @group Emits
     */
    @Output() readonly checkedChange = new EventEmitter<boolean>();

    /**
     * Event emitted when the indeterminate state changes.
     * @group Emits
     */
    @Output() readonly indeterminateChange = new EventEmitter<boolean>();

    /**
     * Determine the state
     */
    get state(): CheckboxState {
        if (this.indeterminate) {
            return 'indeterminate';
        }
        return this.checked ? 'checked' : 'unchecked';
    }

    /**
     * Store the callback function that should be called when the checkbox checked state changes.
     * @internal
     */
    private onChange?: (checked: boolean) => void;

    /**
     * Store the callback function that should be called when the checkbox is blurred.
     * @internal
     */
    private onTouched?: () => void;

    protected onKeyDown(event: KeyboardEvent): void {
        // According to WAI ARIA, Checkboxes don't activate on enter keypress
        if (event.key === 'Enter') {
            event.preventDefault();
        }
    }

    protected onClick($event: MouseEvent): void {
        if (this.disabled) {
            return;
        }

        this.checked = this.indeterminate ? true : !this.checked;
        this.checkedChange.emit(this.checked);
        this.onChange?.(this.checked);

        if (this.indeterminate) {
            this.indeterminate = false;
            this.indeterminateChange.emit(this.indeterminate);
        }

        $event.preventDefault();
    }

    protected onBlur(): void {
        this.onTouched?.();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['checked'] && !changes['checked'].isFirstChange()) {
            this.checkedChange.emit(this.checked);
        }
        if (changes['indeterminate'] && !changes['indeterminate'].isFirstChange()) {
            this.indeterminateChange.emit(this.indeterminate);
        }
    }

    /**
     * Sets the checked state of the checkbox.
     * @param checked The checked state of the checkbox.
     * @internal
     */
    writeValue(checked: boolean): void {
        this.checked = checked;
    }

    /**
     * Registers a callback function that should be called when the checkbox checked state changes.
     * @param fn The callback function.
     * @internal
     */
    registerOnChange(fn: (checked: boolean) => void): void {
        this.onChange = fn;
    }

    /**
     * Registers a callback function that should be called when the checkbox is blurred.
     * @param fn The callback function.
     * @internal
     */
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    /**
     * Sets the disabled state of the checkbox.
     * @param isDisabled The disabled state of the checkbox.
     * @internal
     */
    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
}
