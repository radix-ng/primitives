import {
    afterNextRender,
    booleanAttribute,
    computed,
    Directive,
    ElementRef,
    inject,
    input,
    linkedSignal
} from '@angular/core';
import { RdxCollectionItem } from '@radix-ng/primitives/collection';
import { createContext, handleAndDispatchCustomEvent, injectId } from '@radix-ng/primitives/core';
import { injectSelectPopupContext } from './select-popup';
import { injectSelectRootContext } from './select-root';
import { SELECTION_KEYS, valueComparator } from './utils';

const context = () => {
    const context = inject(RdxSelectItem);
    return {
        value: context.value,
        disabled: context.disabled,
        isSelected: context.isSelected,
        textId: context.textId,

        onItemTextChange: (node: any) => {
            context.textValue$.set(((context.textValue$() || node.textContent) ?? '').trim());
        }
    };
};

export type RdxSelectItemContext = ReturnType<typeof context>;

export const [injectSelectItemContext, provideSelectItemContext] = createContext<RdxSelectItemContext>(
    'RdxSelectItemContext',
    'components/select'
);

export type SelectEvent = CustomEvent<{ originalEvent: PointerEvent | KeyboardEvent; value?: any }>;

@Directive({
    selector: '[rdxSelectItem]',
    exportAs: 'rdxSelectItem',
    providers: [provideSelectItemContext(context)],
    hostDirectives: [
        {
            directive: RdxCollectionItem,
            inputs: ['value', 'disabled']
        }
    ],
    host: {
        role: 'option',
        '[attr.id]': 'id',
        '[attr.aria-selected]': 'isSelected()',
        '[attr.aria-disabled]': 'disabled() ? "true" : undefined',
        '[attr.data-state]': 'isSelected() ? "checked" : "unchecked"',
        '[attr.data-selected]': 'isSelected() ? "" : undefined',
        '[attr.data-highlighted]': 'isHighlighted() ? "" : undefined',
        '[attr.data-disabled]': 'disabled() ? "" : undefined',
        '(pointerup)': 'onPointerUp($event)',
        '(pointerleave)': 'onPointerLeave($event)',
        '(pointermove)': 'onPointerMove($event)'
    }
})
export class RdxSelectItem {
    private readonly rootContext = injectSelectRootContext();
    private readonly contentContext = injectSelectPopupContext();
    private readonly collectionItem = inject(RdxCollectionItem);

    private readonly currentElement = inject(ElementRef);

    readonly value = input<any>();

    readonly textValue = input<string>('');

    readonly disabled = input(false, { transform: booleanAttribute });

    readonly textValue$ = linkedSignal(this.textValue);

    readonly isSelected = computed(() =>
        valueComparator(this.rootContext.value(), this.value(), this.rootContext.isItemEqualToValue())
    );

    /** Highlighted via the highlight model (keyboard / hover), not DOM focus. */
    readonly isHighlighted = computed(() => this.contentContext.isHighlighted(this.collectionItem));

    /** Item id, referenced by the popup's `aria-activedescendant`. */
    readonly id = injectId('rdx-select-item-');

    readonly textId = injectId('rdx-select-item-text-');

    private readonly afterNextRender = afterNextRender(() => {
        this.contentContext.itemRefCallback(this.currentElement.nativeElement, this.value(), this.disabled());
    });

    private SELECT_SELECT = 'select.select';

    onPointerUp(event: PointerEvent | KeyboardEvent) {
        if (event.defaultPrevented) return;
        if (this.disabled()) return;

        const eventDetail = { originalEvent: event, value: this.value() };

        handleAndDispatchCustomEvent(
            this.SELECT_SELECT,
            async (event: SelectEvent) => {
                if (event.defaultPrevented) return;

                this.rootContext.onValueChange(this.value(), 'item-press', event.detail.originalEvent);
                if (!this.rootContext.multiple()) {
                    this.rootContext.onOpenChange(false, 'item-press', event.detail.originalEvent);
                }
            },
            eventDetail
        );
    }

    onPointerLeave(event: Event) {
        if (event.defaultPrevented) return;
        this.contentContext.onItemLeave?.();
    }

    onPointerMove(event: Event) {
        if (event.defaultPrevented) return;
        // Ignore pointer events synthesized by keyboard-driven scrolling (don't steal the highlight).
        if (this.contentContext.isKeyboardActive()) {
            this.contentContext.setKeyboardActive(false);
            return;
        }
        if (!this.disabled()) {
            this.contentContext.highlightItem(this.collectionItem);
        }
    }

    handleKeyDown(event: Event) {
        const keyEvent = event as KeyboardEvent;
        if (event.defaultPrevented) return;
        if (SELECTION_KEYS.includes(keyEvent.key)) this.onPointerUp(keyEvent);
    }
}
