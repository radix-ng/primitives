import {
    afterNextRender,
    computed,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    InjectionToken,
    Injector,
    output,
    OutputRef,
    signal,
    Signal
} from '@angular/core';
import { RdxCollectionItem, RdxCollectionProvider } from '@radix-ng/primitives/collection';
import {
    AcceptableValue,
    createContext,
    RDX_FLOATING_REGISTRATION,
    RDX_FLOATING_ROOT_CONTEXT,
    RdxFloatingNodeRegistration,
    useAnchoredScrollLock,
    useListHighlight
} from '@radix-ng/primitives/core';
import { RdxDismiss, RdxOutsidePressDomEvent } from '@radix-ng/primitives/dismissable-layer';
import {
    provideFloatingFocusManagerConfig,
    RdxFloatingFocusManager
} from '@radix-ng/primitives/floating-focus-manager';
import { RdxPopperContent } from '@radix-ng/primitives/popper';
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
    /**
     * Whether **item-aligned** positioning is currently active (Base UI `alignItemWithTriggerActive`).
     * `true` only for the item-aligned positioner while open **and not touch-opened** — a touch open
     * falls back to a plain anchored dropdown. The popper positioner omits this (always `false`). The
     * scroll-lock policy locks an item-aligned popup even when `modal === false` (ADR 0016 §2 / AC #3).
     */
    alignItemWithTriggerActive?: Signal<boolean>;
}

export const RDX_SELECT_POSITIONER_TOKEN = new InjectionToken<RdxPositionerImpl>('RDX_SELECT_POSITIONER_TOKEN');

