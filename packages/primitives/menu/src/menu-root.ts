import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    ElementRef,
    inject,
    InjectionToken,
    input,
    model,
    output,
    signal,
    Signal,
    untracked
} from '@angular/core';
import {
    BooleanInput,
    createCancelableChangeEventDetails,
    createContext,
    createFloatingRootContext,
    Direction,
    provideFloatingRootContext,
    provideFloatingTree,
    RdxCancelableChangeEventDetails,
    RdxFloatingRootContext,
    useTransitionStatus
} from '@radix-ng/primitives/core';
import { injectDirection } from '@radix-ng/primitives/direction-provider';
import { getInteractionTypeFromEvent, RdxInteractionType } from '@radix-ng/primitives/floating-focus-manager';
import { RdxPopper } from '@radix-ng/primitives/popper';
import { getFocusableMenuItems } from './menu-focus';

export type RdxMenuTransitionStatus = 'starting' | 'ending' | undefined;
/**
 * Why an open/close happened instantly (no transition). Mirrors Base UI's menu `data-instant`:
 * `'click'` (opened by click/keyboard), `'dismiss'` (closed by Escape / outside-press / focus-out),
 * `'group'`, or `'trigger-change'` (menubar switching between sibling menus).
 */
export type RdxMenuInstantType = 'click' | 'dismiss' | 'group' | 'trigger-change';
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
    | 'cancel-open'
    | 'focus-out'
    | 'none';

export type RdxMenuOpenChangeEventDetails = RdxCancelableChangeEventDetails<RdxMenuOpenChangeReason>;

export interface RdxMenuOpenChange {
    open: boolean;
    trigger: HTMLElement | undefined;
    reason: RdxMenuOpenChangeReason;
    event: Event;
    eventDetails: RdxMenuOpenChangeEventDetails;
}

export interface RdxMenuRootContext {
    isOpen: Signal<boolean>;
    present: Signal<boolean>;
    activeIndex: Signal<number | null>;
    disabled: Signal<boolean>;
    modal: Signal<boolean>;
    loopFocus: Signal<boolean>;
    highlightItemOnHover: Signal<boolean>;
    orientation: Signal<RdxMenuOrientation>;
    dir: Signal<Direction>;
    closeParentOnEsc: Signal<boolean>;
    /** Whether the popup should focus its first item when it opens. */
    autoFocus: Signal<RdxMenuAutoFocus>;
    isSubmenu: Signal<boolean>;
    /** What kind of parent this menu has (ADR 0015/0017 parity) — drives the per-kind policy. */
    parentType: Signal<RdxMenuParentType>;
    /** The reason for the most recent open-change (Base UI open-change `reason`). */
    lastOpenChangeReason: Signal<RdxMenuOpenChangeReason>;
    /** Why the open/close was instant (Base UI `data-instant`), or `undefined` when it animates. */
    instantType: Signal<RdxMenuInstantType | undefined>;
    /** Whether a trigger-originated press may activate an item on the following mouseup. */
    allowMouseUpTrigger: Signal<boolean>;
    /** Whether the current open was initiated by touch (ADR 0016 §3 — gates the anchored scroll lock). */
    openedByTouch: Signal<boolean>;
    openInteractionType: Signal<RdxInteractionType>;
    closeInteractionType: Signal<RdxInteractionType>;
    hasTriggerInteractionHandler: Signal<boolean>;
    trigger: Signal<HTMLElement | undefined>;
    /** The popup element, once mounted. Used by submenu safe-polygon geometry. */
    popupElement: Signal<HTMLElement | undefined>;
    beforeContentFocusGuard: Signal<HTMLElement | null>;
    transitionStatus: Signal<RdxMenuTransitionStatus>;
    close: (reason?: RdxMenuOpenChangeReason, event?: Event) => void;
    setActiveIndex: (index: number | null) => void;
    /** Close this menu and every ancestor — used by item selection (the whole menu dismisses). */
    closeEntireMenu: (reason?: RdxMenuOpenChangeReason, event?: Event) => void;
    toggle: (reason?: RdxMenuOpenChangeReason, event?: Event) => void;
    show: (autoFocus?: RdxMenuAutoFocusInput, reason?: RdxMenuOpenChangeReason, event?: Event) => void;
    /** Open the menu without moving focus into the popup (used for menubar hover-switching). */
    showWithoutAutoFocus: (reason?: RdxMenuOpenChangeReason, event?: Event) => void;
    registerTrigger: (el: HTMLElement) => () => void;
    registerPopup: (el: HTMLElement) => () => void;
    setBeforeContentFocusGuard: (element: HTMLElement | null) => void;
    registerTransitionElement: (element: HTMLElement) => () => void;
    registerPopupArrowNavigationHandler: (handler: (offset: 1 | -1) => boolean) => () => void;
    registerTriggerInteractionHandler: (handler: RdxMenuTriggerInteractionHandler) => () => void;
    markAsSubmenu: () => void;
    /** Marks this menu as the root of a Context Menu (called by `RdxContextMenuRoot`). */
    markAsContextMenu: () => void;
    setAllowMouseUpTrigger: (value: boolean) => void;
    closeParent: () => void;
    handlePopupArrowNavigation: (offset: 1 | -1) => boolean;
    handleTriggerInteraction: (interaction: RdxMenuTriggerInteraction) => boolean;
}

