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
import { RdxCompositeItemRegistration, RdxCompositeList } from '@radix-ng/primitives/composite';
import {
    createContext,
    getActiveElement,
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
import { composedContains } from '@radix-ng/primitives/focus-scope';
import { RdxPopperContent } from '@radix-ng/primitives/popper';
import { injectSelectRootContext } from './select-root';
import { getNextMatch } from './useTypeahead';
import { RdxSelectItemMetadata, SELECTION_KEYS, valueComparator } from './utils';

type RdxSelectCompositeItem = RdxCompositeItemRegistration<RdxSelectItemMetadata>;

export interface RdxSelectPopupContext {
    content: Signal<HTMLElement | null>;
    viewport: Signal<HTMLElement | undefined>;
    isPositioned: Signal<boolean>;
    selectedItem: Signal<HTMLElement | undefined>;
    selectedItemText: Signal<HTMLElement | undefined>;
    items: Signal<RdxSelectCompositeItem[]>;
    highlightedItem: Signal<RdxSelectCompositeItem | null>;
    isHighlighted: (element: HTMLElement) => boolean;
    highlightItem: (element: HTMLElement) => void;
    isKeyboardActive: () => boolean;
    setKeyboardActive: (value: boolean) => void;
    onViewportChange: (node: HTMLElement | undefined) => void;
    onItemLeave: () => void;
}

const context = (): RdxSelectPopupContext => {
    const context = inject(RdxSelectPopup);

    return {
        content: context.content,
        viewport: context.viewport,
        isPositioned: context.isPositioned,
        selectedItem: context.selectedItem,
        selectedItemText: context.selectedItemText,
        items: context.items,
        highlightedItem: context.highlight.highlightedItem,
        isHighlighted: (element: HTMLElement) => context.highlight.highlightedItem()?.element === element,
        highlightItem: (element: HTMLElement) => {
            const item = context.items().find((item) => item.element === element);
            if (item) {
                context.highlight.set(item);
            }
        },
        isKeyboardActive: () => context.isKeyboardActive(),
        setKeyboardActive: (value: boolean) => context.setKeyboardActive(value),
        onViewportChange: (node: HTMLElement | undefined) => {
            context.viewport.set(node);
        },
        onItemLeave: () => {
            context.highlight.clear();
        }
    };
};

export const [injectSelectPopupContext, provideSelectPopupContext] = createContext<RdxSelectPopupContext>(
    'RdxSelectPopup',
    'components/select'
);

export interface RdxPositionerImpl {
    placed: OutputRef<void>;
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
        { directive: RdxFloatingFocusManager, inputs: ['returnFocus: finalFocus', 'closeOnFocusOut'] },
        RdxFloatingNodeRegistration,
        RdxCompositeList
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
                returnFocus: () => () => {
                    const active = getActiveElement(host.ownerDocument);
                    // Pointer opening can leave focus on body before the popup mounts. The default
                    // return target is still the trigger; preserve deliberate focus elsewhere.
                    if (active && active !== host.ownerDocument.body && !composedContains(host, active)) {
                        return false;
                    }
                    return rootContext.triggerElement() ?? true;
                },
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
        '[attr.data-open]': 'rootContext.open() ? "" : undefined',
        '[attr.data-closed]': 'rootContext.open() ? undefined : ""',
        '[attr.data-starting-style]': 'rootContext.transitionStatus() === "starting" ? "" : undefined',
        '[attr.data-ending-style]': 'rootContext.transitionStatus() === "ending" ? "" : undefined',
        '[dir]': 'rootContext.dir()',

        '(keydown)': 'handleKeyDown($event)',

        '[style]': `{
            display: rootContext.autofillProbe() && !rootContext.open() ? 'none' : 'flex',
            flexDirection: 'column',
            outline: 'none'
        }`
    }
})
export class RdxSelectPopup {
    private readonly floatingContext = inject(RDX_FLOATING_ROOT_CONTEXT);
    private readonly registration = inject(RDX_FLOATING_REGISTRATION, { optional: true });
    private readonly currentElement = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly compositeList = inject(RdxCompositeList, { self: true });
    private readonly injector = inject(Injector);
    private readonly focusManager = inject(RdxFloatingFocusManager);

    readonly rootContext = injectSelectRootContext();

    /**
     * The collected items (DOM order). Exposed so the `item-aligned` positioner — now the popup's
     * **ancestor** — can read them without injecting the composite list (which the popup provides as
     * a descendant, so an upward `inject` would not find it).
     */
    readonly items = computed(() => this.compositeList.items() as RdxSelectCompositeItem[]);

    /**
     * Highlight-model navigation over the collected items (DOM order). `loop` is disabled so arrow
     * navigation stops at the first / last item instead of wrapping around — matching native
     * `<select>` behavior.
     */
    readonly highlight = useListHighlight<RdxSelectCompositeItem>({
        items: this.items,
        isNavigable: (item) => !item.metadata()?.disabled,
        getId: (item) => item.element.id,
        loop: signal(false),
        injector: this.injector
    });

