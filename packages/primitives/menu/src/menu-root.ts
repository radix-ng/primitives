import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    model,
    output,
    signal,
    Signal,
    untracked
} from '@angular/core';
import {
    BooleanInput,
    createContext,
    createFloatingRootContext,
    provideFloatingRootContext,
    provideFloatingTree,
    RdxFloatingRootContext,
    useTransitionStatus
} from '@radix-ng/primitives/core';
import { RdxPopper } from '@radix-ng/primitives/popper';

export type RdxMenuTransitionStatus = 'starting' | 'ending' | undefined;
/**
 * How focus moves into the popup when it opens.
 * - `'first'` / `'last'` — focus and highlight the first / last item (keyboard opening).
 * - `'popup'` — focus the popup container without highlighting any item (pointer opening, e.g. a
 *   context menu opened by right click).
 * - `false` — leave focus on the trigger.
 */
export type RdxMenuAutoFocus = 'first' | 'last' | 'popup' | false;
export type RdxMenuAutoFocusInput = boolean | RdxMenuAutoFocus;
export type RdxMenuOrientation = 'horizontal' | 'vertical';

/**
 * What kind of parent a menu has (Base UI `MenuParent.type`). Drives the per-kind dismissal / focus /
 * backdrop / scroll-lock policy:
 * - `'menu'` — a **submenu** (its parent is another menu).
 * - `'menubar'` — a menu coordinated by a `Menubar`.
 * - `'context-menu'` — the root of a `ContextMenu` (opened at the pointer).
 * - `undefined` — a standalone menu (a plain dropdown).
 */
export type RdxMenuParentType = 'menu' | 'menubar' | 'context-menu' | undefined;

/**
 * Why a menu's open state changed (Base UI open-change `reason`). Read by the per-kind policy — e.g. a
 * `'trigger-hover'` open suppresses the modal backdrop / scroll-lock, and the dismissal reason decides
 * return-focus.
 */
export type RdxMenuOpenChangeReason =
    | 'trigger-press'
    | 'trigger-hover'
    | 'trigger-focus'
    | 'list-navigation'
    | 'sibling-open'
    | 'escape-key'
    | 'outside-press'
    | 'focus-out'
    | 'none';

export interface RdxMenuRootContext {
    isOpen: Signal<boolean>;
    disabled: Signal<boolean>;
    modal: Signal<boolean>;
    loopFocus: Signal<boolean>;
    highlightItemOnHover: Signal<boolean>;
    orientation: Signal<RdxMenuOrientation>;
    closeParentOnEsc: Signal<boolean>;
    /** Whether the popup should focus its first item when it opens. */
    autoFocus: Signal<RdxMenuAutoFocus>;
    isSubmenu: Signal<boolean>;
    /** What kind of parent this menu has (ADR 0015/0017 parity) — drives the per-kind policy. */
    parentType: Signal<RdxMenuParentType>;
    /** The reason for the most recent open-change (Base UI open-change `reason`). */
    lastOpenChangeReason: Signal<RdxMenuOpenChangeReason>;
    /** Whether the current open was initiated by touch (ADR 0016 §3 — gates the anchored scroll lock). */
    openedByTouch: Signal<boolean>;
    hasTriggerInteractionHandler: Signal<boolean>;
    trigger: Signal<HTMLElement | undefined>;
    /** The popup element, once mounted. Used by submenu safe-polygon geometry. */
    popupElement: Signal<HTMLElement | undefined>;
    transitionStatus: Signal<RdxMenuTransitionStatus>;
    close: (reason?: RdxMenuOpenChangeReason, event?: Event) => void;
    /** Close this menu and every ancestor — used by item selection (the whole menu dismisses). */
    closeEntireMenu: (reason?: RdxMenuOpenChangeReason, event?: Event) => void;
    toggle: (reason?: RdxMenuOpenChangeReason, event?: Event) => void;
    show: (autoFocus?: RdxMenuAutoFocusInput, reason?: RdxMenuOpenChangeReason, event?: Event) => void;
    /** Open the menu without moving focus into the popup (used for menubar hover-switching). */
    showWithoutAutoFocus: (reason?: RdxMenuOpenChangeReason, event?: Event) => void;
    registerTrigger: (el: HTMLElement) => () => void;
    registerPopup: (el: HTMLElement) => () => void;
    registerTransitionElement: (element: HTMLElement) => () => void;
    registerPopupArrowNavigationHandler: (handler: (offset: 1 | -1) => boolean) => () => void;
    registerTriggerInteractionHandler: (handler: RdxMenuTriggerInteractionHandler) => () => void;
    markAsSubmenu: () => void;
    /** Marks this menu as the root of a Context Menu (called by `RdxContextMenuRoot`). */
    markAsContextMenu: () => void;
    closeParent: () => void;
    handlePopupArrowNavigation: (offset: 1 | -1) => boolean;
    handleTriggerInteraction: (interaction: RdxMenuTriggerInteraction) => boolean;
}

