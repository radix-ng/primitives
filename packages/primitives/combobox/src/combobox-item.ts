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

export const [injectComboboxItemContext, provideComboboxItemContext] = createContext<RdxComboboxItemContext>(
    'RdxComboboxItemContext',
    'components/combobox'
);

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
        '[attr.id]': 'elementId()',
        '[attr.aria-selected]': 'isSelected()',
        '[attr.aria-disabled]': 'disabled() ? "true" : undefined',
        '[attr.aria-setsize]': 'ariaSetSize()',
        '[attr.aria-posinset]': 'ariaPosInSet()',
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

    /**
     * The option's index in the list. Required in virtualized mode — it drives the deterministic id
     * (for `aria-activedescendant`), highlight matching, and selection when only a window is mounted.
     */
    readonly index = input<number>();

    protected readonly virtualized = this.rootContext.virtualized;

    private readonly autoTextValue = signal('');

    readonly textValue = computed(() => this.textValueInput() || this.autoTextValue());

    /** Host id: deterministic per-index in virtualized mode, otherwise a generated unique id. */
    protected readonly elementId = computed(() =>
        this.virtualized() ? this.rootContext.itemId(this.index() ?? -1) : this.id
    );

    protected readonly ariaSetSize = computed(() =>
        this.virtualized() ? this.rootContext.filteredItems().length : undefined
    );
    protected readonly ariaPosInSet = computed(() => (this.virtualized() ? (this.index() ?? -1) + 1 : undefined));

    // Virtualized items are always rendered (the consumer only mounts the filtered window).
    readonly isVisible = computed(() => (this.virtualized() ? true : this.rootContext.isVisible(this)));
    readonly isSelected = computed(() => this.rootContext.isSelected(this.value()));
    readonly isHighlighted = computed(() =>
        this.virtualized()
            ? this.rootContext.highlightedIndex() === this.index()
            : this.rootContext.highlightedItem() === this
    );

    private readonly group = injectComboboxGroupContext(true);

    constructor() {
        const destroyRef = inject(DestroyRef);

        afterNextRender(() => {
            // Virtualized items are not registered: the root navigates over `items` data by index, and
            // a windowed item mounting/unmounting must not churn the DOM-ordered registry or `labelFor`.
            if (this.virtualized()) {
                return;
            }
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
            if (this.virtualized()) {
                return;
            }
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
        if (this.virtualized()) {
            this.rootContext.selectIndex(this.index() ?? -1);
        } else {
            this.rootContext.select(this);
        }
    }

    onPointerMove(): void {
        // Ignore the first move after keyboard navigation: arrow keys scroll the list under a still
        // cursor, and the resulting pointer event must not yank the highlight off the keyboard target.
        if (this.rootContext.isKeyboardActive()) {
            this.rootContext.setKeyboardActive(false);
            return;
        }
        if (this.disabled()) {
            return;
        }
        if (this.virtualized()) {
            this.rootContext.highlightIndex(this.index() ?? -1, 'pointer');
        } else if (this.isVisible()) {
            this.rootContext.setHighlight(this, 'pointer');
        }
    }
}
