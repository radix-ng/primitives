import { Directive, booleanAttribute, inject, input, linkedSignal, output, untracked } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { provideValueAccessor } from '@radix-ng/primitives/core';

@Directive({
    exportAs: 'rdxControlValueAccessor',
    providers: [
        provideValueAccessor(RdxControlValueAccessor)]
})
export class RdxControlValueAccessor<T> implements ControlValueAccessor {
    readonly valueInput = input<T>(undefined, { alias: 'value' });

    readonly disabledInput = input(false, {
        alias: 'disabled',
        transform: booleanAttribute
    });

    readonly valueChange = output<T>();

    private readonly _value = linkedSignal(() => this.valueInput());
    readonly value = this._value.asReadonly();

    private readonly _disabled = linkedSignal(() => this.disabledInput());
    readonly disabled = this._disabled.asReadonly();

    private onChange?: (value: T | undefined) => void;
    private onTouched?: () => void;

    writeValue(value: T | undefined): void {
        untracked(() => this._value.set(value as T));
    }

    registerOnChange(fn: (value: T | undefined) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this._disabled.set(isDisabled);
    }

    setValue(value: T) {
        this._value.set(value);
        this.valueChange.emit(value);
        this.onChange?.(value);
    }

    markAsTouched() {
        this.onTouched?.();
    }
}

export function injectControlValueAccessor<T>(): RdxControlValueAccessor<T> {
    return inject(RdxControlValueAccessor);
}
