import { afterEveryRender, computed, signal } from '@angular/core';
import { hasNoNativeFormOwner, type RdxValidationError } from '@radix-ng/primitives/core';
import { injectFormRootContext } from '@radix-ng/primitives/form';
import type { RdxFieldControlState } from './field-root';

/** @internal A native input with a visible control for invalid focus. */
export interface RdxFieldNativeInput {
    element: HTMLInputElement;
    focusTarget(): HTMLElement | null;
    participates(): boolean;
}

/** @internal Read native required constraints and report the visible invalid control to Field. */
export function useFieldValueMissing(
    inputs: () => Iterable<RdxFieldNativeInput>,
    fallbackFocusTarget: () => HTMLElement | null
): Pick<RdxFieldControlState, 'nativeErrors' | 'refreshNativeValidity' | 'invalidFocusTarget'> {
    const form = injectFormRootContext(true)?.element;
    const failure = signal<{ element: HTMLInputElement; target: HTMLElement | null; message: string } | null>(null);
    const refreshNativeValidity = () => {
        let invalid: RdxFieldNativeInput | undefined;
        for (const input of inputs()) {
            const element = input.element;
            if (!input.participates() || !element.isConnected || !element.willValidate) continue;
            if (form && element.form !== form && !hasNoNativeFormOwner(element)) continue;
            if (!element.validity.valueMissing) continue;
            if (!invalid || element.compareDocumentPosition(invalid.element) & Node.DOCUMENT_POSITION_FOLLOWING) {
                invalid = input;
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
        if (previous?.element !== element || previous.target !== target || previous.message !== message) {
            failure.set({ element, target, message });
        }
    };

    afterEveryRender({ read: refreshNativeValidity });
    return {
        refreshNativeValidity,
        nativeErrors: computed<readonly RdxValidationError[]>(() => {
            const invalid = failure();
            return invalid ? [{ kind: 'valueMissing', message: invalid.message }] : [];
        }),
        invalidFocusTarget: () => failure()?.target ?? fallbackFocusTarget()
    };
}
