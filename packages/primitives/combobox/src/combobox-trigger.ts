import { DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { RdxFloatingInsideElement } from '@radix-ng/primitives/dismissable-layer';
import { injectComboboxRootContext } from './combobox-root';

/**
 * Toggles the combobox popup. Its semantics depend on the layout (Base UI's `inputInsidePopup`):
 *
 * - **Input outside the popup** (default): a `tabindex="-1"` toggle button (`aria-haspopup="listbox"`)
 *   that never steals focus from the input — `Tab` lands directly on the input.
 * - **Input inside the popup** (e.g. a command palette / emoji picker): the trigger becomes the primary
 *   `role="combobox"` control — `tabindex="0"` (reachable via `Tab`), `aria-haspopup="dialog"`, and
 *   `ArrowDown`/`ArrowUp` open the popup (which moves focus to the inner input and highlights an item).
 *
 * The trigger stays `Tab`-reachable by default and is demoted to `tabindex="-1"` only once an input is
 * detected *outside* the popup — so a trigger whose input lives in a not-yet-opened popup is focusable
 * from the first render (`inputLayout` is `unknown` until that input mounts).
 *
 * @group Components
 */
@Directive({
    selector: 'button[rdxComboboxTrigger]',
    exportAs: 'rdxComboboxTrigger',
    hostDirectives: [RdxFloatingInsideElement],
    host: {
        type: 'button',
        '[attr.tabindex]': 'rootContext.inputLayout() === "outside" ? "-1" : "0"',
        '[attr.role]': 'rootContext.inputLayout() === "inside" ? "combobox" : undefined',
        '[attr.aria-haspopup]': 'rootContext.inputLayout() === "inside" ? "dialog" : "listbox"',
        '[attr.aria-expanded]': 'rootContext.open()',
        '[attr.aria-controls]': 'rootContext.listId',
        '[attr.aria-labelledby]': 'rootContext.labelId()',
        '[attr.aria-required]':
            'rootContext.inputLayout() === "inside" && rootContext.requiredState() ? "true" : undefined',
        '[attr.disabled]': 'rootContext.disabledState() ? "" : undefined',
        '[attr.data-popup-open]': 'rootContext.open() ? "" : undefined',
        '[attr.data-disabled]': 'rootContext.disabledState() ? "" : undefined',
        '(pointerdown)': 'onPointerDown($event)',
        '(click)': 'onClick()',
        '(keydown)': 'onKeydown($event)'
    }
})
export class RdxComboboxTrigger {
    protected readonly rootContext = injectComboboxRootContext();
    private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    constructor() {
        this.rootContext.registerTrigger(this.element);
        inject(DestroyRef).onDestroy(() => this.rootContext.registerTrigger(null));
    }

    // Record whether the opening interaction is touch, so the popup can keep focus off the inner input
    // (and Android's virtual keyboard closed) when the input lives inside the popup.
    onPointerDown(event: PointerEvent): void {
        this.rootContext.setOpenedByTouch(event.pointerType === 'touch');
    }

    onClick(): void {
        if (this.rootContext.open()) {
            this.rootContext.closePopup(true);
        } else {
            this.rootContext.focusInput();
            this.rootContext.openForBrowse();
        }
    }

    onKeydown(event: KeyboardEvent): void {
        if (this.rootContext.disabledState() || this.rootContext.readonly()) {
            return;
        }
        // ArrowDown/ArrowUp open the popup and seed the first/last highlight; the popup's own
        // auto-focus then moves focus to the input (whether it lives inside or outside the popup).
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            // A keyboard open must focus the input, not the popup — clear any prior touch flag.
            this.rootContext.setOpenedByTouch(false);
            this.rootContext.openAndHighlight(event.key === 'ArrowUp' ? 'last' : 'first');
        }
    }
}
