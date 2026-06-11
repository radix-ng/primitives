import {
    afterNextRender,
    ContentChild,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    InjectionToken,
    Injector,
    OutputRef,
    signal
} from '@angular/core';
import { outputFromObservable, outputToObservable } from '@angular/core/rxjs-interop';
import { RdxCollectionItem, RdxCollectionProvider } from '@radix-ng/primitives/collection';
import { AcceptableValue, createContext, useListHighlight, useScrollLock } from '@radix-ng/primitives/core';
import { provideRdxDismissableLayerConfig, RdxDismissableLayer } from '@radix-ng/primitives/dismissable-layer';
import { RdxFocusScope } from '@radix-ng/primitives/focus-scope';
import { injectSelectRootContext } from './select-root';
import { SELECTION_KEYS, valueComparator } from './utils';

const context = () => {
    const context = inject(RdxSelectPopup);

    return {
        content: context.content,
        viewport: context.viewport,
        isPositioned: context.isPositioned,
        selectedItem: context.selectedItem,
        selectedItemText: context.selectedItemText,
        highlightedItem: context.highlight.highlightedItem,
        isHighlighted: (item: RdxCollectionItem) => context.highlight.highlightedItem() === item,
        highlightItem: (item: RdxCollectionItem) => context.highlight.set(item),
        isKeyboardActive: () => context.isKeyboardActive(),
        setKeyboardActive: (value: boolean) => context.setKeyboardActive(value),
        onViewportChange: (node: any) => {
            context.viewport.set(node);
        },
        onItemLeave: () => {
            context.highlight.clear();
        },
        itemRefCallback: (node: any, value: any, disabled: boolean) => {
            const isFirstValidItem = !context.firstValidItemFoundRef() && !disabled;
            const isSelectedItem = valueComparator(
                context.rootContext.value(),
                value,
                context.rootContext.isItemEqualToValue()
            );

            if (isSelectedItem || isFirstValidItem) {
                context.selectedItem.set(node);
            }

            if (isFirstValidItem) {
                context.firstValidItemFoundRef.set(true);
            }
        },
        itemTextRefCallback: (node: any, value: any, disabled: any) => {
            const isFirstValidItem = !context.firstValidItemFoundRef() && !disabled;
            const isSelectedItem = valueComparator(
                context.rootContext.value(),
                value,
                context.rootContext.isItemEqualToValue()
            );

            if (isSelectedItem || isFirstValidItem) {
                context.selectedItemText.set(node);
            }
        }
    };
};

export type RdxSelectPopupContext = ReturnType<typeof context>;

export const [injectSelectPopupContext, provideSelectPopupContext] = createContext<RdxSelectPopupContext>(
    'RdxSelectPopup',
    'components/select'
);

export interface RdxPositionerImpl {
    placed: OutputRef<any>;
}

export const RDX_SELECT_POSITIONER_TOKEN = new InjectionToken<RdxPositionerImpl>('RDX_SELECT_POSITIONER_TOKEN');

/**
 * The popup listbox. Holds DOM focus while open and navigates with the highlight model
 * (`aria-activedescendant`) — items are not individually focusable. (Renamed to `RdxSelectPopup` in a
 * later step; selector kept here during the navigation migration.)
 *
 * @group Components
 */
@Directive({
    selector: '[rdxSelectPopup]',
    hostDirectives: [RdxFocusScope, RdxDismissableLayer, RdxCollectionProvider],
    providers: [
        provideSelectPopupContext(context),
        provideRdxDismissableLayerConfig(() => {
            return {
                disableOutsidePointerEvents: injectSelectRootContext().modal
            };
        })
    ],
    host: {
        role: 'listbox',
        tabindex: '-1',
        '[attr.aria-activedescendant]': 'highlight.activeId()',
        '[attr.aria-multiselectable]': 'rootContext.multiple() ? "true" : undefined',
        '[attr.data-state]': 'rootContext.open() ? "open" : "closed"',
        '[attr.data-open]': 'rootContext.open() ? "" : undefined',
        '[attr.data-closed]': 'rootContext.open() ? undefined : ""',
        '[attr.data-starting-style]': 'rootContext.transitionStatus() === "starting" ? "" : undefined',
        '[attr.data-ending-style]': 'rootContext.transitionStatus() === "ending" ? "" : undefined',
        '[dir]': 'rootContext.dir()',

        '(keydown)': 'handleKeyDown($event)',

        '[style]': `{
            display: 'flex',
            flexDirection: 'column',
            outline: 'none'
        }`
    }
})
export class RdxSelectPopup {
    private readonly dismissableLayer = inject(RdxDismissableLayer);
    private readonly currentElement = inject(ElementRef);
    private readonly collection = inject(RdxCollectionProvider);
    private readonly injector = inject(Injector);

    readonly rootContext = injectSelectRootContext();

    /** Highlight-model navigation over the collected items (DOM order). */
    readonly highlight = useListHighlight<RdxCollectionItem>({
        items: this.collection.items,
        isNavigable: (item) => !item.disabled(),
        getId: (item) => item.element.id,
        injector: this.injector
    });

    readonly selectedItem = signal<HTMLElement | undefined>(undefined);

    readonly selectedItemText = signal<HTMLElement | undefined>(undefined);

    readonly firstValidItemFoundRef = signal(false);

    readonly viewport = signal<HTMLElement | undefined>(undefined);

    readonly isPositioned = signal(false);

    // Tracks whether the last interaction was the keyboard, so the highlight doesn't jump to an item
    // the cursor happens to rest on when arrow-key navigation scrolls the list.
    private keyboardActive = false;

