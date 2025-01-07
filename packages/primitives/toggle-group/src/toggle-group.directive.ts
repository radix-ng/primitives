import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, model, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { RdxRovingFocusGroupDirective } from '@radix-ng/primitives/roving-focus';
import { RdxToggleGroupToken } from './toggle-group.token';

let nextId = 0;

@Directive({
    selector: '[rdxToggleGroup]',
    exportAs: 'rdxToggleGroup',
    standalone: true,
    providers: [
        { provide: RdxToggleGroupToken, useExisting: RdxToggleGroupDirective },
        { provide: NG_VALUE_ACCESSOR, useExisting: RdxToggleGroupDirective, multi: true }
    ],
    hostDirectives: [{ directive: RdxRovingFocusGroupDirective, inputs: ['dir', 'orientation', 'loop'] }],
    host: {
        role: 'group',

        '(focusout)': 'onTouched?.()'
    }
})
export class RdxToggleGroupDirective implements ControlValueAccessor {
    readonly id: string = `rdx-toggle-group-${nextId++}`;

    readonly value = model<string | string[] | undefined>(undefined);

    readonly type = input<'single' | 'multiple'>('single');

    /**
     * Whether the toggle group is disabled.
     * @default false
     */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Event emitted when the selected toggle button changes.
     */
    readonly onValueChange = output<string[] | string | undefined>();

    /**
     * The value change callback.
     */
    private onChange?: (value: string | string[] | undefined) => void;

    /**
     * onTouch function registered via registerOnTouch (ControlValueAccessor).
     */
    protected onTouched?: () => void;

    /**
     * Toggle a value.
     * @param value The value to toggle.
     * @ignore
     */
    toggle(value: string): void {
        if (this.disabled()) {
            return;
        }

        if (this.type() === 'single') {
            this.value.set(value);
        } else {
            this.value.set(
                ((currentValue) =>
                    currentValue && Array.isArray(currentValue)
                        ? currentValue.includes(value)
                            ? currentValue.filter((v) => v !== value) // delete
                            : [...currentValue, value] // update
                        : [value])(this.value())
            );
        }

        this.onValueChange.emit(this.value());
        this.onChange?.(this.value());
    }

    /**
     * Select a value from Angular forms.
     * @param value The value to select.
     * @ignore
     */
    writeValue(value: string): void {
        this.value.set(value);
    }

    /**
     * Register a callback to be called when the value changes.
     * @param fn The callback to register.
     * @ignore
     */
    registerOnChange(fn: (value: string | string[] | undefined) => void): void {
        this.onChange = fn;
    }

    /**
     * Register a callback to be called when the toggle group is touched.
     * @param fn The callback to register.
     * @ignore
     */
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    private readonly accessorDisabled = signal(false);
    /**
     * Set the disabled state of the toggle group.
     * @param isDisabled Whether the toggle group is disabled.
     * @ignore
     */
    setDisabledState(isDisabled: boolean): void {
        this.accessorDisabled.set(isDisabled);
    }
}
