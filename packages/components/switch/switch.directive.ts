import {
    Directive,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    Output,
    booleanAttribute,
    inject
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SwitchToken } from './switch.token';

@Directive({
    selector: '[kbqSwitch]',
    standalone: true,
    providers: [
        { provide: SwitchToken, useExisting: SwitchDirective },
        { provide: NG_VALUE_ACCESSOR, useExisting: SwitchDirective, multi: true }
    ],
    host: {
        role: 'switch',
        '[attr.type]': 'isButton ? "button" : null',
        '[attr.aria-checked]': 'checked',
        '[attr.data-state]': 'checked ? "checked" : "unchecked"',
        '[attr.data-disabled]': 'disabled ? "true" : null',
        '[attr.disabled]': 'isButton && disabled ? disabled : null',
        '(focus)': 'onTouched?.()'
    }
})
export class SwitchDirective implements ControlValueAccessor {
    /**
     * Access the element ref.
     */
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    /**
     * Determine if the switch is a button
     */
    protected isButton = this.elementRef.nativeElement.tagName === 'BUTTON';

    /**
     * Determine if the switch is checked.
     * @default false
     */
    @Input({ transform: booleanAttribute }) checked = false;

    /**
     * Determine if the switch is disabled.
     * @default false
     */
    @Input({ transform: booleanAttribute }) disabled = false;

    /**
     * Event emitted when the checked state changes.
     */
    @Output() readonly checkedChange = new EventEmitter<boolean>();

    /**
     * Store the onChange callback.
     */
    private onChange?: (checked: boolean) => void;

    /**
     * Store the onTouched callback.
     */
    protected onTouched?: () => void;

    /**
     * Register the onChange callback.
     * @param fn The onChange callback.
     * @internal
     */
    registerOnChange(fn: (checked: boolean) => void): void {
        this.onChange = fn;
    }

    /**
     * Register the onTouched callback.
     * @param fn The onTouched callback.
     * @internal
     */
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    /**
     * Write the value to the checked state.
     * @param checked The checked state.
     * @internal
     */
    writeValue(checked: boolean): void {
        this.checked = checked;
    }

    /**
     * Set the disabled state.
     * @param isDisabled The disabled state.
     * @internal
     */
    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    /**
     * Toggle the checked state.
     */
    @HostListener('click')
    toggle(): void {
        if (this.disabled) {
            return;
        }

        this.checked = !this.checked;
        this.checkedChange.emit(this.checked);
        this.onChange?.(this.checked);
    }

    /**
     * Handle the keydown event.
     */
    @HostListener('keydown.space')
    protected onKeyDown(): void {
        // If the switch is not a button then the space key will not toggle the checked state automatically,
        // so we need to do it manually.
        if (!this.isButton) {
            this.toggle();
        }
    }
}
