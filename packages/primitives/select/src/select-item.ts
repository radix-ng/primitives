import {
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    linkedSignal,
    Signal,
    signal
} from '@angular/core';
import { RdxCompositeListItem } from '@radix-ng/primitives/composite';
import {
    createContext,
    handleAndDispatchCustomEvent,
    injectId,
    isStationaryWebKitPointer
} from '@radix-ng/primitives/core';
import { injectSelectPopupContext } from './select-popup';
import { injectSelectRootContext } from './select-root';
import { SELECTION_KEYS, valueComparator } from './utils';

export interface RdxSelectItemContext<Value = unknown> {
    value: Signal<Value | undefined>;
    disabled: Signal<boolean>;
    isSelected: Signal<boolean>;
    textId: string;
    onItemTextChange: (node: HTMLElement) => () => void;
}

const context = (): RdxSelectItemContext => {
    const context = inject(RdxSelectItem);
    return {
        value: context.value,
        disabled: context.disabled,
        isSelected: context.isSelected,
        textId: context.textId,

        onItemTextChange: (node: HTMLElement) => {
            context.textValue$.set(((context.textValue$() || node.textContent) ?? '').trim());
            return context.registerItemText(node);
        }
    };
};

export const [injectSelectItemContext, provideSelectItemContext] = createContext<RdxSelectItemContext>(
    'RdxSelectItemContext',
    'components/select'
);

export type SelectEvent<Value = unknown> = CustomEvent<{ originalEvent: PointerEvent | KeyboardEvent; value?: Value }>;

@Directive({
    selector: '[rdxSelectItem]',
    exportAs: 'rdxSelectItem',
    providers: [provideSelectItemContext(context)],
    hostDirectives: [RdxCompositeListItem],
    host: {
        role: 'option',
        '[attr.id]': 'id',
        '[attr.aria-selected]': 'isSelected()',
        '[attr.aria-disabled]': 'disabled() ? "true" : undefined',
        '[attr.data-selected]': 'isSelected() ? "" : undefined',
        '[attr.data-highlighted]': 'isHighlighted() ? "" : undefined',
        '[attr.data-disabled]': 'disabled() ? "" : undefined',
        '(pointerup)': 'onPointerUp($event)',
        '(pointerleave)': 'onPointerLeave($event)',
        '(pointermove)': 'onPointerMove($event)'
    }
})
export class RdxSelectItem<Value = unknown> {
    private readonly rootContext = injectSelectRootContext();
    private readonly contentContext = injectSelectPopupContext();
    private readonly listItem = inject(RdxCompositeListItem, { self: true });

    private readonly currentElement = inject<ElementRef<HTMLElement>>(ElementRef);

    readonly value = input<Value>();

    readonly textValue = input<string>('');

    readonly disabled = input(false, { transform: booleanAttribute });

    readonly textValue$ = linkedSignal(this.textValue);
    private readonly itemTextElement = signal<HTMLElement | undefined>(undefined);
    private readonly option = () => ({
        value: this.value(),
        disabled: this.disabled(),
        textContent: (this.itemTextElement()?.textContent ?? this.currentElement.nativeElement.textContent ?? '').trim()
    });

    /** @internal Item text owns cleanup, including replacement before the old view is destroyed. */
    registerItemText(node: HTMLElement): () => void {
        this.itemTextElement.set(node);
        return () => {
            if (this.itemTextElement() === node) this.itemTextElement.set(undefined);
        };
    }

    readonly isSelected = computed(() =>
        valueComparator(
            this.rootContext.value(),
            this.value(),
            this.rootContext.isItemEqualToValue(),
            this.rootContext.multiple()
        )
    );

    /** Highlighted via the highlight model (keyboard / hover), not DOM focus. */
    readonly isHighlighted = computed(() => this.contentContext.isHighlighted(this.currentElement.nativeElement));

    /** Item id, referenced by the popup's `aria-activedescendant`. */
    readonly id = injectId('rdx-select-item-');

    readonly textId = injectId('rdx-select-item-text-');

    private SELECT_SELECT = 'select.select';

    constructor() {
        this.rootContext.onOptionAdd(this.option);
        inject(DestroyRef).onDestroy(() => this.rootContext.onOptionRemove(this.option));
        effect(() => {
            this.listItem.setMetadata({
                value: this.value(),
                disabled: this.disabled(),
                textValue: this.textValue$(),
                textElement: this.itemTextElement()
            });
        });
    }

    onPointerUp(event: PointerEvent | KeyboardEvent) {
        if (!this.rootContext.open()) return;
        if (event.defaultPrevented) return;
        if (this.disabled() || this.rootContext.disabled() || this.rootContext.readOnly()) return;

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
        if (!this.rootContext.open()) return;
        if (event.defaultPrevented) return;
        if (!this.rootContext.highlightItemOnHover()) return;
        this.contentContext.onItemLeave?.();
    }

    onPointerMove(event: PointerEvent) {
        if (!this.rootContext.open()) return;
        if (!this.rootContext.highlightItemOnHover()) return;
        // WebKit fires zero-delta moves while the list scrolls under a still cursor.
        if (isStationaryWebKitPointer(event)) {
            return;
        }
        if (event.defaultPrevented) return;
        // Ignore pointer events synthesized by keyboard-driven scrolling (don't steal the highlight).
        if (this.contentContext.isKeyboardActive()) {
            this.contentContext.setKeyboardActive(false);
            return;
        }
        if (!this.disabled()) {
            this.contentContext.highlightItem(this.currentElement.nativeElement);
        }
    }

    handleKeyDown(event: Event) {
        const keyEvent = event as KeyboardEvent;
        if (event.defaultPrevented) return;
        if (SELECTION_KEYS.includes(keyEvent.key)) this.onPointerUp(keyEvent);
    }
}
