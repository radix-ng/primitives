import { Directive, ElementRef, inject, input } from '@angular/core';
import { AcceptableValue, createContext } from '@radix-ng/primitives/core';
import { RdxComboboxChips } from './combobox-chips';
import { injectComboboxRootContext } from './combobox-root';

const chipContext = () => {
    const chip = inject(RdxComboboxChip);
    return { value: chip.value };
};

export type RdxComboboxChipContext = ReturnType<typeof chipContext>;

export const [injectComboboxChipContext, provideComboboxChipContext] = createContext<RdxComboboxChipContext>(
    'RdxComboboxChipContext',
    'components/combobox'
);

/**
 * A single selected-value chip. Provide its `value` so {@link RdxComboboxChipRemove} can deselect it.
 * Chips are focusable and navigable with the arrow keys; Backspace / Delete removes the chip.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxComboboxChip]',
    exportAs: 'rdxComboboxChip',
    providers: [provideComboboxChipContext(chipContext)],
    host: {
        role: 'listitem',
        tabindex: '-1',
        '(keydown)': 'onKeydown($event)'
    }
})
export class RdxComboboxChip {
    private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    private readonly chips = inject(RdxComboboxChips, { optional: true });
    private readonly rootContext = injectComboboxRootContext();

    /** The value this chip represents. */
    readonly value = input.required<AcceptableValue>();

    onKeydown(event: KeyboardEvent): void {
        const list = this.chips?.getChips() ?? [];
        const index = list.indexOf(this.element);

        switch (event.key) {
            case 'ArrowLeft':
                if (index > 0) {
                    event.preventDefault();
                    list[index - 1].focus();
                }
                break;
            case 'ArrowRight':
                event.preventDefault();
                if (index < list.length - 1) {
                    list[index + 1].focus();
                } else {
                    this.rootContext.focusInput();
                }
                break;
            case 'Home':
                if (list.length) {
                    event.preventDefault();
                    list[0].focus();
                }
                break;
            case 'End':
                event.preventDefault();
                this.rootContext.focusInput();
                break;
            case 'Backspace':
            case 'Delete': {
                event.preventDefault();
                // The @for tracks by value, so the previous/next chip nodes survive this removal.
                const prev = list[index - 1];
                const next = list[index + 1];
                this.rootContext.removeValue(this.value());
                if (prev) {
                    prev.focus();
                } else if (next) {
                    next.focus();
                } else {
                    this.rootContext.focusInput();
                }
                break;
            }
            case 'Escape':
                this.rootContext.focusInput();
                break;
        }
    }
}
