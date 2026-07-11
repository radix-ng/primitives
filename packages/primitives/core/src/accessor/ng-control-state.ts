import { computed, DestroyRef, inject, Injector, signal, Signal } from '@angular/core';
import type { ValidationErrors } from '@angular/forms';
import { NgControl } from '@angular/forms';
import type { RdxValidationError } from '../signal-forms/form-control';

/**
 * Form state owned by an Angular Reactive Forms or template-driven `NgControl` on the same host
 * element. `connected` stays false for standalone and Signal Forms controls.
 *
 * @ignore
 */
export interface RdxNgControlState {
    readonly connected: Signal<boolean>;
    readonly value: Signal<unknown>;
    readonly valid: Signal<boolean>;
    readonly invalid: Signal<boolean>;
    readonly pending: Signal<boolean>;
    readonly disabled: Signal<boolean>;
    readonly errors: Signal<readonly RdxValidationError[]>;
    readonly dirty: Signal<boolean>;
    readonly touched: Signal<boolean>;
}

function toValidationErrors(errors: ValidationErrors | null): readonly RdxValidationError[] {
    if (!errors) {
        return [];
    }

    return Object.entries(errors).map(([kind, details]) => {
        const message =
            typeof details === 'string'
                ? details
                : details && typeof details === 'object' && typeof details['message'] === 'string'
                  ? details['message']
                  : undefined;

        return message === undefined ? { kind } : { kind, message };
    });
}

/**
 * Lazily connects to the same-host `NgControl` without creating a circular dependency while Angular
 * is resolving its `ControlValueAccessor`. The unified `AbstractControl.events` stream mirrors
 * programmatic value, status, validation, and interaction-state changes as well as user-driven ones.
 *
 * Must be called in an injection context.
 *
 * @ignore
 */
export function injectNgControlState(): RdxNgControlState {
    const injector = inject(Injector);
    const destroyRef = inject(DestroyRef);
    const connected = signal(false, { debugName: 'RdxNgControlState.connected' });
    const value = signal<unknown>(undefined, { debugName: 'RdxNgControlState.value' });
    const valid = signal(false, { debugName: 'RdxNgControlState.valid' });
    const invalid = signal(false, { debugName: 'RdxNgControlState.invalid' });
    const pending = signal(false, { debugName: 'RdxNgControlState.pending' });
    const disabled = signal(false, { debugName: 'RdxNgControlState.disabled' });
    const rawErrors = signal<ValidationErrors | null>(null, { debugName: 'RdxNgControlState.rawErrors' });
    const errors = computed(() => toValidationErrors(rawErrors()), {
        debugName: 'RdxNgControlState.errors'
    });
    const dirty = signal(false, { debugName: 'RdxNgControlState.dirty' });
    const touched = signal(false, { debugName: 'RdxNgControlState.touched' });
    let destroyed = false;
    let unsubscribe: (() => void) | undefined;

    const connect = () => {
        if (destroyed) {
            return;
        }

        const control = injector.get(NgControl, null, { self: true, optional: true })?.control;
        // Signal Forms' `FormField` is also discoverable through Angular's forms DI integration, but
        // it is not an `AbstractControl` and owns state through signals instead of `control.events`.
        if (!control || typeof control.events?.subscribe !== 'function') {
            return;
        }

        const sync = () => {
            value.set(control.value);
            valid.set(control.valid);
            invalid.set(control.invalid);
            pending.set(control.pending);
            disabled.set(control.disabled);
            rawErrors.set(control.errors);
            dirty.set(control.dirty);
            touched.set(control.touched);
        };

        sync();
        const subscription = control.events.subscribe(sync);
        unsubscribe = () => subscription.unsubscribe();
        connected.set(true);
    };

    // `NgControl` resolves its value accessor from this same element. Defer the lookup until every
    // directive on the host has finished constructing to avoid a DI cycle.
    queueMicrotask(connect);

    destroyRef.onDestroy(() => {
        destroyed = true;
        unsubscribe?.();
    });

    return {
        connected: connected.asReadonly(),
        value: value.asReadonly(),
        valid: valid.asReadonly(),
        invalid: invalid.asReadonly(),
        pending: pending.asReadonly(),
        disabled: disabled.asReadonly(),
        errors,
        dirty: dirty.asReadonly(),
        touched: touched.asReadonly()
    };
}
