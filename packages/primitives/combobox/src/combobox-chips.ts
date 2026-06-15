import { DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { RdxFloatingInsideElement } from '@radix-ng/primitives/dismissable-layer';
import { injectComboboxRootContext } from './combobox-root';

/**
 * Container for the selected-value chips in `multiple` mode. Sits before the input and coordinates
 * arrow-key navigation across the chips (the chips themselves handle the key events). Uses
 * `role="toolbar"` (Base UI): it keeps NVDA in focus mode while arrow-navigating the chips, where a
 * plain `list` would drop into browse mode.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxComboboxChips]',
    exportAs: 'rdxComboboxChips',
    hostDirectives: [RdxFloatingInsideElement],
    host: {
        role: 'toolbar'
    }
})
export class RdxComboboxChips {
    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    private readonly rootContext = injectComboboxRootContext();

    constructor() {
        this.rootContext.registerChipsNav(() => this.focusLast());
        inject(DestroyRef).onDestroy(() => this.rootContext.registerChipsNav(null));
    }

    /** The chip elements in DOM order. */
    getChips(): HTMLElement[] {
        return Array.from(this.host.querySelectorAll<HTMLElement>('[rdxComboboxChip]'));
    }

    /** Focuses the last chip. Returns whether there was one. */
    focusLast(): boolean {
        const chips = this.getChips();
        if (chips.length === 0) {
            return false;
        }
        chips[chips.length - 1].focus();
        return true;
    }
}
