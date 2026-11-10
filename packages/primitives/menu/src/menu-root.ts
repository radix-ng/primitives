import {
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    InjectionToken,
    input,
    model,
    output,
    signal,
    Signal
} from '@angular/core';
import {
    BooleanInput,
    createCancelableChangeEventDetails,
    createContext,
    createFloatingRootContext,
    createPointerMoveGuard,
    Direction,
    getActiveElement,
    injectId,
    provideFloatingRootContext,
    provideFloatingTree,
    RdxCancelableChangeEventDetails,
    RdxFloatingRootContext,
    RdxPopupLifecycle,
    usePopupLifecycle
} from '@radix-ng/primitives/core';
import { injectDirection } from '@radix-ng/primitives/direction-provider';
import { getInteractionTypeFromEvent, RdxInteractionType } from '@radix-ng/primitives/floating-focus-manager';
import { RdxPopper } from '@radix-ng/primitives/popper';
import { getFocusableMenuItems } from './menu-focus';
import type { MenuSide } from './menu-safe-polygon';

export const RDX_MENU_AMBIENT_DISABLED = new InjectionToken<Signal<boolean>>('RdxMenuAmbientDisabled');

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
    | 'item-press'
    | 'imperative-action'
    | 'none';

export type RdxMenuOpenChangeEventDetails = RdxCancelableChangeEventDetails<RdxMenuOpenChangeReason>;

export interface RdxMenuOpenChange {
    open: boolean;
    trigger: HTMLElement | undefined;
    reason: RdxMenuOpenChangeReason;
    event: Event;
    eventDetails: RdxMenuOpenChangeEventDetails;
}

export interface RdxMenuCoordinator {
    insideElements: () => Array<HTMLElement | undefined>;
    ownsEscape: (event: KeyboardEvent) => boolean;
    returnFocusFrom?: (previous: HTMLElement) => HTMLElement | undefined;
}

export interface RdxMenuRootContext {
    isOpen: Signal<boolean>;
    present: Signal<boolean>;
    activeIndex: Signal<number | null>;
    disabled: Signal<boolean>;
    modal: Signal<boolean>;
    loopFocus: Signal<boolean>;
    highlightItemOnHover: Signal<boolean>;
    isStationaryPointerMove: (event: PointerEvent) => boolean;
    onItemHover: (item: HTMLElement, event: PointerEvent) => void;
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
    /** Whether this menu is a context menu (opened at the pointer rather than from a trigger element). */
    isContextMenu: Signal<boolean>;
    /**
     * Id of the outermost menu in this chain. Every positioner in the tree carries it as
     * `data-rdx-menu-owner`, so an element can be traced back to the menu that owns it even when a
     * submenu is portaled elsewhere in the DOM.
     */
    ownerId: Signal<string>;
    /**
     * Reads — and clears — the cursor position the context-menu gesture started at. An item uses it to
     * recognize the `mouseup` that merely finished the opening right-click and must not select it.
     */
    consumeInitialCursorPoint: () => { x: number; y: number } | null;
    /** Records where a context-menu gesture started; cleared by the first item that consumes it. */
    setInitialCursorPoint: (point: { x: number; y: number } | null) => void;
    /** Whether the current open was initiated by touch (ADR 0016 §3 — gates the anchored scroll lock). */
    openedByTouch: Signal<boolean>;
    openInteractionType: Signal<RdxInteractionType>;
    closeInteractionType: Signal<RdxInteractionType>;
    hasTriggerInteractionHandler: Signal<boolean>;
    triggerInteractionScope: Signal<HTMLElement | undefined>;
    getCoordinatorElements: () => Array<HTMLElement | undefined>;
    ownsCoordinatorEscape: (event: KeyboardEvent) => boolean;
    trigger: Signal<HTMLElement | undefined>;
    contextMenuPreviousFocus: Signal<HTMLElement | undefined>;
    getReturnFocusElement: () => HTMLElement | undefined;
    triggerId: Signal<string | undefined>;
    contentId: Signal<string>;
    defaultContentId: string;
    /** The popup element, once mounted. Used by submenu safe-polygon geometry. */
    popupElement: Signal<HTMLElement | undefined>;
    /**
     * The popup's **physical** placed side (`top`/`bottom`/`left`/`right`) for safe-polygon geometry —
     * never the popup's `data-side`, which is the logical `inline-start`/`inline-end` echo when a logical
     * side was requested and which the geometry cannot interpret.
     */
    popupPhysicalSide: Signal<MenuSide | undefined>;
    beforeContentFocusGuard: Signal<HTMLElement | null>;
    transitionStatus: Signal<RdxMenuTransitionStatus>;
    registerPresence: RdxPopupLifecycle['registerPresence'];
    skipExitAnimation: Signal<boolean>;
    close: (reason?: RdxMenuOpenChangeReason, event?: Event) => void;
    setActiveIndex: (index: number | null) => void;
    /** Close this menu and every ancestor — used by item selection (the whole menu dismisses). */
    closeEntireMenu: (reason?: RdxMenuOpenChangeReason, event?: Event) => void;
    toggle: (reason?: RdxMenuOpenChangeReason, event?: Event) => void;
    show: (autoFocus?: RdxMenuAutoFocusInput, reason?: RdxMenuOpenChangeReason, event?: Event) => void;
    /** Open the menu without moving focus into the popup. */
    showWithoutAutoFocus: (reason?: RdxMenuOpenChangeReason, event?: Event) => void;
    registerTrigger: (el: HTMLElement, getId?: () => string) => () => void;
    registerPopup: (el: HTMLElement, physicalSide?: Signal<MenuSide | undefined>, getId?: () => string) => () => void;
    setBeforeContentFocusGuard: (element: HTMLElement | null) => void;
    registerTransitionElement: (element: HTMLElement) => () => void;
    registerPopupArrowNavigationHandler: (handler: (offset: 1 | -1, event?: KeyboardEvent) => boolean) => () => void;
    registerTriggerInteractionHandler: (
        handler: RdxMenuTriggerInteractionHandler,
        scope?: HTMLElement,
        coordinator?: RdxMenuCoordinator
    ) => () => void;
    markAsSubmenu: () => void;
    /** Marks this menu as the root of a Context Menu (called by `RdxContextMenuRoot`). */
    markAsContextMenu: () => void;
    setAllowMouseUpTrigger: (value: boolean) => void;
    closeParent: () => void;
    handlePopupArrowNavigation: (offset: 1 | -1, event?: KeyboardEvent) => boolean;
    closeForNavigation: (event?: KeyboardEvent, consumeEvent?: boolean) => void;
    handleTriggerInteraction: (interaction: RdxMenuTriggerInteraction) => boolean;
}

