import {
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    model,
    output,
    Signal,
    signal,
    untracked
} from '@angular/core';
import {
    BooleanInput,
    createCancelableChangeEventDetails,
    createContext,
    createFloatingRootContext,
    injectId,
    provideFloatingRootContext,
    provideFloatingTree,
    RdxCancelableChangeEventDetails,
    RdxFloatingRootContext,
    RdxTransitionStatus,
    useTransitionStatus
} from '@radix-ng/primitives/core';
import { getInteractionTypeFromEvent, RdxInteractionType } from '@radix-ng/primitives/floating-focus-manager';
import { RdxPopper } from '@radix-ng/primitives/popper';
import { RdxPopoverHandle } from './popover-handle';

export type RdxPopoverModal = boolean | 'trap-focus';
export type RdxPopoverOpenChangeReason =
    | 'trigger-hover'
    | 'trigger-focus'
    | 'trigger-press'
    | 'outside-press'
    | 'escape-key'
    | 'close-press'
    | 'focus-out'
    | 'imperative-action'
    | 'none';

export type RdxPopoverOpenChangeEventDetails = RdxCancelableChangeEventDetails<RdxPopoverOpenChangeReason>;

export interface RdxPopoverOpenChange {
    open: boolean;
    triggerId: string | null;
    trigger: HTMLElement | undefined;
    reason: RdxPopoverOpenChangeReason;
    event: Event;
    eventDetails: RdxPopoverOpenChangeEventDetails;
}

interface RdxPopoverRegisteredTrigger {
    element: HTMLElement;
    payload: () => unknown;
}

const transformModal = (value: BooleanInput | 'trap-focus'): RdxPopoverModal =>
    value === 'trap-focus' ? value : booleanAttribute(value);

const context = () => contextFor(inject(RdxPopoverRoot));

export interface RdxPopoverRootContext {
    contentId: string;
    descriptionId: Signal<string | undefined>;
    isOpen: Signal<boolean>;
    present: Signal<boolean>;
    modal: Signal<RdxPopoverModal>;
    titleId: Signal<string | undefined>;
    trigger: Signal<HTMLElement | undefined>;
    triggers: Signal<HTMLElement[]>;
    hasPopupClose: Signal<boolean>;
    isHoverActive: Signal<boolean>;
    instant: Signal<boolean>;
    openChangeReason: Signal<RdxPopoverOpenChangeReason>;
    isPointerDownOnTrigger: Signal<boolean>;
    /** Whether the current open was initiated by touch (ADR 0016 §3 — gates the anchored scroll lock). */
    openedByTouch: Signal<boolean>;
    openInteractionType: Signal<RdxInteractionType>;
    closeInteractionType: Signal<RdxInteractionType>;
    close: (reason?: RdxPopoverOpenChangeReason, event?: Event) => void;
    cancelHoverClose: () => void;
    cancelHoverOpen: () => void;
    closeOnHover: () => void;
    payload: Signal<unknown>;
    open: (
        trigger?: HTMLElement,
        payload?: unknown,
        triggerId?: string,
        reason?: RdxPopoverOpenChangeReason,
        event?: Event
    ) => void;
    openOnHover: (trigger: HTMLElement, payload: unknown, triggerId: string, event: PointerEvent) => void;
    registerTrigger: (id: string, trigger: HTMLElement, payload: () => unknown) => () => void;
    setDescriptionId: (id: string | undefined) => void;
    setTitleId: (id: string | undefined) => void;
    setPointerDownOnTrigger: (pointerDown: boolean) => void;
    setOpenedByTouch: (value: boolean) => void;
    setTriggerOpenInteractionType: (type: RdxInteractionType) => void;
    setHoverDelays: (delay: number, closeDelay: number) => void;
    registerPopupClose: () => () => void;
    registerTransitionElement: (element: HTMLElement) => () => void;
    transitionStatus: Signal<RdxPopoverTransitionStatus>;
    beforeContentFocusGuard: Signal<HTMLElement | null>;
    registerViewport: (onTriggerChange: (previous: HTMLElement, next: HTMLElement) => void) => () => void;
    setBeforeContentFocusGuard: (element: HTMLElement | null) => void;
    toggle: (triggerId: string, trigger: HTMLElement, payload?: unknown, event?: Event) => void;
}

export const [injectRdxPopoverRootContext, provideRdxPopoverRootContext] = createContext<RdxPopoverRootContext>(
    'RdxPopoverRootContext',
    'components/popover'
);

