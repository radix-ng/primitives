import { DestroyRef, effect, ElementRef, inject, Signal, untracked } from '@angular/core';

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
    /** Value restored by a native form reset. Captured once after inputs bind. */
    readonly defaultValue?: () => T;
    /** Applies the captured default value after a native form reset. */
    readonly onReset?: (value: T) => void;
}

/**
 * Converts a scalar or array model to HTML form values. `null` and `undefined` represent no
 * successful control; arrays deliberately become repeated entries under the same field name.
 */
export function serializeNativeFormValue(value: unknown): readonly string[] {
    const values = Array.isArray(value) ? value : [value];
    return values.flatMap((entry) => (entry == null ? [] : [String(entry)]));
}

/**
 * Adds native form semantics to a composite control, rendering hidden inputs only when the control
 * has no native successful control of its own.
 *
 * A hidden input is necessary for a headless root to enter the platform's successful-controls tree
 * (including older engines that do not dispatch `formdata` for `new FormData(form)`). One input is
 * created per serialized value, preserving repeated-field semantics; controls with their own native
 * input (for example Slider's focusable range thumbs) use this solely for the reset lifecycle.
 */
export function useNativeFormControl<T>(options: RdxNativeFormControlOptions<T>): void {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const ownerDocument = host.ownerDocument;
    const destroyRef = inject(DestroyRef);
    const inputs: HTMLInputElement[] = [];
    let defaultValue: T | undefined;
    let defaultValues: readonly string[] = [];
    let hasDefaultValue = false;
    let alive = true;

    effect(() => {
        if (!hasDefaultValue && options.defaultValue) {
            defaultValue = options.defaultValue();
            defaultValues = options.serialize ? options.serialize(defaultValue) : [];
            hasDefaultValue = true;
        }
    });

    effect(() => {
        const name = options.name();
        const values = options.value && options.serialize ? options.serialize(options.value()) : [];
        const shouldRender = Boolean(name && options.serialize);
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
            input.disabled = options.disabled();

            const form = options.form();
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
    });

    effect((onCleanup) => {
        const formId = options.form();
        const form = formId ? ownerDocument.getElementById(formId) : host.closest('form');
        if (!(form instanceof HTMLFormElement)) {
            return;
        }

        const onReset = () => {
            if (!options.onReset || !hasDefaultValue) {
                return;
            }

            // Native controls reset after the event. Queue the model write so composite and native
            // controls settle in the same turn, while still letting a form's reset listener run first.
            queueMicrotask(() => {
                if (alive) {
                    untracked(() => options.onReset!(defaultValue as T));
                }
            });
        };

        form.addEventListener('reset', onReset);
        onCleanup(() => {
            form.removeEventListener('reset', onReset);
        });
    });

    destroyRef.onDestroy(() => {
        alive = false;
        for (const input of inputs) {
            input.remove();
        }
    });
}
