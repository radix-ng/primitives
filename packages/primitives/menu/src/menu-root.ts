import { BooleanInput } from '@angular/cdk/coercion';
import {
    afterNextRender,
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    inject,
    Injector,
    input,
    model,
    output,
    signal,
    Signal,
    untracked
} from '@angular/core';
import { createContext } from '@radix-ng/primitives/core';
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
    transitionStatus: Signal<RdxMenuTransitionStatus>;
    close: () => void;
    toggle: () => void;
    show: (autoFocus?: RdxMenuAutoFocusInput) => void;
    /** Open the menu without moving focus into the popup (used for menubar hover-switching). */
    showWithoutAutoFocus: () => void;
    registerTrigger: (el: HTMLElement) => () => void;
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

export const [injectRdxMenuRootContext, provideRdxMenuRootContext] =
    createContext<RdxMenuRootContext>('RdxMenuRootContext');

function buildContext(instance: RdxMenuRoot): RdxMenuRootContext {
    return {
        isOpen: instance.open,
        disabled: instance.disabled,
        modal: instance.modal,
        loopFocus: instance.loopFocus,
        highlightItemOnHover: instance.highlightItemOnHover,
        orientation: instance.orientation,
        closeParentOnEsc: instance.closeParentOnEsc,
        autoFocus: instance.autoFocus.asReadonly(),
        isSubmenu: instance.isSubmenu.asReadonly(),
        hasTriggerInteractionHandler: instance.hasTriggerInteractionHandler.asReadonly(),
        trigger: instance.trigger.asReadonly(),
        transitionStatus: instance.transitionStatus.asReadonly(),
        close: () => instance.close(),
        toggle: () => instance.toggle(),
        show: (autoFocus) => instance.show(autoFocus),
        showWithoutAutoFocus: () => instance.show(false),
        registerTrigger: (el) => instance.registerTrigger(el),
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
    private readonly destroyRef = inject(DestroyRef);
    private readonly injector = inject(Injector);

    private registeredTrigger: HTMLElement | undefined;
    private transitionElement: HTMLElement | undefined;
    private popupArrowNavigationHandler: ((offset: 1 | -1) => boolean) | undefined;
    private triggerInteractionHandler: RdxMenuTriggerInteractionHandler | undefined;
    private hasAppliedDefaultOpen = false;
    private transitionVersion = 0;
    private transitionTimer: ReturnType<typeof setTimeout> | undefined;
    private transitionFrame: number | undefined;

    /** Whether the menu is currently open. */
    readonly open = model(false);

    /** Whether the menu is initially open. */
    readonly defaultOpen = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Whether interactions with the menu are disabled. */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Whether the menu should block outside interactions. */
    readonly modal = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

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
    readonly transitionStatus = signal<RdxMenuTransitionStatus>(undefined);
    /** Whether the popup grabs focus when it opens. Set false for menubar hover-switching. */
    readonly autoFocus = signal<RdxMenuAutoFocus>('first');
    readonly isSubmenu = signal(false);
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
                untracked(() => this.beginTransition(open));
            }
        });

        this.destroyRef.onDestroy(() => {
            clearTimeout(this.transitionTimer);
            if (this.transitionFrame !== undefined) cancelAnimationFrame(this.transitionFrame);
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

    registerTransitionElement(element: HTMLElement): () => void {
        this.transitionElement = element;
        return () => {
            if (this.transitionElement === element) {
                this.transitionElement = undefined;
            }
        };
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

    private beginTransition(open: boolean) {
        const version = ++this.transitionVersion;
        clearTimeout(this.transitionTimer);
        if (this.transitionFrame !== undefined) {
            cancelAnimationFrame(this.transitionFrame);
            this.transitionFrame = undefined;
        }
        this.transitionStatus.set(open ? 'starting' : 'ending');

        afterNextRender(
            () => {
                if (this.destroyRef.destroyed || version !== this.transitionVersion) return;

                if (open) {
                    this.transitionFrame = requestAnimationFrame(() => {
                        this.transitionFrame = undefined;
                        if (this.destroyRef.destroyed || version !== this.transitionVersion) return;
                        this.transitionStatus.set(undefined);
                        this.waitForTransition(open, version);
                    });
                } else {
                    this.waitForTransition(open, version);
                }
            },
            { injector: this.injector }
        );
    }

    private waitForTransition(open: boolean, version: number) {
        const duration = this.transitionElement ? getMaxTransitionDuration(this.transitionElement) : 0;
        if (duration === 0) {
            this.completeTransition(open, version);
            return;
        }
        this.transitionTimer = setTimeout(() => this.completeTransition(open, version), duration);
    }

    private completeTransition(open: boolean, version: number) {
        if (version !== this.transitionVersion) return;
        clearTimeout(this.transitionTimer);
        this.transitionStatus.set(undefined);
        if (!this.destroyRef.destroyed) {
            this.onOpenChangeComplete.emit(open);
        }
    }
}

function getMaxTransitionDuration(element: HTMLElement): number {
    const s = getComputedStyle(element);
    return Math.max(
        getMaxCssDuration(s.transitionDuration, s.transitionDelay),
        getMaxCssDuration(s.animationDuration, s.animationDelay)
    );
}

function getMaxCssDuration(durations: string, delays: string): number {
    const d = durations.split(',').map(parseCssTime);
    const dl = delays.split(',').map(parseCssTime);
    return d.reduce((max, dur, i) => Math.max(max, dur + dl[i % dl.length]), 0);
}

function parseCssTime(value: string): number {
    const t = value.trim();
    const n = Number.parseFloat(t);
    if (!Number.isFinite(n)) return 0;
    return t.endsWith('ms') ? n : n * 1000;
}
