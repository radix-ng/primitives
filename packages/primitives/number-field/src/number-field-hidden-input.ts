import { Directive } from '@angular/core';
import { injectNumberFieldRootContext } from './number-field-context';

/**
 * The hidden native `input[type=number]` that mirrors the field value for native form submission
 * and browser constraint validation (min/max/step/required). Place it inside the root, alongside
 * the visible `[rdxNumberFieldInput]`.
 *
 * @see https://base-ui.com/react/components/number-field
 */
@Directive({
    selector: 'input[rdxNumberFieldHiddenInput]',
    exportAs: 'rdxNumberFieldHiddenInput',
    host: {
        type: 'number',
        tabindex: '-1',
        'aria-hidden': 'true',
        '[attr.name]': 'rootContext.name()',
        '[attr.form]': 'rootContext.form()',
        '[value]': 'rootContext.currentValue() ?? ""',
        '[attr.min]': 'rootContext.min()',
        '[attr.max]': 'rootContext.max()',
        '[attr.step]': 'rootContext.step()',
        '[disabled]': 'rootContext.isDisabled()',
        '[attr.required]': 'rootContext.required() ? "" : undefined',
        style: 'transform: translateX(-100%); position: absolute; overflow: hidden; pointer-events: none; opacity: 0; margin: 0;',
        '(focus)': 'onFocus()',
        '(change)': 'onChange($event)'
    }
})
export class RdxNumberFieldHiddenInput {
    protected readonly rootContext = injectNumberFieldRootContext()!;

    /** Move focus to the visible input when the hidden one is focused (e.g. via form validation). */
    onFocus(): void {
        this.rootContext.inputEl()?.focus();
    }

    /** Handle browser autofill, which writes directly to the hidden numeric input. */
    onChange(event: Event): void {
        const root = this.rootContext;
        if (root.isDisabled() || root.readonly()) {
            return;
        }

        const nextValue = (event.target as HTMLInputElement).valueAsNumber;
        const parsedValue = Number.isNaN(nextValue) ? null : nextValue;

        root.allowInputSync = true;
        root.setValue(parsedValue, 'none', event);
        root.commitValue(root.lastChangedValue ?? root.currentValue());
    }
}
