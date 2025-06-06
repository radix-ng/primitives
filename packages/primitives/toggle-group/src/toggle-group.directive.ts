import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, model, output, signal } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import {
    AcceptableValue,
    isEqual,
    isValueEqualOrExist,
    provideToken,
    provideValueAccessor
} from '@radix-ng/primitives/core';
import { RdxRovingFocusGroupDirective } from '@radix-ng/primitives/roving-focus';
import { RdxToggleGroupToken } from './toggle-group.token';

let nextId = 0;

/**
 * @group Components
 */
@Directive({
    selector: '[rdxToggleGroup]',
    exportAs: 'rdxToggleGroup',
    providers: [
        provideToken(RdxToggleGroupToken, RdxToggleGroupDirective),
        provideValueAccessor(RdxToggleGroupDirective)
    ],
    hostDirectives: [{ directive: RdxRovingFocusGroupDirective, inputs: ['dir', 'orientation', 'loop'] }],
    host: {
        role: 'group',

        '(focusout)': 'onTouched?.()'
    }
})
export class RdxToggleGroupDirective implements ControlValueAccessor {
    /**
     * @ignore
     */
    readonly id: string = `rdx-toggle-group-${nextId++}`;

    /**
     * @group Props
     */
    readonly value = model<AcceptableValue | AcceptableValue[] | undefined>(undefined);

    /**
     * @group Props
     */
    readonly type = input<'single' | 'multiple'>('single');

    /**
     * Whether the toggle group is disabled.
     * @defaultValue false
     * @group Props
     */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Event emitted when the selected toggle button changes.
     * @group Emits
     */
    readonly onValueChange = output<AcceptableValue | AcceptableValue[] | undefined>();

    /**
     * The value change callback.
     */
    private onChange?: (value: AcceptableValue | AcceptableValue[] | undefined) => void;

    /**
     * onTouch function registered via registerOnTouch (ControlValueAccessor).
     */
    protected onTouched?: () => void;

    /**
     * Toggle a value.
     * @param value The value to toggle.
     * @ignore
     */
    toggle(value: AcceptableValue): void {
        if (this.disabled()) {
            return;
        }

        if (this.type() === 'single') {
            this.value.set(isEqual(value, this.value()) ? undefined : value);
        } else {
            const modelValueArray = Array.isArray(this.value())
                ? [...((this.value() as AcceptableValue[]) || [])]
                : [this.value()].filter(Boolean);
            if (isValueEqualOrExist(modelValueArray, value)) {
                const index = modelValueArray.findIndex((i) => isEqual(i, value));
                modelValueArray.splice(index, 1);
            } else {
                modelValueArray.push(value);
            }
            this.value.set(modelValueArray);
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
    registerOnChange(fn: (value: AcceptableValue | AcceptableValue[] | undefined) => void): void {
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