export type RdxMenuTriggerInteraction =
    | { type: 'click' }
    | { type: 'pointerenter'; event: PointerEvent }
    | { type: 'arrowdown'; event: Event }
    | { type: 'arrowup'; event: Event }
    | { type: 'arrowleft'; event: Event }
    | { type: 'arrowright'; event: Event }
    | { type: 'home'; event: Event }
    | { type: 'end'; event: Event }
    | { type: 'escape'; event: Event };

export type RdxMenuTriggerInteractionHandler = (interaction: RdxMenuTriggerInteraction) => boolean;

export const [injectRdxMenuRootContext, provideRdxMenuRootContext] = createContext<RdxMenuRootContext>(
    'RdxMenuRootContext',
    'components/menu'
);

function buildContext(instance: RdxMenuRoot): RdxMenuRootContext {
    return {
        isOpen: instance.open,
        disabled: instance.effectiveDisabled,
        modal: instance.effectiveModal,
        loopFocus: instance.loopFocus,
        highlightItemOnHover: instance.highlightItemOnHover,
        orientation: instance.orientation,
        closeParentOnEsc: instance.closeParentOnEsc,
        autoFocus: instance.autoFocus.asReadonly(),
        isSubmenu: instance.isSubmenu.asReadonly(),
        parentType: instance.parentType,
        lastOpenChangeReason: instance.lastOpenChangeReason.asReadonly(),
        openedByTouch: instance.openedByTouch.asReadonly(),
        hasTriggerInteractionHandler: instance.hasTriggerInteractionHandler.asReadonly(),
        trigger: instance.trigger.asReadonly(),
        popupElement: instance.popupElement.asReadonly(),
        transitionStatus: instance.transitionStatus,
        close: (reason, event) => instance.close(reason, event),
        closeEntireMenu: (reason, event) => instance.closeEntireMenu(reason, event),
        toggle: (reason, event) => instance.toggle(reason, event),
        show: (autoFocus, reason, event) => instance.show(autoFocus, reason, event),
        showWithoutAutoFocus: (reason, event) => instance.show(false, reason, event),
        registerTrigger: (el) => instance.registerTrigger(el),
        registerPopup: (el) => instance.registerPopup(el),
        registerTransitionElement: (el) => instance.registerTransitionElement(el),
        registerPopupArrowNavigationHandler: (handler) => instance.registerPopupArrowNavigationHandler(handler),
        registerTriggerInteractionHandler: (handler) => instance.registerTriggerInteractionHandler(handler),
        markAsSubmenu: () => instance.markAsSubmenu(),
        markAsContextMenu: () => instance.markAsContextMenu(),
        closeParent: () => instance.closeParent(),
        handlePopupArrowNavigation: (offset) => instance.handlePopupArrowNavigation(offset),
        handleTriggerInteraction: (interaction) => instance.handleTriggerInteraction(interaction)
    };
}

const contextFactory = () => buildContext(inject(RdxMenuRoot));

/**
 * Groups all parts of a menu.
 */
@Directive({
    selector: '[rdxMenuRoot],[rdxMenuSubmenuRoot]',
    exportAs: 'rdxMenuRoot',
    providers: [
        provideRdxMenuRootContext(contextFactory),
        // New floating foundation (ADR 0015/0017). Inherit-or-create the tree so a submenu shares its
        // parent menu's tree; the per-popup root context bridges open / triggers / reference.
        provideFloatingTree(),
        provideFloatingRootContext(() => inject(RdxMenuRoot).floatingContext)
    ],
    hostDirectives: [RdxPopper]
})
export class RdxMenuRoot {
    private readonly popper = inject(RdxPopper);
    private readonly parentRoot = inject(RdxMenuRoot, { optional: true, skipSelf: true });

