import { DestroyRef, inject, Injector, signal, Signal } from '@angular/core';
import { NgControl } from '@angular/forms';

/**
 * Interaction state owned by an Angular Reactive Forms or template-driven `NgControl` on the same
 * host element. `connected` stays false for standalone and Signal Forms controls.
 *
 * @ignore
 */
export interface RdxNgControlState {
    readonly connected: Signal<boolean>;
    readonly value: Signal<unknown>;
    readonly dirty: Signal<boolean>;
    readonly touched: Signal<boolean>;
}

/**
 * Lazily connects to the same-host `NgControl` without creating a circular dependency while Angular
 * is resolving its `ControlValueAccessor`. The unified `AbstractControl.events` stream mirrors
 * programmatic interaction-state changes as well as user-driven ones.
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
        dirty: dirty.asReadonly(),
        touched: touched.asReadonly()
    };
}
