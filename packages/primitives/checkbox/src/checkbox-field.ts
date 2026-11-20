import { afterEveryRender, computed, signal } from '@angular/core';
import { hasNoNativeFormOwner, type RdxValidationError } from '@radix-ng/primitives/core';
import type { RdxFieldControlState } from '@radix-ng/primitives/field';
import { injectFormRootContext } from '@radix-ng/primitives/form';

export interface CheckboxFieldInput {
    element: HTMLInputElement;
    button(): HTMLButtonElement | null;
    participates(): boolean;
}

/** Read browser constraints from authored inputs and report the visible invalid control to Field. */
export function useCheckboxFieldValidity(
    inputs: () => Iterable<CheckboxFieldInput>,
    fallbackFocusTarget: () => HTMLButtonElement | null
): Pick<RdxFieldControlState, 'nativeErrors' | 'refreshNativeValidity' | 'invalidFocusTarget'> {
    const form = injectFormRootContext(true)?.element;
    const failure = signal<{ element: HTMLInputElement; button: HTMLButtonElement | null; message: string } | null>(
        null
    );
    const refreshNativeValidity = () => {
        let invalid: CheckboxFieldInput | undefined;
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
        const button = invalid.button();
        const message = element.validationMessage;
        const previous = failure();
        if (previous?.element !== element || previous.button !== button || previous.message !== message) {
            failure.set({ element, button, message });
        }
    };

    afterEveryRender({ read: refreshNativeValidity });
    return {
        refreshNativeValidity,
        nativeErrors: computed<readonly RdxValidationError[]>(() => {
            const invalid = failure();
            return invalid ? [{ kind: 'valueMissing', message: invalid.message }] : [];
        }),
        invalidFocusTarget: () => failure()?.button ?? fallbackFocusTarget()
    };
}