export type RdxPopoverTransitionStatus = RdxTransitionStatus;

/**
 * Groups all parts of the popover.
 */
@Directive({
    selector: '[rdxPopoverRoot]',
    exportAs: 'rdxPopoverRoot',
    providers: [
        provideRdxPopoverRootContext(context),
        // New floating foundation (ADR 0015/0017 migration). Inherit-or-create tree (nested sharing);
        // the per-popup root context bridges open / triggers / reference.
        provideFloatingTree(),
        provideFloatingRootContext(() => inject(RdxPopoverRoot).floatingContext)
    ],
    hostDirectives: [RdxPopper]
})
export class RdxPopoverRoot {
    private readonly popper = inject(RdxPopper);
    private readonly destroyRef = inject(DestroyRef);

    /** Shared per-popup floating context (ADR 0015 §1): `open`, trigger registry, reference / floating els. */
    readonly floatingContext: RdxFloatingRootContext = createFloatingRootContext({
        ownerDocument: inject(ElementRef).nativeElement.ownerDocument,
        open: () => this.open()
    });
    private hasAppliedDefaultOpen = false;
    private hasAppliedDefaultTriggerId = false;
    private openTimer: ReturnType<typeof setTimeout> | undefined;
    private closeTimer: ReturnType<typeof setTimeout> | undefined;
    private hoverDelay = 300;
    private hoverCloseDelay = 0;
    private instantFrame: number | undefined;
    private readonly transition = useTransitionStatus((open) => {
        this.instant.set(false);
        this.onOpenChangeComplete.emit(open);
    });
    readonly isHoverActive = signal(false);
    readonly instant = signal(false);
    readonly openChangeReason = signal<RdxPopoverOpenChangeReason>('none');
    readonly transitionStatus = this.transition.status;

    /**
     * Whether the popover is currently open.
     */
    readonly open = model(false);

    /**
     * Whether the popover is initially open.
     */
    readonly defaultOpen = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * ID of the trigger associated with a controlled popover.
     */
    readonly triggerId = model<string | null>(null);

    /**
     * ID of the trigger associated with an initially open uncontrolled popover.
     */
    readonly defaultTriggerId = input<string | null>(null);

    /**
     * Determines whether the popover blocks outside interaction or only traps focus.
     */
    readonly modal = input<RdxPopoverModal, BooleanInput | 'trap-focus'>(false, { transform: transformModal });

    /**
     * Associates this root with detached trigger elements.
     */
    readonly handle = input<RdxPopoverHandle<any>>();

    readonly contentId = injectId('rdx-popover-content-');
    readonly beforeContentFocusGuard = signal<HTMLElement | null>(null);
    readonly descriptionId = signal<string | undefined>(undefined);
    readonly titleId = signal<string | undefined>(undefined);
    readonly trigger = signal<HTMLElement | undefined>(undefined);
    readonly triggers = signal<HTMLElement[]>([]);
    readonly payload = signal<unknown>(undefined);
    readonly isPointerDownOnTrigger = signal(false);

    /** Whether the current open was initiated by touch (ADR 0016 §3 — gates the anchored scroll lock). */
    readonly openedByTouch = signal(false);
    readonly openInteractionType = signal<RdxInteractionType>(null);
    readonly closeInteractionType = signal<RdxInteractionType>(null);
    readonly popupCloseCount = signal(0);
    private readonly preventUnmountOnClose = signal(false);
    private readonly pendingTriggerOpenInteractionType = signal<RdxInteractionType>(null);
    readonly onOpenChange = output<RdxPopoverOpenChange>();
    readonly onOpenChangeComplete = output<boolean>();
    private readonly registeredTriggers = new Map<string, RdxPopoverRegisteredTrigger>();
    private readonly viewportTriggerChange = new Set<(previous: HTMLElement, next: HTMLElement) => void>();

    readonly state = computed(() => (this.open() ? 'open' : 'closed'), { debugName: 'RdxPopoverRoot.state' });
    readonly present = computed(() => this.open() || this.preventUnmountOnClose(), {
        debugName: 'RdxPopoverRoot.present'
    });

