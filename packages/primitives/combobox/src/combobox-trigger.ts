import { DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { RdxDismissableLayerBranch } from '@radix-ng/primitives/dismissable-layer';
import { injectComboboxRootContext } from './combobox-root';

/**
 * Toggles the combobox popup. Carries `tabindex="-1"` so it never steals focus from the input.
 *
 * @group Components
 */
@Directive({
    selector: 'button[rdxComboboxTrigger]',
    exportAs: 'rdxComboboxTrigger',
    hostDirectives: [RdxDismissableLayerBranch],
    host: {
        type: 'button',
        tabindex: '-1',
        'aria-label': 'Open',
        '[attr.aria-expanded]': 'rootContext.open()',
        '[attr.aria-controls]': 'rootContext.listId',
        '[attr.aria-labelledby]': 'rootContext.labelId()',
        '[attr.disabled]': 'rootContext.disabledState() ? "" : undefined',
        '[attr.data-popup-open]': 'rootContext.open() ? "" : undefined',
        '[attr.data-disabled]': 'rootContext.disabledState() ? "" : undefined',
        '(click)': 'onClick()'
    }
})
export class RdxComboboxTrigger {
    protected readonly rootContext = injectComboboxRootContext();
    private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    constructor() {
        this.rootContext.registerTrigger(this.element);
        inject(DestroyRef).onDestroy(() => this.rootContext.registerTrigger(null));
    }

    onClick(): void {
        if (this.rootContext.open()) {
            this.rootContext.closePopup(true);
        } else {
            this.rootContext.focusInput();
            this.rootContext.openForBrowse();
        }
    }
}
