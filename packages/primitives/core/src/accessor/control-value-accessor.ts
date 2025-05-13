import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, inject, input, linkedSignal, output, untracked } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { provideValueAccessor } from './provide-value-accessor';

/**
 * A reusable ControlValueAccessor implementation for form controls
 * @template T The type of the control's value
 */
@Directive({
    exportAs: 'rdxControlValueAccessor',
    providers: [provideValueAccessor(RdxControlValueAccessor)]
})
export class RdxControlValueAccessor<T> implements ControlValueAccessor {
    /**
     * Input for the control's value with alias 'value'
     * @default undefined
     */
    readonly valueInput = input<T>(undefined, { alias: 'value' });

    /**
     * Input for the disabled state with alias 'disabled'
     * Uses booleanAttribute transform to convert string attributes to booleans
     * @default false
     */
    readonly disabledInput = input<boolean, BooleanInput>(false, {
        alias: 'disabled',
        transform: booleanAttribute
    });

    readonly valueChange = output<T>();

    private readonly _value = linkedSignal(() => this.valueInput());

    /**
     * Readonly access to the current value
     */
    readonly value = this._value.asReadonly();

    private readonly _disabled = linkedSignal(() => this.disabledInput());

    /**
     * Readonly access to the disabled state
     */
    readonly disabled = this._disabled.asReadonly();

    // Callbacks for ControlValueAccessor
    private onChange?: (value: T | undefined) => void;
    private onTouched?: () => void;

    /**
     * Writes a new value to the control (ControlValueAccessor interface)
     * @param value The new value for the control
     */
    writeValue(value: T | undefined): void {
        untracked(() => this._value.set(value as T));
    }

    /**
     * Registers a callback for when the control value changes (ControlValueAccessor interface)
     * @param fn The callback function
     */
    registerOnChange(fn: (value: T | undefined) => void): void {
        this.onChange = fn;
    }

    /**
     * Registers a callback for when the control is touched (ControlValueAccessor interface)
     * @param fn The callback function
     */
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    /**
     * Sets the disabled state of the control (ControlValueAccessor interface)
     * @param isDisabled Whether the control should be disabled
     */
    setDisabledState(isDisabled: boolean): void {
        this._disabled.set(isDisabled);
    }

    /**
     * Updates the control's value and triggers change detection
     * @param value The new value
     */
    setValue(value: T) {
        this._value.set(value);
        this.valueChange.emit(value);
        this.onChange?.(value);
    }

    markAsTouched() {
        this.onTouched?.();
    }
}

/**
 * Provides a type-safe way to inject the RdxControlValueAccessor
 * @template T The type of the control's value
 * @returns An instance of RdxControlValueAccessor<T>
 */
export function injectControlValueAccessor<T>(): RdxControlValueAccessor<T> {
    return inject(RdxControlValueAccessor);
}
