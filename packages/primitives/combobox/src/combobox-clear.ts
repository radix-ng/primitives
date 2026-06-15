import { booleanAttribute, computed, Directive, input } from '@angular/core';
import { RdxFloatingInsideElement } from '@radix-ng/primitives/dismissable-layer';
import { injectComboboxRootContext } from './combobox-root';

/**
 * Clears the current selection and the input text. Hidden when there is nothing to clear.
 *
 * @group Components
 */
@Directive({
    selector: 'button[rdxComboboxClear]',
    exportAs: 'rdxComboboxClear',
    hostDirectives: [RdxFloatingInsideElement],
    host: {
        type: 'button',
        tabindex: '-1',
        'aria-label': 'Clear',
        '[hidden]': 'isEmpty()',
        '[attr.disabled]': 'isDisabled() ? "" : undefined',
        '(pointerdown)': 'onPointerDown($event)',
        '(mousedown)': 'onPointerDown($event)',
        '(click)': 'onClick()'
    }
})
export class RdxComboboxClear {
    protected readonly rootContext = injectComboboxRootContext();

    /** Disables just this clear button (in addition to the combobox's own disabled / read-only state). */
    readonly disabled = input(false, { transform: booleanAttribute });

    protected readonly isDisabled = computed(
        () => this.disabled() || this.rootContext.disabledState() || this.rootContext.readonly()
    );

    /**
     * Whether there is nothing to clear, mirroring Base UI's visibility rule: in `none` mode the
     * button tracks the input text (a pure search field has no selection), otherwise it tracks the
     * selected value(s).
     */
    protected readonly isEmpty = computed(() => {
        if (this.rootContext.selectionMode() === 'none') {
            return (this.rootContext.inputValue() ?? '') === '';
        }
        const value = this.rootContext.value();
        if (Array.isArray(value)) {
            return value.length === 0;
        }
        return value === null || value === undefined;
    });

    // Keep focus on the input — don't let the button take it on pointer/mouse down.
    onPointerDown(event: MouseEvent): void {
        event.preventDefault();
    }

    onClick(): void {
        this.rootContext.clearSelection();
    }
}