export type RdxMenuTriggerInteraction =
    | { type: 'click' }
    | { type: 'enter'; event: Event }
    | { type: 'space'; event: Event }
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

/**
 * Ambient modality for a menu, provided by a coordinator (e.g. `Menubar`) so its child menus inherit
 * the coordinator's `modal` setting instead of each defaulting independently. A top-level menu prefers
 * this over its own `modal` input when present; submenus stay non-modal regardless.
 */
export const RDX_MENU_AMBIENT_MODAL = new InjectionToken<Signal<boolean>>('RdxMenuAmbientModal');

function buildContext(instance: RdxMenuRoot): RdxMenuRootContext {
    return {
        isOpen: instance.open,
        present: instance.present,
        activeIndex: instance.activeIndex.asReadonly(),
        disabled: instance.effectiveDisabled,
        modal: instance.effectiveModal,
        loopFocus: instance.loopFocus,
        highlightItemOnHover: instance.highlightItemOnHover,
        orientation: instance.orientation,
        dir: instance.dir,
        closeParentOnEsc: instance.closeParentOnEsc,
        autoFocus: instance.autoFocus.asReadonly(),
        isSubmenu: instance.isSubmenu.asReadonly(),
        parentType: instance.parentType,
        lastOpenChangeReason: instance.lastOpenChangeReason.asReadonly(),
        instantType: instance.instantType,
        allowMouseUpTrigger: instance.allowMouseUpTrigger,
        openedByTouch: instance.openedByTouch.asReadonly(),
        openInteractionType: instance.openInteractionType.asReadonly(),
        closeInteractionType: instance.closeInteractionType.asReadonly(),
        hasTriggerInteractionHandler: instance.hasTriggerInteractionHandler.asReadonly(),
        trigger: instance.trigger.asReadonly(),
        popupElement: instance.popupElement.asReadonly(),
        beforeContentFocusGuard: instance.beforeContentFocusGuard.asReadonly(),
        transitionStatus: instance.transitionStatus,
        close: (reason, event) => instance.close(reason, event),
        setActiveIndex: (index) => instance.setActiveIndex(index),
        closeEntireMenu: (reason, event) => instance.closeEntireMenu(reason, event),
        toggle: (reason, event) => instance.toggle(reason, event),
        show: (autoFocus, reason, event) => instance.show(autoFocus, reason, event),
        showWithoutAutoFocus: (reason, event) => instance.show(false, reason, event),
        registerTrigger: (el) => instance.registerTrigger(el),
        registerPopup: (el) => instance.registerPopup(el),
        setBeforeContentFocusGuard: (element) => instance.setBeforeContentFocusGuard(element),
        registerTransitionElement: (el) => instance.registerTransitionElement(el),
        registerPopupArrowNavigationHandler: (handler) => instance.registerPopupArrowNavigationHandler(handler),
        registerTriggerInteractionHandler: (handler) => instance.registerTriggerInteractionHandler(handler),
        markAsSubmenu: () => instance.markAsSubmenu(),
        markAsContextMenu: () => instance.markAsContextMenu(),
        setAllowMouseUpTrigger: (value) => instance.setAllowMouseUpTrigger(value),
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
    readonly parentRoot = inject(RdxMenuRoot, { optional: true, skipSelf: true });
    private readonly providedDirection = injectDirection();
    /** Ambient modality from an enclosing coordinator (e.g. Menubar). Overrides own `modal` for top-level menus. */
    private readonly ambientModal = inject(RDX_MENU_AMBIENT_MODAL, { optional: true });

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

    /** Text direction for submenu arrow-key behavior. Inherited by nested submenu roots. */
    readonly dirInput = input<Direction | undefined>(undefined, { alias: 'dir' });

    /** Whether pressing Escape inside a submenu closes the whole menu chain. */
    readonly closeParentOnEsc = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Emits when the open state changes. */
    readonly onOpenChange = output<RdxMenuOpenChange>();

    /** Emits when the open/close CSS transition or animation finishes. */
    readonly onOpenChangeComplete = output<boolean>();

    readonly trigger = signal<HTMLElement | undefined>(undefined);
    readonly popupElement = signal<HTMLElement | undefined>(undefined);
    readonly beforeContentFocusGuard = signal<HTMLElement | null>(null);
    readonly transitionStatus = this.transition.status;
    readonly activeIndex = signal<number | null>(null);
    /** Whether the popup grabs focus when it opens. Set false for menubar hover-switching. */
    readonly autoFocus = signal<RdxMenuAutoFocus>('first');
    readonly isSubmenu = signal(false);
    /** Set by `RdxContextMenuRoot` (it composes this root) — distinguishes a context menu from a dropdown. */
    readonly isContextMenu = signal(false);
    readonly hasTriggerInteractionHandler = signal(false);
    private readonly preventUnmountOnClose = signal(false);

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
    private readonly localAllowMouseUpTrigger = signal(false);
    readonly allowMouseUpTrigger: Signal<boolean> = computed(
        () => this.parentRoot?.allowMouseUpTrigger() ?? this.localAllowMouseUpTrigger()
    );

    /** Whether the current open was initiated by **touch** (ADR 0016 §3 — gates the anchored scroll lock). */
    readonly openedByTouch = signal(false);
    readonly openInteractionType = signal<RdxInteractionType>(null);
    readonly closeInteractionType = signal<RdxInteractionType>(null);

    readonly effectiveDisabled: Signal<boolean> = computed(
        () => this.disabled() || (this.parentRoot?.effectiveDisabled() ?? false)
    );
    readonly dir: Signal<Direction> = computed(() => {
        return this.dirInput() ?? this.parentRoot?.dir() ?? this.providedDirection();
    });
    readonly effectiveModal = computed(() => (this.ambientModal?.() ?? this.modal()) && !this.isSubmenu());
    readonly state = computed(() => (this.open() ? 'open' : 'closed'));
    readonly present = computed(() => this.open() || this.preventUnmountOnClose());

    /** Base UI `data-instant`: the open/close reason classified into the instant-suppression bucket. */
    readonly instantType = computed<RdxMenuInstantType | undefined>(() => {
        const reason = this.lastOpenChangeReason();
        if (this.open()) {
            if (reason === 'sibling-open') return 'trigger-change';
            if (reason === 'trigger-press' || reason === 'trigger-focus' || reason === 'list-navigation') {
                return 'click';
            }
            return undefined;
        }
        if (
            reason === 'escape-key' ||
            reason === 'outside-press' ||
            reason === 'focus-out' ||
            reason === 'cancel-open'
        ) {
            return 'dismiss';
        }
        return undefined;
    });

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

        effect(() => {
            if (this.open() && this.preventUnmountOnClose()) {
                this.preventUnmountOnClose.set(false);
            }
        });

        effect(() => {
            if (!this.open()) {
                this.activeIndex.set(null);
            }
        });

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

        const nextAutoFocus = autoFocus === true ? 'first' : autoFocus;
        this.autoFocus.set(nextAutoFocus);

        if (this.open()) {
            this.focusOpenPopup(nextAutoFocus);
            return;
        }

        if (!this.open()) {
            const change = this.createOpenChangeEvent(true, reason, event);
            this.onOpenChange.emit(change.payload);

            if (change.eventDetails.isCanceled()) {
                return;
            }

            this.lastOpenChangeReason.set(reason);
            // Record whether this open came from touch (ADR 0016 §3). Hover / mouse / keyboard all resolve
            // to false (no `'touch'` pointer type), so only a genuine touch open gates the anchored lock.
            this.openedByTouch.set((event as PointerEvent | undefined)?.pointerType === 'touch');
            this.openInteractionType.set(getInteractionTypeFromEvent(event));
            this.preventUnmountOnClose.set(false);
            this.open.set(true);
            // Publish reason + native event on the per-popup floating channel (Base UI open-change) so the
            // dismissal / future focus policy can read why the menu opened (e.g. hover vs press).
            this.floatingContext.events.emit('openchange', { open: true, reason, event: change.eventDetails.event });
        }
    }

    close(reason: RdxMenuOpenChangeReason = 'none', event?: Event) {
        if (this.open()) {
            const change = this.createOpenChangeEvent(false, reason, event);
            this.onOpenChange.emit(change.payload);

            if (change.eventDetails.isCanceled()) {
                return;
            }

            this.setAllowMouseUpTrigger(false);
            this.lastOpenChangeReason.set(reason);
            this.closeInteractionType.set(getInteractionTypeFromEvent(event));
            this.preventUnmountOnClose.set(change.shouldPreventUnmountOnClose());
            this.open.set(false);
            this.floatingContext.events.emit('openchange', { open: false, reason, event: change.eventDetails.event });
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

    setActiveIndex(index: number | null): void {
        if (this.effectiveDisabled() && index !== null) {
            return;
        }

        if (this.activeIndex() !== index) {
            this.activeIndex.set(index);
        }
    }

    setAllowMouseUpTrigger(value: boolean): void {
        if (this.parentRoot) {
            this.parentRoot.setAllowMouseUpTrigger(value);
            return;
        }

        this.localAllowMouseUpTrigger.set(value);
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

    setBeforeContentFocusGuard(element: HTMLElement | null): void {
        this.beforeContentFocusGuard.set(element);
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

    private createOpenChangeEvent(open: boolean, reason: RdxMenuOpenChangeReason, event?: Event) {
        const change = createCancelableChangeEventDetails(
            reason,
            event ?? new Event('menu.open-change'),
            this.trigger()
        );

        return {
            eventDetails: change.eventDetails,
            shouldPreventUnmountOnClose: change.shouldPreventUnmountOnClose,
            payload: {
                open,
                trigger: change.eventDetails.trigger,
                reason: change.eventDetails.reason,
                event: change.eventDetails.event,
                eventDetails: change.eventDetails
            } satisfies RdxMenuOpenChange
        };
    }

    private focusOpenPopup(autoFocus: RdxMenuAutoFocus): void {
        if (autoFocus === false) {
            return;
        }

        const popup = this.popupElement();
        if (!popup) {
            return;
        }

        if (autoFocus === 'popup') {
            this.setActiveIndex(null);
            popup.focus({ preventScroll: true });
            return;
        }

        const items = getFocusableMenuItems(popup);
        const item = autoFocus === 'last' ? items.at(-1) : items[0];
        (item ?? popup).focus({ preventScroll: true });
    }
}
