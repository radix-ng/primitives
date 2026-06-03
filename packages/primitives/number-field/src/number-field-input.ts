import { injectNumberFieldRootContext } from './number-field-context';
import { Directive, ElementRef, inject } from '@angular/core';
import { getActiveElement } from '@radix-ng/primitives/core';

/**
 * The native text input that displays the formatted value and accepts typed input.
 *
 * @see https://base-ui.com/react/components/number-field
 */
@Directive({
    selector: 'input[rdxNumberFieldInput]',
    exportAs: 'rdxNumberFieldInput',
    host: {
        type: 'text',
        autocomplete: 'off',
        autocorrect: 'off',
        spellcheck: 'false',
        'aria-roledescription': 'Number field',
        '[id]': 'rootContext.id()',
        '[value]': 'rootContext.inputValue()',
        '[attr.inputmode]': 'rootContext.inputMode()',
        '[attr.aria-invalid]':
            'rootContext.invalidState() || (rootContext.required() && rootContext.currentValue() === null) ? "true" : undefined',
        '[disabled]': 'rootContext.isDisabled()',
        '[attr.readonly]': 'rootContext.readonly() ? "" : undefined',
        '[required]': 'rootContext.required()',
        '[attr.data-disabled]': 'rootContext.isDisabled() ? "" : undefined',
        '[attr.data-readonly]': 'rootContext.readonly() ? "" : undefined',
        '[attr.data-required]': 'rootContext.required() ? "" : undefined',
        '[attr.data-invalid]': 'rootContext.invalidState() ? "" : undefined',
        '[attr.data-valid]': 'rootContext.invalidState() ? undefined : ""',
        '[attr.data-touched]': 'rootContext.touchedState() ? "" : undefined',
        '[attr.data-dirty]': 'rootContext.dirtyState() ? "" : undefined',
        '(focus)': 'onFocus($event)',
        '(blur)': 'onBlur($event)',
        '(input)': 'onInput($event)',
        '(beforeinput)': 'onBeforeInput($event)',
        '(keydown)': 'onKeydown($event)',
        '(paste)': 'onPaste($event)',
        '(wheel)': 'onWheel($event)'
    }
})
export class RdxNumberFieldInput {
    private readonly elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
    protected readonly rootContext = injectNumberFieldRootContext();

    /** Browsers place the caret at the start; we move it to the end on the first focus. */
    private hasTouchedInput = false;

    constructor() {
        this.rootContext.registerInput(this.elementRef.nativeElement);
    }

    onFocus(event: FocusEvent): void {
        const root = this.rootContext;
        if (root.readonly() || root.isDisabled() || this.hasTouchedInput) {
            return;
        }
        this.hasTouchedInput = true;
        const target = event.target as HTMLInputElement;
        const length = target.value.length;
        target.setSelectionRange(length, length);
    }

    onBeforeInput(event: InputEvent): void {
        // Only validate insertions; deletions and composition have `data === null`.
        if (event.data == null) {
            return;
        }
        const target = event.target as HTMLInputElement;
        const nextValue =
            target.value.slice(0, target.selectionStart ?? undefined) +
            event.data +
            target.value.slice(target.selectionEnd ?? undefined);

        if (!this.rootContext.isValidPartial(nextValue)) {
            event.preventDefault();
        }
    }

    onInput(event: Event): void {
        const root = this.rootContext;
        const targetValue = (event.target as HTMLInputElement).value;

        root.allowInputSync = false;

        if (targetValue.trim() === '') {
            root.setInputValue(targetValue);
            root.setValue(null, 'input-clear', event);
            return;
        }

        const parsedValue = root.parseNumber(targetValue);
        root.setInputValue(targetValue);

        if (parsedValue !== null) {
            root.setValue(parsedValue, 'input-change', event);
        }
    }

    onKeydown(event: KeyboardEvent): void {
        const root = this.rootContext;
        if (root.readonly() || root.isDisabled()) {
            return;
        }

        root.allowInputSync = true;
        const key = event.key;

        if (key === 'ArrowUp' || key === 'ArrowDown') {
            event.preventDefault();
            const parsed = root.parseNumber(root.inputValue());
            const amount = root.getStepAmount(event);
            root.incrementValue(amount, {
                direction: key === 'ArrowUp' ? 1 : -1,
                currentValue: parsed,
                event,
                reason: 'keyboard'
            });
            root.commitValue(root.lastChangedValue ?? root.currentValue());
        } else if (key === 'Home' && root.min() != null) {
            event.preventDefault();
            root.setValue(root.min()!, 'keyboard', event);
            root.commitValue(root.lastChangedValue ?? root.currentValue());
        } else if (key === 'End' && root.max() != null) {
            event.preventDefault();
            root.setValue(root.max()!, 'keyboard', event);
            root.commitValue(root.lastChangedValue ?? root.currentValue());
        }
    }

    onPaste(event: ClipboardEvent): void {
        const root = this.rootContext;
        if (root.readonly() || root.isDisabled()) {
            return;
        }

        const pastedData = event.clipboardData?.getData('text/plain') ?? '';
        // Prevent the subsequent `input` event from also handling the paste.
        event.preventDefault();

        const parsedValue = root.parseNumber(pastedData);
        if (parsedValue !== null) {
            root.allowInputSync = false;
            root.setValue(parsedValue, 'input-paste', event);
            root.setInputValue(pastedData);
        }
    }

    onBlur(event: FocusEvent): void {
        const root = this.rootContext;
        if (root.readonly() || root.isDisabled()) {
            return;
        }

        root.markAsTouched();

        const hadManualInput = !root.allowInputSync;
        const hadPendingCommit = root.hasPendingCommit;
        root.allowInputSync = true;

        const text = root.inputValue();

        if (text.trim() === '') {
            root.setValue(null, 'input-clear', event);
            root.commitValue(null);
            return;
        }

        const parsedValue = root.parseNumber(text);
        if (parsedValue === null) {
            return;
        }

        const value = root.currentValue();
        const shouldUpdate = value !== parsedValue;
        const shouldCommit = hadManualInput || shouldUpdate || hadPendingCommit;

        let committedValue = parsedValue;
        if (shouldUpdate) {
            root.setValue(parsedValue, 'input-blur', event);
            committedValue = root.lastChangedValue ?? parsedValue;
        }

        if (shouldCommit) {
            root.commitValue(committedValue);
        }

        const canonicalText = root.formatNumber(committedValue);
        if (root.inputValue() !== canonicalText) {
            root.setInputValue(canonicalText);
        }
    }

    onWheel(event: WheelEvent): void {
        const root = this.rootContext;
        if (!root.allowWheelScrub() || root.isDisabled() || root.readonly()) {
            return;
        }
        // Allow pinch-zoom and only scrub while focused.
        if (event.ctrlKey || getActiveElement() !== this.elementRef.nativeElement) {
            return;
        }

        event.preventDefault();
        root.allowInputSync = true;
        const amount = root.getStepAmount(event);
        root.incrementValue(amount, {
            direction: event.deltaY > 0 ? -1 : 1,
            event,
            reason: 'wheel'
        });
    }
}
