import { isPlatformBrowser } from '@angular/common';
import {
    afterNextRender,
    DestroyRef,
    effect,
    ElementRef,
    inject,
    PLATFORM_ID,
    Signal,
    signal,
    untracked
} from '@angular/core';
import { itemToStringValue as defaultItemToStringValue } from '../item-helpers';

/** Angular callback counterpart of a ref to a generated native input. Called with null on cleanup. */
export type RdxNativeInputRef = (input: HTMLInputElement | null) => void;

/** @internal A persistent, visually hidden input for autofill, validation and native focus. */
export interface RdxNativeFormInputOptions {
    type: () => 'text' | 'hidden';
    name: () => string | undefined;
    value: () => string;
    id?: () => string | undefined;
    autoComplete?: () => string | undefined;
    required?: () => boolean;
    readOnly?: () => boolean;
    ref?: () => RdxNativeInputRef | undefined;
    onChange?: (value: string, event: Event) => void | Promise<void>;
    onFocus?: (event: FocusEvent) => void;
    onInvalid?: (event: Event) => void;
}

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
    /** Optional persistent input. When named, it submits instead of duplicating generated entries. */
    readonly input?: RdxNativeFormInputOptions;
}

/** Imperative operations needed by controls that submit immediately after a value change. */
export interface RdxNativeFormControl {
    /** The generated persistent input; null on the server, before hydration and after destruction. */
    readonly inputElement: Signal<HTMLInputElement | null>;
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
    inputElement: signal<HTMLInputElement | null>(null).asReadonly(),
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
    const inputElement = signal<HTMLInputElement | null>(null);
    let inputRef: RdxNativeInputRef | undefined;
    let inputChange = 0;
    let invalidInputGrown = false;
    let removeInputListeners: () => void = () => undefined;
    let defaultValue: T | undefined;
    let defaultValues: readonly string[] = [];
    let hasDefaultValue = false;
    let alive = true;
    let viewClaimed = false;

    const createInput = (): HTMLInputElement => {
        const input = ownerDocument.createElement('input');
        input.tabIndex = -1;
        input.setAttribute('aria-hidden', 'true');
        input.setAttribute('data-rdx-native-input', '');
        const onFocus = (event: FocusEvent) => options.input?.onFocus?.(event);
        const onInvalid = (event: Event) => {
            // Chromium needs a nonzero box to anchor its constraint-validation message.
            invalidInputGrown = true;
            input.style.width = input.style.height = '1px';
            options.input?.onInvalid?.(event);
        };
        const onChange = (event: Event) => {
            const value = input.value;
            const request = ++inputChange;
            // Let later listeners cancel, and coalesce the input/change pair from browser autofill.
            queueMicrotask(async () => {
                if (!alive || inputElement() !== input || request !== inputChange) return;
                try {
                    if (
                        !event.defaultPrevented &&
                        !untracked(options.disabled) &&
                        !untracked(() => options.input?.readOnly?.())
                    ) {
                        await options.input?.onChange?.(value, event);
                    }
                } finally {
                    if (alive) untracked(sync);
                }
            });
        };
        input.addEventListener('input', onChange);
        input.addEventListener('change', onChange);
        input.addEventListener('focus', onFocus);
        input.addEventListener('invalid', onInvalid);
        removeInputListeners = () => {
            input.removeEventListener('input', onChange);
            input.removeEventListener('change', onChange);
            input.removeEventListener('focus', onFocus);
            input.removeEventListener('invalid', onInvalid);
        };
        host.parentNode?.insertBefore(input, host.nextSibling);
        inputElement.set(input);
        return input;
    };

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

        const primaryName = options.input?.name();
        const primaryValue = options.input?.value();
        const primaryType = options.input?.type();
        const primaryId = options.input?.id?.();
        const autoComplete = options.input?.autoComplete?.();
        const required = options.input?.required?.() ?? false;
        const readOnly = options.input?.readOnly?.() ?? false;
        const nextRef = options.input?.ref?.();

        // Track every option before deferring DOM work until Angular has claimed its view.
        if (!viewClaimed) return;

        if (nativeControlOwnsValue && inputElement()) {
            removeInputListeners();
            untracked(() => inputRef?.(null));
            inputRef = undefined;
            inputElement()?.remove();
            inputElement.set(null);
            inputChange++;
            invalidInputGrown = false;
        }

        if (options.input && !nativeControlOwnsValue) {
            const input = inputElement() ?? createInput();
            input.type = primaryType ?? 'hidden';
            input.disabled = disabled;
            input.required = required;
            input.readOnly = readOnly;
            for (const [attribute, value] of Object.entries({
                name: primaryName,
                form,
                id: primaryId,
                autocomplete: autoComplete
            })) {
                if (value === undefined) input.removeAttribute(attribute);
                else input.setAttribute(attribute, value);
            }
            Object.assign(input.style, {
                position: primaryName ? 'absolute' : 'fixed',
                clipPath: 'inset(50%)',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                border: '0',
                padding: '0',
                margin: primaryName ? '-1px' : '0',
                width: primaryName || invalidInputGrown ? '1px' : '0',
                height: primaryName || invalidInputGrown ? '1px' : '0',
                top: primaryName ? '' : '0',
                left: primaryName ? '' : '0'
            });
            if (!input.hasAttribute('data-rdx-native-form-control')) {
                input.defaultValue = primaryName ? (defaultValues[0] ?? '') : '';
                input.setAttribute('data-rdx-native-form-control', '');
            }
            input.value = primaryValue ?? '';
            if (nextRef !== inputRef) {
                untracked(() => {
                    inputRef?.(null);
                    nextRef?.(input);
                });
                inputRef = nextRef;
            }
        }

        const primarySubmits = Boolean(options.input && primaryName && primaryName === name && !nativeControlOwnsValue);
        const shouldRender = Boolean(name && options.serialize && !nativeControlOwnsValue && !primarySubmits);
        const count = shouldRender ? values.length : 0;

        while (inputs.length > count) {
            inputs.pop()?.remove();
        }

        while (inputs.length < count) {
            const input = ownerDocument.createElement('input');
            input.type = 'hidden';
            const previous = inputs.at(-1);
            host.parentNode?.insertBefore(
                input,
                previous ? previous.nextSibling : (inputElement() ?? host).nextSibling
            );
            inputs.push(input);
        }

        for (let index = 0; index < inputs.length; index++) {
            const input = inputs[index];
            input.name = name!;
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
            input.value = values[index];
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
        removeInputListeners();
        ownerDocument.removeEventListener('reset', onReset, true);
        for (const input of inputs) {
            input.remove();
        }
        untracked(() => inputRef?.(null));
        inputElement()?.remove();
        inputElement.set(null);
    });

    return {
        inputElement: inputElement.asReadonly(),
        ownerForm,
        sync,
        requestSubmit: () => {
            untracked(sync);
            ownerForm()?.requestSubmit();
        }
    };
}
