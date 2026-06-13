import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    inject,
    input,
    model,
    output,
    signal,
    Signal,
    untracked
} from '@angular/core';
import { BooleanInput, createContext, useTransitionStatus } from '@radix-ng/primitives/core';
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
    hasTriggerInteractionHandler: Signal<boolean>;
    trigger: Signal<HTMLElement | undefined>;
    /** The popup element, once mounted. Used by submenu safe-polygon geometry. */
    popupElement: Signal<HTMLElement | undefined>;
    transitionStatus: Signal<RdxMenuTransitionStatus>;
    close: () => void;
    toggle: () => void;
    show: (autoFocus?: RdxMenuAutoFocusInput) => void;
    /** Open the menu without moving focus into the popup (used for menubar hover-switching). */
    showWithoutAutoFocus: () => void;
    registerTrigger: (el: HTMLElement) => () => void;
    registerPopup: (el: HTMLElement) => () => void;
    registerTransitionElement: (element: HTMLElement) => () => void;
    registerPopupArrowNavigationHandler: (handler: (offset: 1 | -1) => boolean) => () => void;
    registerTriggerInteractionHandler: (handler: RdxMenuTriggerInteractionHandler) => () => void;
    markAsSubmenu: () => void;
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
        disabled: instance.disabled,
        modal: instance.effectiveModal,
        loopFocus: instance.loopFocus,
        highlightItemOnHover: instance.highlightItemOnHover,
        orientation: instance.orientation,
        closeParentOnEsc: instance.closeParentOnEsc,
        autoFocus: instance.autoFocus.asReadonly(),
        isSubmenu: instance.isSubmenu.asReadonly(),
        hasTriggerInteractionHandler: instance.hasTriggerInteractionHandler.asReadonly(),
        trigger: instance.trigger.asReadonly(),
        popupElement: instance.popupElement.asReadonly(),
        transitionStatus: instance.transitionStatus,
        close: () => instance.close(),
        toggle: () => instance.toggle(),
        show: (autoFocus) => instance.show(autoFocus),
        showWithoutAutoFocus: () => instance.show(false),
        registerTrigger: (el) => instance.registerTrigger(el),
        registerPopup: (el) => instance.registerPopup(el),
        registerTransitionElement: (el) => instance.registerTransitionElement(el),
        registerPopupArrowNavigationHandler: (handler) => instance.registerPopupArrowNavigationHandler(handler),
        registerTriggerInteractionHandler: (handler) => instance.registerTriggerInteractionHandler(handler),
        markAsSubmenu: () => instance.markAsSubmenu(),
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
    providers: [provideRdxMenuRootContext(contextFactory)],
    hostDirectives: [RdxPopper]
})
export class RdxMenuRoot {
    private readonly popper = inject(RdxPopper);

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
    readonly effectiveModal = computed(() => this.modal() && !this.isSubmenu());
    readonly hasTriggerInteractionHandler = signal(false);
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

        let previousOpen = this.open();
        effect(() => {
            const open = this.open();
            if (open !== previousOpen) {
                previousOpen = open;
                untracked(() => this.transition.start(open));
            }
        });
    }

    show(autoFocus: RdxMenuAutoFocusInput = 'first') {
        if (this.disabled()) {
            return;
        }

        this.autoFocus.set(autoFocus === true ? 'first' : autoFocus);
        if (!this.open()) {
            this.open.set(true);
            this.onOpenChange.emit(true);
        }
    }

    close() {
        if (this.open()) {
            this.open.set(false);
            this.onOpenChange.emit(false);
        }
    }

    toggle() {
        if (this.disabled()) {
            return;
        }

        if (this.open()) {
            this.close();
        } else {
            this.show();
        }
    }

    registerTrigger(el: HTMLElement): () => void {
        this.registeredTrigger = el;
        this.trigger.set(el);
        return () => {
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
