/**
 * Based On:
 * Copyright (c) flebee Authors. Licensed under the MIT License.
 */
import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, DestroyRef, Directive, inject, Injector, model } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NgControl, NgModel } from '@angular/forms';
import { createInjectionToken } from '../create-inject-context';

const noop = () => undefined;

export type RdxControlValueAccessorCompareTo<T = any> = (a?: T, b?: T) => boolean;

export const [injectCvaCompareTo, provideCvaCompareTo] = createInjectionToken<() => RdxControlValueAccessorCompareTo>(
    () => Object.is
);

/**
 * Provides a {@link RdxControlValueAccessorCompareTo comparator} based on a property of `T`.
 *
 * @example
 * ```ts
 * interface User {
 * 	id: string;
 * 	name: string;
 * }
 *
 * provideCvaCompareToByProp<User>('id');
 * ```
 */
export const provideCvaCompareToByProp = <T>(prop: keyof T) =>
    provideCvaCompareTo((a, b) => Object.is(a?.[prop], b?.[prop]), true);

@Directive({ standalone: true })
export class RdxControlValueAccessor<Value> implements ControlValueAccessor {
    private readonly ngControl = inject(NgControl, { self: true, optional: true });
    private readonly destroyRef = inject(DestroyRef);
    private readonly injector = inject(Injector);

    /**
     * A comparator, which determines value changes. Should return true, if two values are considered semantic equal.
     *
     * Defaults to {@link Object.is} in order to align with change detection behavior for inputs.
     */
    public readonly compareTo: RdxControlValueAccessorCompareTo<Value> = injectCvaCompareTo();
    /** Whether this is disabled. If a control is present, it reflects it's disabled state. */
    public inputDisabled = model<BooleanInput>(this.ngControl?.disabled ?? false, { alias: 'disabled' });
    public disabled = computed(() => booleanAttribute(this.inputDisabled()));
    /** The value of this. If a control is present, it reflects it's value. */
    public value = model<Value>(this.ngControl?.value ?? undefined);

    /**
     * `NgModel` sets up the control in `ngOnChanges`. Idk if bug or on purpose, but `writeValue` and `setDisabledState` are called before the inputs are set.
     * {@link https://github.com/angular/angular/blob/main/packages/forms/src/directives/ng_model.ts#L223}
     *
     * @ignore
     */
    private get registered() {
        return this.ngControl instanceof NgModel
            ? (this.ngControl as unknown as { _registered: boolean })._registered
            : true;
    }

    constructor() {
        if (this.ngControl != null) this.ngControl.valueAccessor = this;

        toObservable(this.value, { injector: this.injector })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((value) => {
                if (this.compareTo(this.ngControl?.value, value)) return;

                this._onChange(value);
            });

        // sync disabled state
        toObservable(this.inputDisabled, { injector: this.injector })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((disabled) => {
                if (this.ngControl == null || this.ngControl.control == null || this.ngControl.disabled === disabled)
                    return;

                this.ngControl.control[disabled ? 'disable' : 'enable']();
            });
    }

    private _onChange: (value: Value) => void = noop;
    private _onTouched: () => void = noop;

    /**
     * This function should be called when this host is considered `touched`.
     *
     * NOTE: Whenever a `blur` event is triggered on this host, this function is called.
     *
     * @see {@link RdxControlValueAccessor.registerOnTouched}
     * @see {@link RdxControlValueAccessor._ngControl}
     */
    markAsTouched() {
        this._onTouched();
    }

    setDisabledState(disabled: boolean) {
        if (!this.registered) return;

        this.inputDisabled.set(disabled);
    }

    writeValue(value: Value) {
        if (!this.registered || this.compareTo(value, this.value())) return;

        this.value.set(value);
    }

    registerOnChange(onChange: (value: Value) => void) {
        this._onChange = onChange;
    }

    registerOnTouched(onTouched: () => void) {
        this._onTouched = onTouched;
    }
}
