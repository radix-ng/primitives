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
    useTransitionStatus
} from '@radix-ng/primitives/core';
import { RdxPopper } from '@radix-ng/primitives/popper';
import { RdxPreviewCardHandle } from './preview-card-handle';

export type RdxPreviewCardOpenChangeReason =
    | 'trigger-hover'
    | 'trigger-focus'
    | 'trigger-press'
    | 'outside-press'
    | 'escape-key'
    | 'imperative-action'
    | 'none';

export type RdxPreviewCardOpenChangeEventDetails = RdxCancelableChangeEventDetails<RdxPreviewCardOpenChangeReason>;

export interface RdxPreviewCardOpenChange {
    open: boolean;
    triggerId: string | null;
    trigger: HTMLElement | undefined;
    reason: RdxPreviewCardOpenChangeReason;
    event: Event;
    eventDetails: RdxPreviewCardOpenChangeEventDetails;
}

interface RdxPreviewCardRegisteredTrigger {
    element: HTMLElement;
    payload: () => unknown;
}

const context = () => contextFor(inject(RdxPreviewCardRoot));

export interface RdxPreviewCardRootContext {
    contentId: string;
    isOpen: Signal<boolean>;
    present: Signal<boolean>;
    trigger: Signal<HTMLElement | undefined>;
    triggers: Signal<HTMLElement[]>;
    isHoverActive: Signal<boolean>;
    instant: Signal<boolean>;
    openChangeReason: Signal<RdxPreviewCardOpenChangeReason>;
    isPointerDownOnTrigger: Signal<boolean>;
    close: (reason?: RdxPreviewCardOpenChangeReason, event?: Event) => void;
    cancelHoverClose: () => void;
    cancelHoverOpen: () => void;
    closeOnHover: () => void;
    payload: Signal<unknown>;
    open: (
        trigger?: HTMLElement,
        payload?: unknown,
        triggerId?: string,
        reason?: RdxPreviewCardOpenChangeReason,
        event?: Event
    ) => void;
    openWithDelay: (
        trigger: HTMLElement,
        payload: unknown,
        triggerId: string,
        reason: RdxPreviewCardOpenChangeReason,
        event: Event
    ) => void;
    registerTrigger: (id: string, trigger: HTMLElement, payload: () => unknown) => () => void;
    setPointerDownOnTrigger: (pointerDown: boolean) => void;
    setHoverDelays: (delay: number, closeDelay: number) => void;
    registerTransitionElement: (element: HTMLElement) => () => void;
    transitionStatus: Signal<RdxPreviewCardTransitionStatus>;
    registerViewport: (onTriggerChange: (previous: HTMLElement, next: HTMLElement) => void) => () => void;
    toggle: (triggerId: string, trigger: HTMLElement, payload?: unknown, event?: Event) => void;
}

export const [injectRdxPreviewCardRootContext, provideRdxPreviewCardRootContext] =
    createContext<RdxPreviewCardRootContext>('RdxPreviewCardRootContext', 'components/preview-card');

export type RdxPreviewCardTransitionStatus = 'starting' | 'ending' | undefined;

/**
 * Groups all parts of the preview-card.
 */
@Directive({
    selector: '[rdxPreviewCardRoot]',
    exportAs: 'rdxPreviewCardRoot',
    providers: [
        provideRdxPreviewCardRootContext(context),
        provideFloatingTree(),
        provideFloatingRootContext(() => inject(RdxPreviewCardRoot).floatingContext)
    ],
    hostDirectives: [RdxPopper]
})
export class RdxPreviewCardRoot {
    private readonly popper = inject(RdxPopper);
    private readonly destroyRef = inject(DestroyRef);

    /**
     * Per-popup floating root context (ADR 0015) — the shared store the popup's dismissal capability
     * reads (`open`, `triggers`, the reference/floating elements). The tree node is registered by the
     * popup; this context exists independently so dismissal can read `open()`.
     */
    readonly floatingContext: RdxFloatingRootContext = createFloatingRootContext({
        ownerDocument: inject(ElementRef).nativeElement.ownerDocument,
        open: () => this.open()
    });

    /** Shared open/close transition state machine (completes on the real animationend). */
    private readonly transition = useTransitionStatus((open) => {
        this.instant.set(false);
        this.onOpenChangeComplete.emit(open);
    });

    private hasAppliedDefaultOpen = false;
    private hasAppliedDefaultTriggerId = false;
    private openTimer: ReturnType<typeof setTimeout> | undefined;
    private closeTimer: ReturnType<typeof setTimeout> | undefined;
    private hoverDelay = 600;
    private hoverCloseDelay = 300;
    private instantFrame: number | undefined;
    readonly isHoverActive = signal(false);
    readonly instant = signal(false);
    readonly openChangeReason = signal<RdxPreviewCardOpenChangeReason>('none');
    readonly transitionStatus = this.transition.status;

    /**
     * Whether the preview-card is currently open.
     */
    readonly open = model(false);

    /**
     * Whether the preview-card is initially open.
     */
    readonly defaultOpen = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * ID of the trigger associated with a controlled preview-card.
     */
    readonly triggerId = model<string | null>(null);

    /**
     * ID of the trigger associated with an initially open uncontrolled preview-card.
     */
    readonly defaultTriggerId = input<string | null>(null);

    /**
     * Associates this root with detached trigger elements.
     */
    readonly handle = input<RdxPreviewCardHandle<any>>();