/**
 * The popup listbox. Holds DOM focus while open and navigates with the highlight model
 * (`aria-activedescendant`) — items are not individually focusable.
 *
 * Since ADR 0010 §6 the popup is the **inner** element (the positioner is its ancestor): it carries
 * `role="listbox"`, the `contentId`, and — via the composed {@link RdxPopperContent} — the
 * `data-side` / `data-align` attributes and the until-positioned animation guard previously held by
 * the deleted `rdxSelectPositionerContent`. `RdxPopperContent` also makes the popup the element the
 * `RdxPopperContentWrapper` ancestor reads its content z-index from. In item-aligned mode there is no
 * wrapper, so `RdxPopperContent` no-ops.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxSelectPopup]',
    hostDirectives: [
        RdxPopperContent,
        { directive: RdxFloatingFocusManager, inputs: ['returnFocus: finalFocus'] },
        RdxFloatingNodeRegistration,
        RdxCollectionProvider
    ],
    providers: [
        provideSelectPopupContext(context),
        provideFloatingFocusManagerConfig(() => {
            const rootContext = injectSelectRootContext();
            const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

            return {
                modal: () => false,
                enabled: () => rootContext.open() || rootContext.transitionStatus() === 'ending',
                closeOnFocusOut: () => false,
                // The listbox owns DOM focus; items are navigated virtually through aria-activedescendant.
                initialFocus: () => host,
                restoreFocus: () => true,
                openInteractionType: () => rootContext.openInteractionType(),
                closeInteractionType: () => rootContext.closeInteractionType()
            };
        })
    ],
    host: {
        role: 'listbox',
        tabindex: '-1',
        '[id]': 'rootContext.contentId',
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
    private readonly floatingContext = inject(RDX_FLOATING_ROOT_CONTEXT);
    private readonly registration = inject(RDX_FLOATING_REGISTRATION, { optional: true });
    private readonly currentElement = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly collection = inject(RdxCollectionProvider);
    private readonly injector = inject(Injector);

    readonly rootContext = injectSelectRootContext();

    /**
     * The collected items (DOM order). Exposed so the `item-aligned` positioner — now the popup's
     * **ancestor** — can read them without injecting {@link RdxCollectionProvider} (which the popup
     * provides as a descendant, so an upward `inject` would not find it).
     */
    readonly items = this.collection.items;

    /**
     * Highlight-model navigation over the collected items (DOM order). `loop` is disabled so arrow
     * navigation stops at the first / last item instead of wrapping around — matching native
     * `<select>` behavior.
     */
    readonly highlight = useListHighlight<RdxCollectionItem>({
        items: this.collection.items,
        isNavigable: (item) => !item.disabled(),
        getId: (item) => item.element.id,
        loop: signal(false),
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
    readonly escapeKeyDown = output<KeyboardEvent>();

    /**
     * Event handler called when a `pointerdown` event happens outside of the popup.
     * Can be prevented.
     */
    readonly pointerDownOutside = output<RdxOutsidePressDomEvent>();

    readonly content = signal<HTMLElement | null>(null);

    /**
     * The positioner — now an **ancestor** element — provides {@link RDX_SELECT_POSITIONER_TOKEN}
     * (Popper or item-aligned). We react to its `placed` to highlight and scroll the selected item
     * into view and flag the popup as positioned.
     */
    private readonly positioner = inject(RDX_SELECT_POSITIONER_TOKEN, { optional: true });

    constructor() {
        this.positioner?.placed.subscribe(() => {
            this.highlightSelectedItem();
            this.scrollSelectedIntoView();
            this.isPositioned.set(true);

            // In Popper mode the popup lives inside the positioner, which stays `visibility: hidden`
            // until it is placed — so the mount-time `mountAutoFocus` call no-ops on the hidden
            // listbox and keyboard navigation never starts. Focus it now that it is visible (skip if
            // focus already moved inside, e.g. item-aligned mode or a re-placement).
            const popup = this.content();
            if (popup && !popup.contains(document.activeElement)) {
                popup.focus({ preventScroll: true });
            }
        });

        // Keep the highlighted item in view during keyboard navigation. The highlight model is pure
        // state (it never moves DOM focus or scrolls), so without this the highlight can move past the
        // visible viewport — behind the scroll buttons. Only keyboard moves scroll; hover highlights
        // must not (the cursor is already over a visible item).
        effect(() => {
            const item = this.highlight.highlightedItem();
            if (item && this.keyboardActive) {
                item.element.scrollIntoView?.({ block: 'nearest' });
            }
        });

        // Activation policy (ADR 0016 §2 + §3). Lock page scroll while the popup is OPEN and either modal
        // **or** item-aligned — Base UI `(alignItemWithTriggerActive || modal) && open` (AC #3): an
        // item-aligned select overlays the trigger, so the page must not scroll behind it even when
        // `modal === false`. The gate keys on `open` (not mounted) so it releases at close-start. A
        // **touch** open never uses item-aligned mode (the positioner falls back), so the lock there is
        // driven by `modal` alone and the anchored helper only engages when the popup is viewport-width (§3).
        const itemAlignedActive = computed(() => this.positioner?.alignItemWithTriggerActive?.() ?? false);
        useAnchoredScrollLock(
            computed(() => (itemAlignedActive() || this.rootContext.modal()) && this.rootContext.open()),
            {
                touchOpen: () => this.rootContext.openedByTouch(),
                element: () => this.currentElement.nativeElement
            }
        );

        // The popup's animation determines when the open/close transition (onOpenChangeComplete) is done.
        const unregisterTransition = this.rootContext.registerTransitionElement(this.currentElement.nativeElement);
        inject(DestroyRef).onDestroy(unregisterTransition);

        // The popup (listbox) is this layer's floating element — the inside surface for containment.
        this.floatingContext.setFloatingElement(this.currentElement.nativeElement);

        // Dismissal (ADR 0015): Escape or an outside press closes the select. Focus-out does NOT close it
        // — the listbox holds focus while open (items are navigated virtually), so a focus-out is not a
        // dismissal (the legacy preventDefaulted it too).
        new RdxDismiss(this.floatingContext, () => this.registration?.node() ?? null, {
            escapeKey: () => true,
            outsidePress: () => true,
            focusOutside: () => false,
            onEscapeKeyDown: (event) => this.escapeKeyDown.emit(event),
            onPointerDownOutside: (event) => this.pointerDownOutside.emit(event),
            onDismiss: (reason, event) =>
                this.rootContext.onOpenChange(
                    false,
                    reason === 'escape-key' ? 'escape-key' : reason === 'focus-outside' ? 'focus-out' : 'outside-press',
                    event
                )
        });

        afterNextRender(() => {
            // The popup is now the listbox host itself (no longer the positioner's first child).
            this.content.set(this.currentElement.nativeElement);
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
                    if (!this.content()?.contains(event.target as HTMLElement)) {
                        this.rootContext.onOpenChange(false, 'outside-press', event);
                    }
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

        effect((onCleanup) => {
            if (!itemAlignedActive() || !this.rootContext.open()) {
                return;
            }

            const popup = this.content();
            const view = popup?.ownerDocument.defaultView;

            if (!view) {
                return;
            }

            const handleResize = (event: UIEvent) => {
                this.rootContext.onOpenChange(false, 'window-resize', event);
            };

            view.addEventListener('resize', handleResize);
            onCleanup(() => view.removeEventListener('resize', handleResize));
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
                this.rootContext.onValueChange(item.value() as AcceptableValue, 'item-press', event);
                if (!this.rootContext.multiple()) {
                    this.rootContext.onOpenChange(false, 'item-press', event);
                }
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