    /**
     * Event handler called when the escape key is down.
     * Can be prevented.
     */
    readonly escapeKeyDown = outputFromObservable(outputToObservable(this.dismissableLayer.escapeKeyDown));

    /**
     * Event handler called when a `pointerdown` event happens outside of the `DismissableLayer`.
     * Can be prevented.
     */
    readonly pointerDownOutside = outputFromObservable(outputToObservable(this.dismissableLayer.pointerDownOutside));

    readonly content = signal<HTMLElement | null>(null);

    @ContentChild(RDX_SELECT_POSITIONER_TOKEN, { descendants: true })
    set positioner(port: RdxPositionerImpl | undefined) {
        if (port) {
            port.placed.subscribe(() => {
                this.highlightSelectedItem();
                this.scrollSelectedIntoView();
                this.isPositioned.set(true);
            });
        }
    }

    constructor() {
        // Lock page scroll while a modal popup is open (content mounts only while open).
        useScrollLock(this.rootContext.modal);

        // The popup's animation determines when the open/close transition (onOpenChangeComplete) is done.
        const unregisterTransition = this.rootContext.registerTransitionElement(this.currentElement.nativeElement);
        inject(DestroyRef).onDestroy(unregisterTransition);

        this.dismissableLayer.focusOutside.subscribe((e) => e.preventDefault());

        this.dismissableLayer.dismiss.subscribe(() => this.rootContext.onOpenChange(false));

        const focusScope = inject(RdxFocusScope);

        afterNextRender(() => {
            focusScope.unmountAutoFocus.subscribe((event) => {
                if (event.defaultPrevented) return;

                this.rootContext.triggerElement()?.focus({ preventScroll: true });

                event.preventDefault();
            });

            // Focus the popup itself (not an item) — the listbox is the focus owner; items are
            // navigated virtually via aria-activedescendant.
            focusScope.mountAutoFocus.subscribe((event) => {
                event.preventDefault();
                this.content()?.focus({ preventScroll: true });
            });

            this.content.set(this.currentElement.nativeElement.firstElementChild);
        });

        effect((onCleanup) => {
            if (!this.content()) return;

            let pointerMoveDelta = { x: 0, y: 0 };

            const handlePointerMove = (event: PointerEvent) => {
                pointerMoveDelta = {
                    x: Math.abs(Math.round(event.pageX) - (this.rootContext.triggerPointerDownPosRef()?.x ?? 0)),
                    y: Math.abs(Math.round(event.pageY) - (this.rootContext.triggerPointerDownPosRef()?.y ?? 0))
                };
            };

            const handlePointerUp = (event: PointerEvent) => {
                // Prevent options from being untappable on touch devices
                if (event.pointerType === 'touch') return;

                // If the pointer hasn't moved by a certain threshold then we prevent selecting item on `pointerup`.
                if (pointerMoveDelta.x <= 10 && pointerMoveDelta.y <= 10) {
                    event.preventDefault();
                } else {
                    // otherwise, if the event was outside the content, close.
                    if (!this.content()?.contains(event.target as HTMLElement)) this.rootContext.onOpenChange(false);
                }
                document.removeEventListener('pointermove', handlePointerMove);
                this.rootContext.triggerPointerDownPosRef.set(null);
            };

            if (this.rootContext.triggerPointerDownPosRef() !== null) {
                document.addEventListener('pointermove', handlePointerMove);
                document.addEventListener('pointerup', handlePointerUp, {
                    capture: true,
                    once: true
                });
            }

            onCleanup(() => {
                document.removeEventListener('pointermove', handlePointerMove);
                document.removeEventListener('pointerup', handlePointerUp, {
                    capture: true
                });
            });
        });
    }

    /** Highlights the selected item (or the first enabled one) when the popup opens. */
    highlightSelectedItem() {
        const items = this.collection.items();
        const selected = items.find((item) =>
            valueComparator(
                this.rootContext.value(),
                item.value() as AcceptableValue,
                this.rootContext.isItemEqualToValue()
            )
        );
        if (selected) {
            this.highlight.set(selected);
        } else {
            this.highlight.first();
        }
    }

    private scrollSelectedIntoView() {
        this.selectedItem()?.scrollIntoView?.({ block: 'nearest' });
    }

    setKeyboardActive(value: boolean) {
        this.keyboardActive = value;
    }

    isKeyboardActive() {
        return this.keyboardActive;
    }

    handleKeyDown(event: Event) {
        const keyEvent = event as KeyboardEvent;
        if (keyEvent.isComposing) return;

        // select should not be navigated using tab key so we prevent it
        if (keyEvent.key === 'Tab') {
            event.preventDefault();
            return;
        }

        if (SELECTION_KEYS.includes(keyEvent.key)) {
            event.preventDefault();
            const item = this.highlight.highlightedItem();
            if (item && !item.disabled()) {
                this.rootContext.onValueChange(item.value() as AcceptableValue);
                if (!this.rootContext.multiple()) this.rootContext.onOpenChange(false);
            }
            return;
        }

        if (['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(keyEvent.key)) {
            event.preventDefault();
            this.keyboardActive = true;
            switch (keyEvent.key) {
                case 'ArrowDown':
                    this.highlight.next();
                    break;
                case 'ArrowUp':
                    this.highlight.previous();
                    break;
                case 'Home':
                    this.highlight.first();
                    break;
                case 'End':
                    this.highlight.last();
                    break;
            }
        }
    }
}