    /**
     * The shared per-popup floating context (ADR 0015 §1) — `open` mirrors this menu's open state, the
     * trigger registry is bridged from {@link registerTrigger}, and the reference / floating elements are
     * set by the trigger / popup. The new dismissal engine reads this once the popup migrates.
     */
    readonly floatingContext: RdxFloatingRootContext = createFloatingRootContext({
        ownerDocument: inject(ElementRef).nativeElement.ownerDocument,
        open: () => this.open()
    });

    /** Shared open/close transition state machine (completes on the real animationend). */
    private readonly transition = useTransitionStatus((open) => this.onOpenChangeComplete.emit(open));

    private registeredTrigger: HTMLElement | undefined;
    private popupArrowNavigationHandler: ((offset: 1 | -1) => boolean) | undefined;
    private triggerInteractionHandler: RdxMenuTriggerInteractionHandler | undefined;
    private hasAppliedDefaultOpen = false;

    /** Whether the menu is currently open. */
    readonly open = model(false);

    /** Whether the menu is initially open. */
    readonly defaultOpen = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Whether interactions with the menu are disabled. */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Whether the menu should block outside interactions and page scrolling.
     * Nested menus are always non-modal.
     */
    readonly modal = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

    /** Whether keyboard navigation wraps at list boundaries. */
    readonly loopFocus = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

    /** Whether moving the pointer over items should highlight them. */
    readonly highlightItemOnHover = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

    /** The menu orientation. */
    readonly orientation = input<RdxMenuOrientation>('vertical');

    /** Whether pressing Escape inside a submenu closes the whole menu chain. */
    readonly closeParentOnEsc = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Emits when the open state changes. */
    readonly onOpenChange = output<boolean>();

    /** Emits when the open/close CSS transition or animation finishes. */
    readonly onOpenChangeComplete = output<boolean>();

    readonly trigger = signal<HTMLElement | undefined>(undefined);
    readonly popupElement = signal<HTMLElement | undefined>(undefined);
    readonly transitionStatus = this.transition.status;
    /** Whether the popup grabs focus when it opens. Set false for menubar hover-switching. */
    readonly autoFocus = signal<RdxMenuAutoFocus>('first');
    readonly isSubmenu = signal(false);
    /** Set by `RdxContextMenuRoot` (it composes this root) — distinguishes a context menu from a dropdown. */
    readonly isContextMenu = signal(false);
    readonly hasTriggerInteractionHandler = signal(false);

    /**
     * What kind of parent this menu has (Base UI `MenuParent.type`). A submenu wins over everything (its
     * parent is a menu); otherwise a context-menu marker, then a menubar (detected by the trigger
     * interaction handler the menubar registers), else a standalone dropdown.
     */
    readonly parentType: Signal<RdxMenuParentType> = computed(() => {
        if (this.isSubmenu()) {
            return 'menu';
        }
        if (this.isContextMenu()) {
            return 'context-menu';
        }
        if (this.hasTriggerInteractionHandler()) {
            return 'menubar';
        }
        return undefined;
    });

    /** The reason for the most recent open-change (Base UI open-change `reason`), for the per-kind policy. */
    readonly lastOpenChangeReason = signal<RdxMenuOpenChangeReason>('none');

    /** Whether the current open was initiated by **touch** (ADR 0016 §3 — gates the anchored scroll lock). */
    readonly openedByTouch = signal(false);

    readonly effectiveDisabled: Signal<boolean> = computed(
        () => this.disabled() || (this.parentRoot?.effectiveDisabled() ?? false)
    );
    readonly effectiveModal = computed(() => this.modal() && !this.isSubmenu());
    readonly state = computed(() => (this.open() ? 'open' : 'closed'));

    constructor() {
        effect(() => {
            const defaultOpen = this.defaultOpen();

            if (!this.hasAppliedDefaultOpen && defaultOpen) {
                this.hasAppliedDefaultOpen = true;
                this.open.set(defaultOpen);
            }
        });

        effect(() => this.popper.anchorOverride.set(this.trigger()));

        // Keep the dismissal reference (the active trigger) in sync so an outside-press / focus on the
        // trigger counts as "inside" and never dismisses (ADR 0015).
        effect(() => this.floatingContext.setReferenceElement(this.trigger() ?? null));

        let previousOpen = this.open();
        effect(() => {
            const open = this.open();
            if (open !== previousOpen) {
                previousOpen = open;
                untracked(() => this.transition.start(open));
            }
        });
    }