export type RdxMenuTriggerInteraction =
    | { type: 'click'; event?: MouseEvent }
    | { type: 'mousedown'; event: MouseEvent }
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
        isStationaryPointerMove: (event) => instance.isStationaryPointerMove(event),
        onItemHover: (item, event) => instance.onItemHover(item, event),
        orientation: instance.orientation,
        dir: instance.dir,
        closeParentOnEsc: instance.closeParentOnEsc,
        autoFocus: instance.autoFocus.asReadonly(),
        isSubmenu: instance.isSubmenu.asReadonly(),
        parentType: instance.parentType,
        lastOpenChangeReason: instance.lastOpenChangeReason.asReadonly(),
        instantType: instance.instantType,
        allowMouseUpTrigger: instance.allowMouseUpTrigger,
        isContextMenu: instance.isContextMenu,
        ownerId: instance.ownerId,
        consumeInitialCursorPoint: () => instance.consumeInitialCursorPoint(),
        setInitialCursorPoint: (point) => instance.setInitialCursorPoint(point),
        openedByTouch: instance.openedByTouch.asReadonly(),
        openInteractionType: instance.openInteractionType.asReadonly(),
        closeInteractionType: instance.closeInteractionType.asReadonly(),
        hasTriggerInteractionHandler: instance.hasTriggerInteractionHandler.asReadonly(),
        triggerInteractionScope: instance.triggerInteractionScope.asReadonly(),
        getCoordinatorElements: () => instance.getCoordinatorElements(),
        ownsCoordinatorEscape: (event) => instance.ownsCoordinatorEscape(event),
        trigger: instance.trigger.asReadonly(),
        contextMenuPreviousFocus: instance.contextMenuPreviousFocus.asReadonly(),
        getReturnFocusElement: () => instance.getReturnFocusElement(),
        triggerId: instance.triggerId,
        contentId: instance.contentId,
        defaultContentId: instance.defaultContentId,
        popupElement: instance.popupElement.asReadonly(),
        popupPhysicalSide: instance.popupPhysicalSide,
        beforeContentFocusGuard: instance.beforeContentFocusGuard.asReadonly(),
        transitionStatus: instance.transitionStatus,
        registerPresence: instance.registerPresence,
        skipExitAnimation: instance.skipExitAnimation,
        close: (reason, event) => instance.close(reason, event),
        setActiveIndex: (index) => instance.setActiveIndex(index),
        closeEntireMenu: (reason, event) => instance.closeEntireMenu(reason, event),
        toggle: (reason, event) => instance.toggle(reason, event),
        show: (autoFocus, reason, event) => instance.show(autoFocus, reason, event),
        showWithoutAutoFocus: (reason, event) => instance.show(false, reason, event),
        registerTrigger: (el, getId) => instance.registerTrigger(el, getId),
        registerPopup: (el, physicalSide, getId) => instance.registerPopup(el, physicalSide, getId),
        setBeforeContentFocusGuard: (element) => instance.setBeforeContentFocusGuard(element),
        registerTransitionElement: (el) => instance.registerTransitionElement(el),
        registerPopupArrowNavigationHandler: (handler) => instance.registerPopupArrowNavigationHandler(handler),
        registerTriggerInteractionHandler: (handler, scope, coordinator) =>
            instance.registerTriggerInteractionHandler(handler, scope, coordinator),
        markAsSubmenu: () => instance.markAsSubmenu(),
        markAsContextMenu: () => instance.markAsContextMenu(),
        setAllowMouseUpTrigger: (value) => instance.setAllowMouseUpTrigger(value),
        closeParent: () => instance.closeParent(),
        handlePopupArrowNavigation: (offset, event) => instance.handlePopupArrowNavigation(offset, event),
        closeForNavigation: (event, consumeEvent) => instance.closeForNavigation(event, consumeEvent),
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
    private readonly childRoots = signal<readonly RdxMenuRoot[]>([]);
    private readonly providedDirection = injectDirection();
    /** Ambient modality from an enclosing coordinator (e.g. Menubar). Overrides own `modal` for top-level menus. */
    private readonly ambientModal = inject(RDX_MENU_AMBIENT_MODAL, { optional: true });
    private readonly ambientDisabled = inject(RDX_MENU_AMBIENT_DISABLED, { optional: true });

    /**
     * The shared per-popup floating context (ADR 0015 §1) — `open` mirrors this menu's open state, the
     * trigger registry is bridged from {@link registerTrigger}, and the reference / floating elements are
     * set by the trigger / popup. The new dismissal engine reads this once the popup migrates.
     */
    readonly floatingContext: RdxFloatingRootContext = createFloatingRootContext({
        ownerDocument: inject(ElementRef).nativeElement.ownerDocument,
        open: () => this.open()
    });

    private registeredTrigger: HTMLElement | undefined;
    private registeredTriggerId?: () => string;
    private registeredPopupId?: () => string;
    private popupArrowNavigationHandler: ((offset: 1 | -1, event?: KeyboardEvent) => boolean) | undefined;
    private triggerInteractionHandler: RdxMenuTriggerInteractionHandler | undefined;
    private hasAppliedDefaultOpen = false;
    private focusBeforeRetainedOpen: HTMLElement | undefined;

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

    /** Emits after opening or accepted close completion, including a pending external exit. */
    readonly onOpenChangeComplete = output<boolean>();

    private readonly lifecycle = usePopupLifecycle(
        this.open,
        (open) => this.onOpenChangeComplete.emit(open),
        'RdxMenuRoot'
    );
    readonly registerPresence = this.lifecycle.registerPresence;
    readonly skipExitAnimation = this.lifecycle.skipExitAnimation;

    readonly trigger = signal<HTMLElement | undefined>(undefined);
    /** Context areas are not Menu triggers; preserve native pre-open focus separately. */
    readonly contextMenuPreviousFocus = signal<HTMLElement | undefined>(undefined);
    readonly popupElement = signal<HTMLElement | undefined>(undefined);
    private pointerMoveGuard = createPointerMoveGuard();
    private pointerOrigin?: { clientX: number; clientY: number };
    readonly defaultContentId = injectId('rdx-menu-content-');
    readonly triggerId = computed(() => {
        const trigger = this.trigger();
        return this.registeredTriggerId?.() || trigger?.id || undefined;
    });
    readonly contentId = computed(() => {
        this.popupElement();
        return this.registeredPopupId?.() || this.defaultContentId;
    });
    private readonly popupPhysicalSideSource = signal<Signal<MenuSide | undefined> | undefined>(undefined);
    /** Physical placed side read through the popup's own signal (undefined until the popup is placed). */
    readonly popupPhysicalSide = computed(() => this.popupPhysicalSideSource()?.());
    readonly beforeContentFocusGuard = signal<HTMLElement | null>(null);
    readonly transitionStatus = this.lifecycle.status;
    readonly activeIndex = signal<number | null>(null);
    /** How focus moves into the popup when it opens; false preserves the current focus. */
    readonly autoFocus = signal<RdxMenuAutoFocus>('popup');
    readonly isSubmenu = signal(false);
    /** Set by `RdxContextMenuRoot` (it composes this root) — distinguishes a context menu from a dropdown. */
    private readonly menuId = injectId('rdx-menu-root-');
    /** This menu chain's owner id — the root's own id, inherited by every submenu below it. */
    readonly ownerId: Signal<string> = computed(() => this.parentRoot?.ownerId() ?? this.menuId);

    private readonly localIsContextMenu = signal(false);
    /**
     * Whether this menu belongs to a context menu — inherited by submenus, whose items follow the same
     * right-button gesture rules as the root's (Base UI scopes its context-menu context over the whole
     * tree, submenus included).
     */
    readonly isContextMenu: Signal<boolean> = computed(
        () => this.localIsContextMenu() || (this.parentRoot?.isContextMenu() ?? false)
    );
    readonly hasTriggerInteractionHandler = signal(false);
    /** Native coordinator boundary, including composition through hostDirectives. */
    readonly triggerInteractionScope = signal<HTMLElement | undefined>(undefined);

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

    /** Cursor position a context-menu gesture started at, until an item consumes it. */
    private initialCursorPoint: { x: number; y: number } | null = null;

    /** Whether the current open was initiated by **touch** (ADR 0016 §3 — gates the anchored scroll lock). */
    readonly openedByTouch = signal(false);
    readonly openInteractionType = signal<RdxInteractionType>(null);
    readonly closeInteractionType = signal<RdxInteractionType>(null);

    readonly effectiveDisabled: Signal<boolean> = computed(
        () => this.disabled() || (this.ambientDisabled?.() ?? false) || (this.parentRoot?.effectiveDisabled() ?? false)
    );
    readonly dir: Signal<Direction> = computed(() => {
        return this.dirInput() ?? this.parentRoot?.dir() ?? this.providedDirection();
    });
    readonly effectiveModal = computed(() => (this.ambientModal?.() ?? this.modal()) && !this.isSubmenu());
    readonly state = computed(() => (this.open() ? 'open' : 'closed'));
    // Angular owns submenu roots inside the parent's embedded view, even when their popups portal
    // elsewhere. Let accepted child exits finish before removing that owning view and its outputs.
    readonly present = computed(
        () => this.lifecycle.present() || this.childRoots().some((child) => child.transitionStatus() === 'ending')
    );

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
        const parent = this.parentRoot;
        if (parent) {
            parent.childRoots.update((children) => [...children, this]);
            inject(DestroyRef).onDestroy(() => {
                parent.childRoots.update((children) => children.filter((child) => child !== this));
            });
        }
        effect((onCleanup) => {
            if (!this.open()) return;
            const guard = createPointerMoveGuard(this.pointerOrigin);
            this.pointerMoveGuard = guard;
            const document = this.floatingContext.ownerDocument;
            document.addEventListener('pointermove', guard, true);
            onCleanup(() => document.removeEventListener('pointermove', guard, true));
        });
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
            if (!this.open()) {
                this.activeIndex.set(null);
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
            if (
                (reason === 'trigger-press' && this.lastOpenChangeReason() === 'trigger-hover') ||
                (reason === 'trigger-focus' &&
                    this.parentType() === 'menubar' &&
                    this.lastOpenChangeReason() !== reason)
            ) {
                const change = this.createOpenChangeEvent(true, reason, event);
                this.onOpenChange.emit(change.payload);
                if (change.eventDetails.isCanceled()) return;
                this.lastOpenChangeReason.set(reason);
                this.openInteractionType.set(reason === 'trigger-focus' ? null : getInteractionTypeFromEvent(event));
                change.commit();
                this.floatingContext.events.emit('openchange', {
                    open: true,
                    reason,
                    event: change.eventDetails.event
                });
            }
            this.focusOpenPopup(nextAutoFocus);
            return;
        }

        if (!this.open()) {
            const change = this.createOpenChangeEvent(true, reason, event);
            this.onOpenChange.emit(change.payload);

            if (change.eventDetails.isCanceled()) {
                return;
            }

            // A retained popup already has its focus scope before this request. Capture actual
            // pre-open focus here, before the coordinator moves it to another trigger.
            this.focusBeforeRetainedOpen = this.popupElement()
                ? ((getActiveElement(this.floatingContext.ownerDocument) as HTMLElement | null) ?? undefined)
                : undefined;
            this.lastOpenChangeReason.set(reason);
            // Record whether this open came from touch (ADR 0016 §3). Hover / mouse / keyboard all resolve
            // to false (no `'touch'` pointer type), so only a genuine touch open gates the anchored lock.
            this.openedByTouch.set((event as PointerEvent | undefined)?.pointerType === 'touch');
            const method = reason === 'trigger-focus' ? null : getInteractionTypeFromEvent(event);
            this.openInteractionType.set(method);
            this.pointerOrigin =
                (method === 'mouse' || method === 'pen') && event && 'clientX' in event && 'clientY' in event
                    ? { clientX: event.clientX as number, clientY: event.clientY as number }
                    : undefined;
            this.open.set(true);
            change.commit();
            // Publish reason + native event on the per-popup floating channel (Base UI open-change) so the
            // dismissal / future focus policy can read why the menu opened (e.g. hover vs press).
            this.floatingContext.events.emit('openchange', { open: true, reason, event: change.eventDetails.event });
        }
    }

    onItemHover(item: HTMLElement, event: PointerEvent): void {
        for (const child of this.childRoots()) {
            if (child.trigger() !== item) child.close('sibling-open', event);
        }
    }

    /** Request a cancelable close; direct calls default to the imperative-action reason. */
    close(reason: RdxMenuOpenChangeReason = 'imperative-action', event?: Event) {
        if (this.open()) {
            const change = this.createOpenChangeEvent(false, reason, event);
            this.onOpenChange.emit(change.payload);

            if (change.eventDetails.isCanceled()) {
                return;
            }

            this.setAllowMouseUpTrigger(false);
            this.lastOpenChangeReason.set(reason);
            this.closeInteractionType.set(getInteractionTypeFromEvent(event));
            this.open.set(false);
            change.commit();
            for (const child of this.childRoots()) child.close(reason, event);
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
            const method = getInteractionTypeFromEvent(event);
            this.show(method === 'mouse' || method === 'touch' || method === 'pen' ? 'popup' : 'first', reason, event);
        }
    }

    markAsContextMenu(): void {
        this.localIsContextMenu.set(true);
    }

    /** Classifies the same native event observed in document capture and item handlers. */
    isStationaryPointerMove(event: PointerEvent): boolean {
        return this.pointerMoveGuard(event);
    }

    setActiveIndex(index: number | null): void {
        if (this.effectiveDisabled() && index !== null) {
            return;
        }

        if (this.activeIndex() !== index) {
            this.activeIndex.set(index);
        }
    }

    /** @ignore Records where a context-menu gesture started (see {@link consumeInitialCursorPoint}). */
    setInitialCursorPoint(point: { x: number; y: number } | null): void {
        if (this.parentRoot) {
            this.parentRoot.setInitialCursorPoint(point);
            return;
        }
        this.initialCursorPoint = point;
    }

    /** @ignore Reads and clears the recorded gesture origin — only the first item to ask receives it. */
    consumeInitialCursorPoint(): { x: number; y: number } | null {
        if (this.parentRoot) {
            return this.parentRoot.consumeInitialCursorPoint();
        }
        const point = this.initialCursorPoint;
        this.initialCursorPoint = null;
        return point;
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
        this.parentRoot?.closeEntireMenu(reason, event);
        this.close(reason, event);
    }

    registerTrigger(el: HTMLElement, getId?: () => string): () => void {
        this.registeredTrigger = el;
        this.registeredTriggerId = getId;
        this.trigger.set(el);
        this.floatingContext.triggers.add(el);
        return () => {
            this.floatingContext.triggers.delete(el);
            if (this.registeredTrigger === el) {
                this.registeredTrigger = undefined;
                this.registeredTriggerId = undefined;
                this.trigger.set(undefined);
            }
        };
    }

    /** This open session's return target, falling back through surviving Menu owners. */
    getReturnFocusElement(): HTMLElement | undefined {
        const previous = this.focusBeforeRetainedOpen;
        if (this.parentType() === 'menubar' && this.openInteractionType() == null && previous) {
            if (
                previous !== this.floatingContext.ownerDocument.body &&
                previous.isConnected &&
                !previous.closest('[hidden]')
            )
                return previous;
            const owner = this.coordinator?.returnFocusFrom?.(previous);
            if (owner) return owner;
        }
        const trigger = this.trigger();
        if (trigger?.isConnected && !trigger.closest('[hidden]')) return trigger;
        return this.parentRoot?.getReturnFocusElement() ?? this.contextMenuPreviousFocus();
    }

    registerPopup(el: HTMLElement, physicalSide?: Signal<MenuSide | undefined>, getId?: () => string): () => void {
        this.registeredPopupId = getId;
        this.popupElement.set(el);
        this.popupPhysicalSideSource.set(physicalSide);
        return () => {
            if (this.popupElement() === el) {
                this.registeredPopupId = undefined;
                this.popupElement.set(undefined);
                this.popupPhysicalSideSource.set(undefined);
            }
        };
    }

    setBeforeContentFocusGuard(element: HTMLElement | null): void {
        this.beforeContentFocusGuard.set(element);
    }

    registerTransitionElement(element: HTMLElement): () => void {
        return this.lifecycle.registerElement(element);
    }

    /** Finish the accepted pending close after an external animation. Safe to call again or while open. */
    unmount(): void {
        if (this.open()) return;
        // Completing an ancestor exit also releases accepted child exits; otherwise an animated
        // submenu could keep the Angular view owning this root's portal alive after this action.
        for (const child of this.childRoots()) child.unmount();
        this.lifecycle.unmount();
    }

    registerPopupArrowNavigationHandler(handler: (offset: 1 | -1, event?: KeyboardEvent) => boolean): () => void {
        this.popupArrowNavigationHandler = handler;

        return () => {
            if (this.popupArrowNavigationHandler === handler) {
                this.popupArrowNavigationHandler = undefined;
            }
        };
    }

    handlePopupArrowNavigation(offset: 1 | -1, event?: KeyboardEvent): boolean {
        return (
            this.popupArrowNavigationHandler?.(offset, event) ??
            this.parentRoot?.handlePopupArrowNavigation(offset, event) ??
            false
        );
    }

    /** @internal A navigation return moves focus/highlight even when its close request is canceled. */
    closeForNavigation(event?: KeyboardEvent, consumeEvent = true): void {
        if (consumeEvent) {
            event?.preventDefault();
            event?.stopPropagation();
        }
        this.close('list-navigation', event);
        // A Menubar return can reopen synchronously from trigger focus. Preserve that menu's
        // highlight; nested menus hand their highlight back even when the close is canceled.
        if (this.parentType() !== 'menubar') this.setActiveIndex(null);
        this.getReturnFocusElement()?.focus({ preventScroll: true });
    }

    private coordinator?: RdxMenuCoordinator;
    getCoordinatorElements(): Array<HTMLElement | undefined> {
        const scope = this.triggerInteractionScope();
        return this.hasTriggerInteractionHandler()
            ? [scope, ...(this.coordinator?.insideElements() ?? [])]
            : (this.parentRoot?.getCoordinatorElements() ?? []);
    }
    ownsCoordinatorEscape(event: KeyboardEvent): boolean {
        return this.coordinator?.ownsEscape(event) ?? true;
    }

    registerTriggerInteractionHandler(
        handler: RdxMenuTriggerInteractionHandler,
        scope?: HTMLElement,
        coordinator?: RdxMenuCoordinator
    ): () => void {
        this.triggerInteractionHandler = handler;
        this.hasTriggerInteractionHandler.set(true);
        this.triggerInteractionScope.set(scope);
        this.coordinator = coordinator;

        return () => {
            if (this.triggerInteractionHandler === handler) {
                this.triggerInteractionHandler = undefined;
                this.hasTriggerInteractionHandler.set(false);
                this.triggerInteractionScope.set(undefined);
                this.coordinator = undefined;
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
            reason === 'focus-out' &&
                this.parentType() !== 'menubar' &&
                event?.target !== this.beforeContentFocusGuard()
                ? undefined
                : this.trigger()
        );
        const transaction = this.lifecycle.prepareOpenChange(open);
        change.eventDetails.preventUnmountOnClose = transaction.preventUnmountOnClose;

        return {
            eventDetails: change.eventDetails,
            commit: transaction.commit,
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
        if (!items.length && autoFocus === 'first') this.setActiveIndex(0);
        const item = autoFocus === 'last' ? items.at(-1) : items[0];
        (item ?? popup).focus({ preventScroll: true });
    }
}