    constructor() {
        let previousOpen = this.open();

        // Keep the floating context's reference element in sync with the active trigger.
        effect(() => this.floatingContext.setReferenceElement(this.trigger() ?? null));

        effect(
            () => {
                if (this.open() && this.preventUnmountOnClose()) {
                    this.preventUnmountOnClose.set(false);
                }
            },
            { debugName: 'RdxPopoverRoot.clearPreventUnmountOnOpen' }
        );

        effect(
            () => {
                const defaultOpen = this.defaultOpen();

                if (!this.hasAppliedDefaultOpen && defaultOpen) {
                    this.hasAppliedDefaultOpen = true;
                    this.open.set(defaultOpen);
                }
            },
            { debugName: 'RdxPopoverRoot.applyDefaultOpen' }
        );

        effect(
            () => {
                const defaultTriggerId = this.defaultTriggerId();

                if (!this.hasAppliedDefaultTriggerId && defaultTriggerId !== null) {
                    this.hasAppliedDefaultTriggerId = true;
                    this.triggerId.set(defaultTriggerId);
                }
            },
            { debugName: 'RdxPopoverRoot.applyDefaultTriggerId' }
        );

        effect(
            () => {
                const triggerId = this.triggerId();
                untracked(() => this.syncTriggerId(triggerId));
            },
            { debugName: 'RdxPopoverRoot.syncTriggerId' }
        );

        effect(
            () => {
                const open = this.open();

                if (open !== previousOpen) {
                    previousOpen = open;
                    untracked(() => this.transition.start(open));
                }
            },
            { debugName: 'RdxPopoverRoot.startTransition' }
        );

        effect(
            (onCleanup) => {
                const handle = this.handle();

                if (handle) {
                    onCleanup(untracked(() => handle.registerRoot(contextFor(this))));
                }
            },
            { debugName: 'RdxPopoverRoot.registerHandle' }
        );

        effect(() => this.popper.anchorOverride.set(this.trigger()), {
            debugName: 'RdxPopoverRoot.syncAnchorOverride'
        });

        this.destroyRef.onDestroy(() => {
            this.clearHoverTimers();

            if (this.instantFrame !== undefined) {
                cancelAnimationFrame(this.instantFrame);
            }
        });
    }

    show(
        trigger = this.trigger(),
        payload?: unknown,
        triggerId?: string,
        reason: RdxPopoverOpenChangeReason = 'none',
        event?: Event,
        fromHover = false
    ) {
        this.clearHoverTimers();
        const previousTrigger = this.trigger();
        const changedTriggerWhileOpen = this.open() && previousTrigger !== trigger;
        const changed = !this.open() || previousTrigger !== trigger;

        if (!changed) {
            this.isHoverActive.set(fromHover);
            this.openChangeReason.set(reason);
            if (triggerId !== undefined) {
                this.triggerId.set(triggerId);
            }
            this.payload.set(payload);
            return;
        }

        const resolvedEvent = event ?? new Event('popover.open-change');
        const change = this.createOpenChangeEvent(true, reason, resolvedEvent, trigger, triggerId ?? this.triggerId());
        this.onOpenChange.emit(change.payload);

        if (change.eventDetails.isCanceled()) {
            return;
        }

        const interactionType = this.consumeOpenInteractionType(event);
        this.openInteractionType.set(interactionType);
        this.openedByTouch.set(interactionType === 'touch');
        this.isHoverActive.set(fromHover);
        this.openChangeReason.set(reason);
        this.instant.set(changedTriggerWhileOpen || reason === 'trigger-focus');

        if (changedTriggerWhileOpen) {
            this.scheduleInstantReset();
        }

        if (trigger) {
            if (previousTrigger && previousTrigger !== trigger) {
                this.viewportTriggerChange.forEach((notify) => notify(previousTrigger, trigger));
            }

            this.trigger.set(trigger);
        }

        if (triggerId !== undefined) {
            this.triggerId.set(triggerId);
        }

        this.payload.set(payload);
        this.preventUnmountOnClose.set(false);
        this.open.set(true);
        this.floatingContext.events.emit('openchange', { open: true, reason, event: change.eventDetails.event });
    }

    close(reason: RdxPopoverOpenChangeReason = 'none', event?: Event) {
        this.clearHoverTimers();

        if (!this.open()) {
            return;
        }

        const resolvedEvent = event ?? new Event('popover.open-change');
        const change = this.createOpenChangeEvent(false, reason, resolvedEvent, this.trigger(), this.triggerId());
        this.onOpenChange.emit(change.payload);

        if (change.eventDetails.isCanceled()) {
            return;
        }

        this.pendingTriggerOpenInteractionType.set(null);
        this.closeInteractionType.set(getInteractionTypeFromEvent(event));
        this.isHoverActive.set(false);
        this.openedByTouch.set(false);
        this.instant.set(reason !== 'none' && reason !== 'trigger-hover');
        this.openChangeReason.set(reason);
        this.preventUnmountOnClose.set(change.shouldPreventUnmountOnClose());
        this.open.set(false);
        this.floatingContext.events.emit('openchange', { open: false, reason, event: change.eventDetails.event });
    }