    show(autoFocus: RdxMenuAutoFocusInput = 'first', reason: RdxMenuOpenChangeReason = 'none', event?: Event) {
        if (this.effectiveDisabled()) {
            return;
        }

        this.autoFocus.set(autoFocus === true ? 'first' : autoFocus);
        if (!this.open()) {
            this.lastOpenChangeReason.set(reason);
            // Record whether this open came from touch (ADR 0016 §3). Hover / mouse / keyboard all resolve
            // to false (no `'touch'` pointer type), so only a genuine touch open gates the anchored lock.
            this.openedByTouch.set((event as PointerEvent | undefined)?.pointerType === 'touch');
            this.open.set(true);
            this.onOpenChange.emit(true);
            // Publish reason + native event on the per-popup floating channel (Base UI open-change) so the
            // dismissal / future focus policy can read why the menu opened (e.g. hover vs press).
            this.floatingContext.events.emit('openchange', { open: true, reason, event });
        }
    }

    close(reason: RdxMenuOpenChangeReason = 'none', event?: Event) {
        if (this.open()) {
            this.lastOpenChangeReason.set(reason);
            this.open.set(false);
            this.onOpenChange.emit(false);
            this.floatingContext.events.emit('openchange', { open: false, reason, event });
        }
    }

    toggle(reason: RdxMenuOpenChangeReason = 'trigger-press', event?: Event) {
        if (this.effectiveDisabled()) {
            return;
        }

        if (this.open()) {
            this.close(reason, event);
        } else {
            this.show('first', reason, event);
        }
    }

    markAsContextMenu(): void {
        this.isContextMenu.set(true);
    }

    /**
     * Close this menu **and every ancestor menu** in the chain. Selecting an item dismisses the whole
     * menu, not just the innermost submenu (a submenu's `close()` would leave its parents open).
     */
    closeEntireMenu(reason: RdxMenuOpenChangeReason = 'none', event?: Event): void {
        this.close(reason, event);
        this.parentRoot?.closeEntireMenu(reason, event);
    }

    registerTrigger(el: HTMLElement): () => void {
        this.registeredTrigger = el;
        this.trigger.set(el);
        this.floatingContext.triggers.add(el);
        return () => {
            this.floatingContext.triggers.delete(el);
            if (this.registeredTrigger === el) {
                this.registeredTrigger = undefined;
                this.trigger.set(undefined);
            }
        };
    }

    registerPopup(el: HTMLElement): () => void {
        this.popupElement.set(el);
        return () => {
            if (this.popupElement() === el) {
                this.popupElement.set(undefined);
            }
        };
    }

    registerTransitionElement(element: HTMLElement): () => void {
        return this.transition.registerElement(element);
    }

    registerPopupArrowNavigationHandler(handler: (offset: 1 | -1) => boolean): () => void {
        this.popupArrowNavigationHandler = handler;

        return () => {
            if (this.popupArrowNavigationHandler === handler) {
                this.popupArrowNavigationHandler = undefined;
            }
        };
    }

    handlePopupArrowNavigation(offset: 1 | -1): boolean {
        return this.popupArrowNavigationHandler?.(offset) ?? false;
    }

    registerTriggerInteractionHandler(handler: RdxMenuTriggerInteractionHandler): () => void {
        this.triggerInteractionHandler = handler;
        this.hasTriggerInteractionHandler.set(true);

        return () => {
            if (this.triggerInteractionHandler === handler) {
                this.triggerInteractionHandler = undefined;
                this.hasTriggerInteractionHandler.set(false);
            }
        };
    }

    handleTriggerInteraction(interaction: RdxMenuTriggerInteraction): boolean {
        return this.triggerInteractionHandler?.(interaction) ?? false;
    }

    markAsSubmenu(): void {
        this.isSubmenu.set(true);
    }

    closeParent(): void {
        this.trigger()?.dispatchEvent(new CustomEvent('rdx-menu-close-parent', { bubbles: true }));
    }
}