    readonly contentId = injectId('rdx-preview-card-content-');
    readonly trigger = signal<HTMLElement | undefined>(undefined);
    readonly triggers = signal<HTMLElement[]>([]);
    readonly payload = signal<unknown>(undefined);
    readonly isPointerDownOnTrigger = signal(false);
    private readonly preventUnmountOnClose = signal(false);
    readonly onOpenChange = output<RdxPreviewCardOpenChange>();
    readonly onOpenChangeComplete = output<boolean>();
    private readonly registeredTriggers = new Map<string, RdxPreviewCardRegisteredTrigger>();
    private readonly viewportTriggerChange = new Set<(previous: HTMLElement, next: HTMLElement) => void>();

    readonly state = computed(() => (this.open() ? 'open' : 'closed'));
    readonly present = computed(() => this.open() || this.preventUnmountOnClose());

    constructor() {
        let previousOpen = this.open();

        effect(() => {
            const defaultOpen = this.defaultOpen();

            if (!this.hasAppliedDefaultOpen && defaultOpen) {
                this.hasAppliedDefaultOpen = true;
                this.open.set(defaultOpen);
            }
        });

        effect(() => {
            const defaultTriggerId = this.defaultTriggerId();

            if (!this.hasAppliedDefaultTriggerId && defaultTriggerId !== null) {
                this.hasAppliedDefaultTriggerId = true;
                this.triggerId.set(defaultTriggerId);
            }
        });

        effect(() => {
            const triggerId = this.triggerId();
            untracked(() => this.syncTriggerId(triggerId));
        });

        effect(() => {
            const open = this.open();

            if (open !== previousOpen) {
                previousOpen = open;
                untracked(() => this.transition.start(open));
            }
        });

        effect((onCleanup) => {
            const handle = this.handle();

            if (handle) {
                onCleanup(untracked(() => handle.registerRoot(contextFor(this))));
            }
        });

        effect(() => this.popper.anchorOverride.set(this.trigger()));

        // Sync the dismissal reference (the active trigger) so an outside-press on the trigger counts
        // as "inside" and never dismisses (ADR 0015).
        effect(() => this.floatingContext.setReferenceElement(this.trigger() ?? null));

        effect(() => {
            if (this.open() && this.preventUnmountOnClose()) {
                this.preventUnmountOnClose.set(false);
            }
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
        reason: RdxPreviewCardOpenChangeReason = 'none',
        event = new Event('preview-card.open-change'),
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

        const change = this.createOpenChangeEvent(true, reason, event, trigger, triggerId ?? this.triggerId());
        this.onOpenChange.emit(change.payload);

        if (change.eventDetails.isCanceled()) {
            return;
        }

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

    close(reason: RdxPreviewCardOpenChangeReason = 'none', event = new Event('preview-card.open-change')) {
        this.clearHoverTimers();

        if (!this.open()) {
            return;
        }

        const change = this.createOpenChangeEvent(false, reason, event, this.trigger(), this.triggerId());
        this.onOpenChange.emit(change.payload);

        if (change.eventDetails.isCanceled()) {
            return;
        }

        this.isHoverActive.set(false);
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

    openWithDelay(
        trigger: HTMLElement,
        payload: unknown,
        triggerId: string,
        reason: RdxPreviewCardOpenChangeReason,
        event: Event
    ) {
        this.clearHoverTimers();
        this.isHoverActive.set(true);

        if (this.open()) {
            this.show(trigger, payload, triggerId, reason, event, true);
            return;
        }

        this.openTimer = setTimeout(() => this.show(trigger, payload, triggerId, reason, event, true), this.hoverDelay);
    }

    closeOnHover() {
        if (!this.isHoverActive()) {
            return;
        }

        this.clearOpenTimer();
        this.clearCloseTimer();
        this.closeTimer = setTimeout(
            () => this.close('trigger-hover', new Event('preview-card.hover-close')),
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

    registerTrigger(id: string, trigger: HTMLElement, payload: () => unknown) {
        this.registeredTriggers.set(id, { element: trigger, payload });
        this.triggers.update((triggers) => (triggers.includes(trigger) ? triggers : [...triggers, trigger]));
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
        reason: RdxPreviewCardOpenChangeReason,
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
            } satisfies RdxPreviewCardOpenChange
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
}

function contextFor(root: RdxPreviewCardRoot): RdxPreviewCardRootContext {
    return {
        contentId: root.contentId,
        isOpen: root.open.asReadonly(),
        present: root.present,
        trigger: root.trigger.asReadonly(),
        triggers: root.triggers.asReadonly(),
        payload: root.payload.asReadonly(),
        isHoverActive: root.isHoverActive.asReadonly(),
        instant: root.instant.asReadonly(),
        openChangeReason: root.openChangeReason.asReadonly(),
        isPointerDownOnTrigger: root.isPointerDownOnTrigger.asReadonly(),
        close: (reason?: RdxPreviewCardOpenChangeReason, event?: Event) => root.close(reason, event),
        cancelHoverClose: () => root.cancelHoverClose(),
        cancelHoverOpen: () => root.cancelHoverOpen(),
        closeOnHover: () => root.closeOnHover(),
        open: (trigger, payload, triggerId, reason, event) => root.show(trigger, payload, triggerId, reason, event),
        openWithDelay: (trigger, payload, triggerId, reason, event) =>
            root.openWithDelay(trigger, payload, triggerId, reason, event),
        registerTrigger: (id, trigger, payload) => root.registerTrigger(id, trigger, payload),
        setPointerDownOnTrigger: (pointerDown: boolean) => root.isPointerDownOnTrigger.set(pointerDown),
        setHoverDelays: (delay: number, closeDelay: number) => root.setHoverDelays(delay, closeDelay),
        registerTransitionElement: (element) => root.registerTransitionElement(element),
        transitionStatus: root.transitionStatus,
        registerViewport: (onTriggerChange) => root.registerViewport(onTriggerChange),
        toggle: (triggerId, trigger, payload, event) => root.toggle(triggerId, trigger, payload, event)
    };
}