    toggle(triggerId: string, trigger: HTMLElement, payload?: unknown, event?: Event) {
        this.clearHoverTimers();

        if (this.open() && this.trigger() === trigger) {
            this.close('trigger-press', event);
            return;
        }

        this.show(trigger, payload, triggerId, 'trigger-press', event);
    }

    openOnHover(trigger: HTMLElement, payload: unknown, triggerId: string, event: PointerEvent) {
        this.clearHoverTimers();
        this.isHoverActive.set(true);

        if (this.open()) {
            this.show(trigger, payload, triggerId, 'trigger-hover', event, true);
            return;
        }

        this.openTimer = setTimeout(
            () => this.show(trigger, payload, triggerId, 'trigger-hover', event, true),
            this.hoverDelay
        );
    }

    closeOnHover() {
        if (!this.isHoverActive()) {
            return;
        }

        this.clearOpenTimer();
        this.clearCloseTimer();
        this.closeTimer = setTimeout(
            () => this.close('trigger-hover', new Event('popover.hover-close')),
            this.hoverCloseDelay
        );
    }

    cancelHoverClose() {
        this.clearCloseTimer();
    }

    cancelHoverOpen() {
        this.clearOpenTimer();
    }

    setHoverDelays(delay: number, closeDelay: number) {
        this.hoverDelay = delay;
        this.hoverCloseDelay = closeDelay;
    }

    setTriggerOpenInteractionType(type: RdxInteractionType): void {
        this.pendingTriggerOpenInteractionType.set(type);
    }

    registerTrigger(id: string, trigger: HTMLElement, payload: () => unknown) {
        this.registeredTriggers.set(id, { element: trigger, payload });
        this.triggers.update((triggers) => (triggers.includes(trigger) ? triggers : [...triggers, trigger]));
        // Bridge into the floating context's trigger registry (new dismissal/focus inside-element checks).
        this.floatingContext.triggers.add(trigger);

        if (this.triggerId() === id) {
            this.trigger.set(trigger);
            this.payload.set(payload());
        } else if (!this.trigger() && this.triggerId() === null) {
            this.trigger.set(trigger);
            this.payload.set(payload());
        }

        return () => {
            if (this.registeredTriggers.get(id)?.element === trigger) {
                this.registeredTriggers.delete(id);
            }

            this.triggers.update((triggers) => triggers.filter((candidate) => candidate !== trigger));
            this.floatingContext.triggers.delete(trigger);

            if (this.destroyRef.destroyed) {
                return;
            }

            if (this.trigger() === trigger) {
                const next = this.registeredTriggers.entries().next().value;

                if (this.triggerId() !== null) {
                    this.triggerId.set(next?.[0] ?? null);
                }

                this.trigger.set(next?.[1].element);
                this.payload.set(next?.[1].payload());

                if (!next && !this.destroyRef.destroyed) {
                    this.close();
                }
            }
        };
    }

    registerViewport(onTriggerChange: (previous: HTMLElement, next: HTMLElement) => void) {
        this.viewportTriggerChange.add(onTriggerChange);
        return () => this.viewportTriggerChange.delete(onTriggerChange);
    }

    setBeforeContentFocusGuard(element: HTMLElement | null) {
        this.beforeContentFocusGuard.set(element);
    }

    registerTransitionElement(element: HTMLElement) {
        return this.transition.registerElement(element);
    }

    private syncTriggerId(triggerId: string | null) {
        if (triggerId === null) {
            this.trigger.set(undefined);
            this.payload.set(undefined);
            return;
        }

        const trigger = this.registeredTriggers.get(triggerId);

        if (!trigger) {
            this.trigger.set(undefined);
            this.payload.set(undefined);
            return;
        }

        if (trigger.element === this.trigger()) {
            return;
        }

        const previousTrigger = this.trigger();

        if (previousTrigger && this.open()) {
            this.viewportTriggerChange.forEach((notify) => notify(previousTrigger, trigger.element));
        }

        this.trigger.set(trigger.element);
        this.payload.set(trigger.payload());
    }