    // Derive positioning refs from Angular's reactive collection instead of mount-only callbacks.
    // The same view can be retained across opens while its value or item text changes.
    private readonly positioningItem = computed(() => {
        const items = this.items();
        return (
            items.find((item) =>
                valueComparator(
                    this.rootContext.value(),
                    item.metadata()?.value,
                    this.rootContext.isItemEqualToValue(),
                    this.rootContext.multiple()
                )
            ) ?? items.find((item) => !item.metadata()?.disabled)
        );
    });

    readonly selectedItem = computed(() => this.positioningItem()?.element);

    readonly selectedItemText = computed(() => this.positioningItem()?.metadata()?.textElement);

    readonly viewport = signal<HTMLElement | undefined>(undefined);

    readonly isPositioned = signal(false);

    // Tracks whether the last interaction was the keyboard, so the highlight doesn't jump to an item
    // the cursor happens to rest on when arrow-key navigation scrolls the list.
    private keyboardActive = false;
    private hasHighlightedOpen = false;

    // Typeahead buffer (APG listbox): printable characters accumulate for 1s and jump the highlight to
    // the next item whose text matches.
    private typeaheadSearch = '';
    private typeaheadTimer?: ReturnType<typeof setTimeout>;

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
            if (!this.rootContext.open()) return;
            this.isPositioned.set(true);
            this.highlightSelectedItemAfterPositioned();
        });

        this.focusManager.focusOut.subscribe((event) => {
            if (this.rootContext.open() && !event.defaultPrevented) {
                this.rootContext.onOpenChange(false, 'focus-out', event);
            }
        });

        effect(() => {
            if (!this.rootContext.open()) {
                this.hasHighlightedOpen = false;
                return;
            }

            if (!this.isPositioned() || this.hasHighlightedOpen) {
                return;
            }

            this.highlightSelectedItemAfterPositioned();
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
        inject(DestroyRef).onDestroy(() => clearTimeout(this.typeaheadTimer));

        // The popup (listbox) is this layer's floating element — the inside surface for containment.
        this.floatingContext.setFloatingElement(this.currentElement.nativeElement);

        // Dismissal (ADR 0015) owns Escape / outside press. Optional focus-out closing belongs to
        // the shared focus manager, separately from the popup's virtual navigation model.
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
            if (!this.content() || !this.rootContext.open()) return;

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
                    if (
                        !this.content()?.contains(event.target as HTMLElement) &&
                        !this.floatingContext.triggers.contains(event.target)
                    ) {
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
        const items = this.items();
        const selected = items.find((item) =>
            valueComparator(
                this.rootContext.value(),
                item.metadata()?.value,
                this.rootContext.isItemEqualToValue(),
                this.rootContext.multiple()
            )
        );
        if (selected) {
            this.highlight.set(selected);
        } else {
            this.highlight.first();
        }
    }

    private highlightSelectedItemAfterPositioned() {
        if (this.items().length === 0) {
            return;
        }

        this.highlightSelectedItem();
        this.scrollSelectedIntoView();
        this.hasHighlightedOpen = true;
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
        if (!this.rootContext.open()) return;
        const keyEvent = event as KeyboardEvent;
        if (keyEvent.isComposing) return;

        // Preserve the current default until the AT-gated focus policy change (ADR 0023).
        // Opt-in uses the manager's native portal guards; Shift+Tab closes back to finalFocus.
        if (keyEvent.key === 'Tab') {
            if (!this.focusManager.effectiveCloseOnFocusOut()) event.preventDefault();
            else if (keyEvent.shiftKey && !keyEvent.altKey && !keyEvent.ctrlKey && !keyEvent.metaKey) {
                event.preventDefault();
                this.rootContext.onOpenChange(false, 'focus-out', event);
            }
            return;
        }

        if (SELECTION_KEYS.includes(keyEvent.key)) {
            event.preventDefault();
            const item = this.highlight.highlightedItem();
            const metadata = item?.metadata();
            if (
                item &&
                metadata &&
                !metadata.disabled &&
                !this.rootContext.disabled() &&
                !this.rootContext.readOnly()
            ) {
                this.rootContext.onValueChange(metadata.value, 'item-press', event);
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
            return;
        }

        // Typeahead: a single printable character jumps the highlight to the next matching item.
        if (keyEvent.key.length === 1 && !keyEvent.ctrlKey && !keyEvent.altKey && !keyEvent.metaKey) {
            this.handleTypeahead(keyEvent.key);
        }
    }

    /** Accumulates printable keys for 1s and moves the highlight to the next item whose text matches. */
    private handleTypeahead(key: string) {
        this.typeaheadSearch += key;
        clearTimeout(this.typeaheadTimer);
        this.typeaheadTimer = setTimeout(() => (this.typeaheadSearch = ''), 1000);

        const navigableItems = this.items().filter((item) => !item.metadata()?.disabled);
        const values = navigableItems.map((item) => this.itemText(item));
        const current = this.highlight.highlightedItem();
        const nextMatch = getNextMatch(values, this.typeaheadSearch, current ? this.itemText(current) : undefined);

        if (nextMatch === undefined) {
            return;
        }

        const match = navigableItems[values.indexOf(nextMatch)];
        if (match) {
            this.keyboardActive = true;
            this.highlight.set(match);
        }
    }

    private itemText(item: RdxSelectCompositeItem): string {
        return (item.metadata()?.textValue || item.element.textContent || '').trim();
    }
}
