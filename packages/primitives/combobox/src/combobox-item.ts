import {
    afterNextRender,
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    ElementRef,
    inject,
    input,
    signal
} from '@angular/core';
import { AcceptableValue, createContext, injectId } from '@radix-ng/primitives/core';
import { injectComboboxGroupContext } from './combobox-group';
import { ComboboxItemRef, injectComboboxRootContext } from './combobox-root';

const itemContext = () => {
    const item = inject(RdxComboboxItem);
    return {
        isSelected: item.isSelected,
        isHighlighted: item.isHighlighted,
        disabled: item.disabled,
        value: item.value
    };
};

export type RdxComboboxItemContext = ReturnType<typeof itemContext>;

export const [injectComboboxItemContext, provideComboboxItemContext] =
    createContext<RdxComboboxItemContext>('RdxComboboxItemContext');

/**
 * A selectable option. Registers itself with the root for filtering and navigation. Highlight is
 * virtual (`data-highlighted` + `aria-activedescendant` on the input) — items never take DOM focus.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxComboboxItem]',
    exportAs: 'rdxComboboxItem',
    providers: [provideComboboxItemContext(itemContext)],
    host: {
        role: 'option',
        '[attr.id]': 'id',
        '[attr.aria-selected]': 'isSelected()',
        '[attr.aria-disabled]': 'disabled() ? "true" : undefined',
        '[attr.data-selected]': 'isSelected() ? "" : undefined',
        '[attr.data-highlighted]': 'isHighlighted() ? "" : undefined',
        '[attr.data-disabled]': 'disabled() ? "" : undefined',
        '[hidden]': '!isVisible()',
        '[attr.data-hidden]': 'isVisible() ? undefined : ""',
        '(pointerdown)': 'onPointerDown($event)',
        '(mousedown)': 'onPointerDown($event)',
        '(pointerup)': 'onPointerUp()',
        '(pointermove)': 'onPointerMove()'
    }
})
export class RdxComboboxItem implements ComboboxItemRef {
    private readonly rootContext = injectComboboxRootContext();

    readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    readonly id = injectId('rdx-combobox-item-');

    /** The option's value. */
    readonly value = input.required<AcceptableValue>();

    /** Explicit text matched against the query. Defaults to the element's text content. */
    readonly textValueInput = input<string>('', { alias: 'textValue' });

    /** Whether the option is disabled. */
    readonly disabled = input(false, { transform: booleanAttribute });

    private readonly autoTextValue = signal('');

    readonly textValue = computed(() => this.textValueInput() || this.autoTextValue());

    readonly isVisible = computed(() => this.rootContext.isVisible(this));
    readonly isSelected = computed(() => this.rootContext.isSelected(this.value()));
    readonly isHighlighted = computed(() => this.rootContext.highlightedItem() === this);

    private readonly group = injectComboboxGroupContext(true);

    constructor() {
        const destroyRef = inject(DestroyRef);

        afterNextRender(() => {
            if (!this.textValueInput()) {
                // Derive the match/label text from the element, excluding decorative indicator text
                // (e.g. a checkmark) so it doesn't pollute filtering or the input label.
                const clone = this.element.cloneNode(true) as HTMLElement;
                clone.querySelectorAll('[rdxComboboxItemIndicator]').forEach((node) => node.remove());
                this.autoTextValue.set(clone.textContent?.trim() ?? '');
            }
            this.rootContext.registerItem(this);
            this.group?.registerItem(this);
        });

        destroyRef.onDestroy(() => {
            this.rootContext.unregisterItem(this);
            this.group?.unregisterItem(this);
        });
    }

    onPointerDown(event: MouseEvent): void {
        // Keep focus on the input; prevent the item from stealing focus on pointer/mouse down.
        event.preventDefault();
        this.rootContext.setKeyboardActive(false);
    }

    onPointerUp(): void {
        this.rootContext.select(this);
    }

    onPointerMove(): void {
        // Ignore the first move after keyboard navigation: arrow keys scroll the list under a still
        // cursor, and the resulting pointer event must not yank the highlight off the keyboard target.
        if (this.rootContext.isKeyboardActive()) {
            this.rootContext.setKeyboardActive(false);
            return;
        }
        if (!this.disabled() && this.isVisible()) {
            this.rootContext.highlight.set(this);
        }
    }
}