    private createOpenChangeEvent(
        open: boolean,
        reason: RdxPopoverOpenChangeReason,
        event: Event,
        trigger: HTMLElement | undefined,
        triggerId: string | null
    ) {
        const change = createCancelableChangeEventDetails(reason, event, trigger);

        return {
            eventDetails: change.eventDetails,
            shouldPreventUnmountOnClose: change.shouldPreventUnmountOnClose,
            payload: {
                open,
                triggerId,
                trigger: change.eventDetails.trigger,
                reason: change.eventDetails.reason,
                event: change.eventDetails.event,
                eventDetails: change.eventDetails
            } satisfies RdxPopoverOpenChange
        };
    }

    private clearHoverTimers() {
        this.clearOpenTimer();
        this.clearCloseTimer();
    }

    private clearOpenTimer() {
        if (this.openTimer !== undefined) {
            clearTimeout(this.openTimer);
            this.openTimer = undefined;
        }
    }

    private clearCloseTimer() {
        if (this.closeTimer !== undefined) {
            clearTimeout(this.closeTimer);
            this.closeTimer = undefined;
        }
    }

    private scheduleInstantReset() {
        if (this.instantFrame !== undefined) {
            cancelAnimationFrame(this.instantFrame);
        }

        this.instantFrame = requestAnimationFrame(() => {
            this.instantFrame = undefined;

            if (!this.destroyRef.destroyed && this.open()) {
                this.instant.set(false);
            }
        });
    }

    private consumeOpenInteractionType(event?: Event): RdxInteractionType {
        const pending = this.pendingTriggerOpenInteractionType();
        this.pendingTriggerOpenInteractionType.set(null);
        return pending ?? getInteractionTypeFromEvent(event);
    }
}

function contextFor(root: RdxPopoverRoot): RdxPopoverRootContext {
    return {
        contentId: root.contentId,
        descriptionId: root.descriptionId.asReadonly(),
        isOpen: root.open,
        present: root.present,
        modal: root.modal,
        titleId: root.titleId.asReadonly(),
        trigger: root.trigger.asReadonly(),
        triggers: root.triggers.asReadonly(),
        payload: root.payload.asReadonly(),
        hasPopupClose: computed(() => root.popupCloseCount() > 0),
        isHoverActive: root.isHoverActive.asReadonly(),
        instant: root.instant.asReadonly(),
        openChangeReason: root.openChangeReason.asReadonly(),
        isPointerDownOnTrigger: root.isPointerDownOnTrigger.asReadonly(),
        openedByTouch: root.openedByTouch.asReadonly(),
        openInteractionType: root.openInteractionType.asReadonly(),
        closeInteractionType: root.closeInteractionType.asReadonly(),
        close: (reason?: RdxPopoverOpenChangeReason, event?: Event) => root.close(reason, event),
        cancelHoverClose: () => root.cancelHoverClose(),
        cancelHoverOpen: () => root.cancelHoverOpen(),
        closeOnHover: () => root.closeOnHover(),
        open: (trigger, payload, triggerId, reason, event) => root.show(trigger, payload, triggerId, reason, event),
        openOnHover: (trigger, payload, triggerId, event) => root.openOnHover(trigger, payload, triggerId, event),
        registerTrigger: (id, trigger, payload) => root.registerTrigger(id, trigger, payload),
        setDescriptionId: (id: string | undefined) => root.descriptionId.set(id),
        setTitleId: (id: string | undefined) => root.titleId.set(id),
        setPointerDownOnTrigger: (pointerDown: boolean) => root.isPointerDownOnTrigger.set(pointerDown),
        setOpenedByTouch: (value: boolean) => root.openedByTouch.set(value),
        setTriggerOpenInteractionType: (type: RdxInteractionType) => root.setTriggerOpenInteractionType(type),
        setHoverDelays: (delay: number, closeDelay: number) => root.setHoverDelays(delay, closeDelay),
        registerPopupClose: () => {
            root.popupCloseCount.update((count) => count + 1);
            return () => root.popupCloseCount.update((count) => count - 1);
        },
        registerTransitionElement: (element) => root.registerTransitionElement(element),
        transitionStatus: root.transitionStatus,
        beforeContentFocusGuard: root.beforeContentFocusGuard.asReadonly(),
        registerViewport: (onTriggerChange) => root.registerViewport(onTriggerChange),
        setBeforeContentFocusGuard: (element) => root.setBeforeContentFocusGuard(element),
        toggle: (triggerId, trigger, payload, event) => root.toggle(triggerId, trigger, payload, event)
    };
}
