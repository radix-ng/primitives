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
import { _IdGenerator, createContext, getActiveElement, handleAndDispatchCustomEvent } from '@radix-ng/primitives/core';
import { injectSelectContentContext } from './select-content';
import { injectSelectRootContext } from './select-root';
import { valueComparator } from './utils';

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

export const [injectSelectItemContext, provideSelectItemContext] =
    createContext<RdxSelectItemContext>('RdxSelectItemContext');

export type SelectEvent = CustomEvent<{ originalEvent: PointerEvent | KeyboardEvent; value?: any }>;

@Directive({
    selector: '[rdxSelectItem]',
    providers: [provideSelectItemContext(context)],
    hostDirectives: [
        {
            directive: RdxCollectionItem,
            inputs: ['value']
        }
    ],
    host: {
        role: 'option',
        '[attr.tabindex]': 'disabled() ? undefined : -1',
        '[attr.aria-selected]': 'isSelected() ? "checked" : "unchecked"',
        '[attr.data-state]': 'isSelected() ? "checked" : "unchecked"',
        '(pointerdown)': 'onPointerDown($event)',
        '(pointerup)': 'onPointerUp($event)',
        '(pointerleave)': 'onPointerLeave($event)',
        '(pointermove)': 'onPointerMove($event)',
        '(keydown)': 'handleKeyDown($event)'
    }
})
export class RdxSelectItem {
    private readonly rootContext = injectSelectRootContext()!;
    private readonly contentContext = injectSelectContentContext()!;

    private readonly currentElement = inject(ElementRef);

    readonly value = input<any>();

    readonly textValue = input<string>('');

    readonly disabled = input(false, { transform: booleanAttribute });

    readonly textValue$ = linkedSignal(this.textValue);

    readonly isSelected = computed(() =>
        valueComparator(this.rootContext.value(), this.value(), this.rootContext.by())
    );

    readonly textId = inject(_IdGenerator).getId('rdx-select-item-text-');

    private readonly afterNextRender = afterNextRender(() => {
        this.contentContext.itemRefCallback(this.currentElement.nativeElement, this.value(), this.disabled());
    });

    onPointerDown(event: PointerEvent) {
        (event.currentTarget as HTMLElement).focus({ preventScroll: true });
    }

    onPointerUp(event: PointerEvent | KeyboardEvent) {
        if (event.defaultPrevented) return;

        const eventDetail = { originalEvent: event, value: this.value() };
        const SELECT_SELECT = 'select.select';

        handleAndDispatchCustomEvent(
            SELECT_SELECT,
            async (ev: SelectEvent) => {
                if (ev.defaultPrevented) return;

                this.rootContext.onValueChange(this.value());
                if (!this.rootContext.multiple()) {
                    this.rootContext.onOpenChange(false);
                }
            },
            eventDetail
        );
    }

    onPointerLeave(event: PointerEvent) {
        if (event.defaultPrevented) return;

        if (event.currentTarget === getActiveElement()) this.contentContext.onItemLeave?.();
    }

    onPointerMove(event: PointerEvent) {
        if (event.defaultPrevented) return;
        if (this.disabled()) {
            this.contentContext.onItemLeave?.();
        } else {
            // even though safari doesn't support this option, it's acceptable
            // as it only means it might scroll a few pixels when using the pointer.
            (event.currentTarget as HTMLElement | null)?.focus({ preventScroll: true });
        }
    }

    handleKeyDown(event: KeyboardEvent) {
        if (event.defaultPrevented) return;

        // prevent page scroll if using the space key to select an item
        if (event.key === ' ') event.preventDefault();
    }
}
