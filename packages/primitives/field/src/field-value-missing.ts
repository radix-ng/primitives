import { afterEveryRender, computed, signal } from '@angular/core';
import { hasNoNativeFormOwner, type RdxValidationError } from '@radix-ng/primitives/core';
import { injectFormRootContext } from '@radix-ng/primitives/form';
import type { RdxFieldControlState } from './field-root';

/** @internal A native control with a visible target for invalid focus. */
export interface RdxFieldNativeControl {
    element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLButtonElement;
    focusTarget(): HTMLElement | null;
    participates(): boolean;
}

/** @internal A native input registered by a composite control. */
export interface RdxFieldNativeInput extends RdxFieldNativeControl {
    element: HTMLInputElement;
}

type FieldNativeValidity = Required<
    Pick<RdxFieldControlState, 'nativeErrors' | 'refreshNativeValidity' | 'invalidFocusTarget'>
>;

/** @internal Read native required constraints and report the visible invalid control to Field. */
export function useFieldValueMissing(
    inputs: () => Iterable<RdxFieldNativeInput>,
    fallbackFocusTarget: () => HTMLElement | null
): FieldNativeValidity {
    return useFieldNativeValidity(inputs, fallbackFocusTarget, ['valueMissing']);
}

type NativeErrorKind = Exclude<keyof ValidityState, 'valid'>;

/** @internal Read the native validity flags relevant to a field control. */
export function useFieldNativeValidity(
    inputs: () => Iterable<RdxFieldNativeControl>,
    fallbackFocusTarget: () => HTMLElement | null,
    kinds: readonly NativeErrorKind[]
): FieldNativeValidity {
    const form = injectFormRootContext(true)?.element;
    const failure = signal<{
        element: RdxFieldNativeControl['element'];
        target: HTMLElement | null;
        message: string;
        kinds: readonly NativeErrorKind[];
    } | null>(null);
    const refreshNativeValidity = () => {
        let invalid: RdxFieldNativeControl | undefined;
        let failedKinds: readonly NativeErrorKind[] = [];
        for (const input of inputs()) {
            const element = input.element;
            if (!input.participates() || !element.isConnected || !element.willValidate) continue;
            if (form && element.form !== form && !hasNoNativeFormOwner(element)) continue;
            const flags = kinds.filter((kind) => element.validity[kind]);
            if (flags.length === 0) continue;
            if (!invalid || element.compareDocumentPosition(invalid.element) & Node.DOCUMENT_POSITION_FOLLOWING) {
                invalid = input;
                failedKinds = flags;
            }
        }
        if (!invalid) {
            failure.set(null);
            return;
        }
        const element = invalid.element;
        const target = invalid.focusTarget();
        const message = element.validationMessage;
        const previous = failure();
        if (
            previous?.element !== element ||
            previous.target !== target ||
            previous.message !== message ||
            previous.kinds.length !== failedKinds.length ||
            failedKinds.some((kind, index) => kind !== previous.kinds[index])
        ) {
            failure.set({ element, target, message, kinds: failedKinds });
        }
    };

    afterEveryRender({ read: refreshNativeValidity });
    return {
        refreshNativeValidity,
        nativeErrors: computed<readonly RdxValidationError[]>(() => {
            const invalid = failure();
            return (
                invalid?.kinds.map((kind, index) => (index === 0 ? { kind, message: invalid.message } : { kind })) ?? []
            );
        }),
        invalidFocusTarget: () => failure()?.target ?? fallbackFocusTarget()
    };
}
