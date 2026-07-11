import { isPlatformBrowser } from '@angular/common';
import { afterNextRender, DestroyRef, effect, ElementRef, inject, PLATFORM_ID, Signal, untracked } from '@angular/core';
import { itemToStringValue as defaultItemToStringValue } from '../item-helpers';

/** Configuration for a composite control that participates in a native HTML form. */
export interface RdxNativeFormControlOptions<T> {
    /** Form-field name. No value is contributed while it is absent. */
    readonly name: Signal<string | undefined>;
    /** Optional id of an external owning form. */
    readonly form: Signal<string | undefined>;
    /** Disabled controls are excluded from successful form controls. */
    readonly disabled: Signal<boolean>;
    /** Current control value, used when the form constructs `FormData`. */
    readonly value?: Signal<T>;
    /** Converts a value to one or more form entries. Omit for controls with their own native inputs. */
    readonly serialize?: (value: T) => readonly string[];
    /** Whether a consumer-rendered native input currently owns serialization. */
    readonly hasNativeControl?: Signal<boolean>;
    /** Synchronizes a consumer-rendered native control immediately before an imperative submit. */
    readonly syncNativeControl?: () => void;
    /** Value restored by a native form reset. Captured once after inputs bind. */
    readonly defaultValue?: () => T;
    /** Applies the captured default value after a native form reset. */
    readonly onReset?: (value: T) => void;
}

/** Imperative operations needed by controls that submit immediately after a value change. */
export interface RdxNativeFormControl {
    /** The current owning form, including an external form selected by the `form` input. */
    ownerForm(): HTMLFormElement | null;
    /** Synchronizes generated/native controls with the current signals. */
    sync(): void;
    /** Synchronizes the value and requests submission from the owning form. */
    requestSubmit(): void;
}

/**
 * Converts a scalar or array model to HTML form values. `null` and `undefined` represent no
 * successful control; arrays deliberately become repeated entries under the same field name.
 */
export function serializeNativeFormValue(
    value: unknown,
    itemToStringValue: (entry: unknown) => string = defaultItemToStringValue
): readonly string[] {
    const values = Array.isArray(value) ? value : [value];
    return values.flatMap((entry) => (entry == null ? [] : [itemToStringValue(entry)]));
}

const NOOP_NATIVE_FORM_CONTROL: RdxNativeFormControl = {
    ownerForm: () => null,
    sync: () => undefined,
    requestSubmit: () => undefined
};

/**
 * Adds native form semantics to a composite control, rendering hidden inputs only when the control
 * has no native successful control of its own.
 *
 * A hidden input is necessary for a headless root to enter the platform's successful-controls tree
 * (including older engines that do not dispatch `formdata` for `new FormData(form)`). One input is
 * created per serialized value, preserving repeated-field semantics; controls with their own native
 * input use this solely for reset and imperative-submit coordination.
 *
 * Generated inputs are browser-only. Rendering imperative sibling nodes on the server would put DOM
 * outside Angular's hydration graph; the client creates them after its view has been claimed instead.
 */
export function useNativeFormControl<T>(options: RdxNativeFormControlOptions<T>): RdxNativeFormControl {
    const host = inject<ElementRef<Node>>(ElementRef).nativeElement;
    const ownerDocument = host.ownerDocument;
    const destroyRef = inject(DestroyRef);

    if (!ownerDocument || !isPlatformBrowser(inject(PLATFORM_ID))) {
        return NOOP_NATIVE_FORM_CONTROL;
    }

    const inputs: HTMLInputElement[] = [];
    let defaultValue: T | undefined;
    let defaultValues: readonly string[] = [];
    let hasDefaultValue = false;
    let alive = true;
    let viewClaimed = false;

    const ownerForm = (): HTMLFormElement | null => {
        const formId = options.form();
        const candidate = formId
            ? ownerDocument.getElementById(formId)
            : typeof (host as Element).closest === 'function'
              ? (host as Element).closest('form')
              : host.parentElement?.closest('form');

        return candidate?.localName === 'form' ? (candidate as HTMLFormElement) : null;
    };

    const sync = () => {
        options.syncNativeControl?.();

        const name = options.name();
        const form = options.form();
        const disabled = options.disabled();
        const nativeControlOwnsValue = options.hasNativeControl?.() ?? false;
        const values = options.value && options.serialize ? options.serialize(options.value()) : [];

        // During hydration Angular must claim every server-rendered sibling before an imperative input
        // can be inserted. The after-render callback below performs the first DOM synchronization.
        if (!viewClaimed) {
            return;
        }

        const shouldRender = Boolean(name && options.serialize && !nativeControlOwnsValue);
        const count = shouldRender ? values.length : 0;

        while (inputs.length > count) {
            inputs.pop()?.remove();
        }

        while (inputs.length < count) {
            const input = ownerDocument.createElement('input');
            input.type = 'hidden';
            const previous = inputs.at(-1);
            host.parentNode?.insertBefore(input, previous ? previous.nextSibling : host.nextSibling);
            inputs.push(input);
        }

        for (let index = 0; index < inputs.length; index++) {
            const input = inputs[index];
            input.name = name!;
            input.value = values[index];
            input.disabled = disabled;

            if (form) {
                input.setAttribute('form', form);
            } else {
                input.removeAttribute('form');
            }

            // Native reset reads `defaultValue`; retain the original default rather than accidentally
            // promoting later user edits to the reset baseline.
            if (!input.hasAttribute('data-rdx-native-form-control')) {
                input.defaultValue = defaultValues[index] ?? values[index];
                input.setAttribute('data-rdx-native-form-control', '');
            }
        }
    };

    effect(() => {
        if (!hasDefaultValue && options.defaultValue) {
            defaultValue = options.defaultValue();
            defaultValues = options.serialize ? options.serialize(defaultValue) : [];
            hasDefaultValue = true;
        }
    });

    effect(sync);
    afterNextRender(() => {
        viewClaimed = true;
        untracked(sync);
    });

    const onReset = (event: Event) => {
        if (event.target !== ownerForm() || !options.onReset || !hasDefaultValue) {
            return;
        }

        // Native controls reset after the event. Check `defaultPrevented` in the microtask so a later
        // bubble listener can still cancel the reset before the model follows it.
        queueMicrotask(() => {
            if (alive && !event.defaultPrevented) {
                untracked(() => options.onReset!(defaultValue as T));
            }
        });
    };

    ownerDocument.addEventListener('reset', onReset, true);

    destroyRef.onDestroy(() => {
        alive = false;
        ownerDocument.removeEventListener('reset', onReset, true);
        for (const input of inputs) {
            input.remove();
        }
    });

    return {
        ownerForm,
        sync,
        requestSubmit: () => {
            untracked(sync);
            ownerForm()?.requestSubmit();
        }
    };
}
