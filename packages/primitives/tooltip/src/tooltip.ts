import {
    afterRenderEffect,
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    linkedSignal,
    numberAttribute,
    output,
    Signal,
    signal,
    untracked
} from '@angular/core';
import type { ReferenceElement } from '@floating-ui/dom';
import {
    BooleanInput,
    createCancelableChangeEventDetails,
    createContext,
    createFloatingRootContext,
    getActiveElement,
    injectId,
    isNode,
    NumberInput,
    provideFloatingRootContext,
    provideFloatingTree,
    RdxCancelableChangeEventDetails,
    RdxFloatingRootContext,
    RdxRenderLifecycle,
    useRenderLifecycle,
    watch
} from '@radix-ng/primitives/core';
import { RdxPopper } from '@radix-ng/primitives/popper';
import { RdxTooltipHandle } from './tooltip-handle';
import { injectRdxTooltipProviderContext } from './tooltip-provider';
import { injectRdxTooltipConfig, RdxTrackCursorAxis } from './tooltip.config';
import { createTooltipTimer } from './utils';

export interface RdxTooltipTriggerRegistration {
    closeDelay: Signal<number | undefined>;
    disabled: Signal<boolean>;
}

interface RdxTooltipRegisteredTrigger {
    element: HTMLElement;
    payload: () => unknown;
    options?: RdxTooltipTriggerRegistration;
}

interface RdxTooltipTriggerSelection {
    id: string | null;
    external?: { element: HTMLElement; payload: unknown };
}

export interface RdxTooltipContext {
    contentId: string;
    isOpen: Signal<boolean>;
    present: Signal<boolean>;
    renderLifecycle: RdxRenderLifecycle;
    /** Whether the tooltip opened/closed without waiting for the delay. */
    instant: Signal<boolean>;
    /** Why the open/close was instant (Base UI `data-instant`), or `undefined` when it was animated. */
    instantType: Signal<RdxTooltipInstantType | undefined>;
    disabled: Signal<boolean>;
    disableHoverablePopup: Signal<boolean>;
    trackCursorAxis: Signal<RdxTrackCursorAxis>;
    /** The active trigger element. */
    trigger: Signal<HTMLElement | undefined>;
    triggers: Signal<HTMLElement[]>;
    payload: Signal<unknown>;
    open: (trigger?: HTMLElement, payload?: unknown, event?: Event, reason?: RdxTooltipOpenChangeReason) => void;
    close: (reason?: RdxTooltipOpenChangeReason, event?: Event) => void;
    openChangeReason: Signal<RdxTooltipOpenChangeReason>;
    cancelPendingOpen: (trigger?: HTMLElement) => void;
    closeHoverOpen: (event?: Event) => void;
    /** Closes after the resolved hover close delay. */
    closeDelayed: (event?: Event) => void;
    registerTrigger: (
        id: string,
        trigger: HTMLElement,
        payload: () => unknown,
        options?: RdxTooltipTriggerRegistration
    ) => () => void;
    /** Hover entered a trigger — opens after the resolved delay (or instantly). */
    onTriggerEnter: (trigger: HTMLElement, payload: unknown, event: Event, delay?: number) => void;
    /** Hover left a trigger — cancels a pending open and closes when appropriate. */
    onTriggerLeave: (trigger: HTMLElement, event: Event) => void;
    onTriggerBlur: (trigger: HTMLElement, event: FocusEvent) => void;
    setCursorPosition: (position: { x: number; y: number } | undefined) => void;
}

/**
 * Why the tooltip opened/closed instantly (no transition). Mirrors Base UI's tooltip `data-instant`
 * value: `'delay'` (opened within the skip-delay instant window), `'focus'` (opened by focus),
 * `'dismiss'` (closed by Escape / outside press), `'tracking-cursor'` (following the cursor).
 */
export type RdxTooltipInstantType = 'delay' | 'dismiss' | 'focus' | 'tracking-cursor';

export type RdxTooltipOpenChangeReason =
    | 'trigger-hover'
    | 'trigger-focus'
    | 'trigger-press'
    | 'outside-press'
    | 'escape-key'
    | 'disabled'
    | 'imperative-action'
    | 'none';

export type RdxTooltipOpenChangeEventDetails = RdxCancelableChangeEventDetails<RdxTooltipOpenChangeReason>;

export interface RdxTooltipOpenChangeEvent {
    open: boolean;
    eventDetails: RdxTooltipOpenChangeEventDetails;
}

export const [injectRdxTooltipContext, provideRdxTooltipContext] = createContext<RdxTooltipContext>(
    'RdxTooltipContext',
    'components/tooltip'
);

const context = () => contextFor(inject(RdxTooltip));

@Directive({
    selector: '[rdxTooltip]',
    exportAs: 'rdxTooltip',
    providers: [
        provideRdxTooltipContext(context),
        provideFloatingTree(),
        provideFloatingRootContext(() => inject(RdxTooltip).floatingContext)
    ],
    hostDirectives: [RdxPopper]
})
export class RdxTooltip {
    private readonly defaultConfig = injectRdxTooltipConfig();
    private readonly provider = injectRdxTooltipProviderContext(true);
    private readonly popper = inject(RdxPopper);
    private readonly destroyRef = inject(DestroyRef);
    private readonly uncontrolledOpen = signal(false);
    private readonly registeredTriggers = signal<ReadonlyMap<string, RdxTooltipRegisteredTrigger>>(new Map());
    private readonly localTrigger = signal<RdxTooltipTriggerSelection>({ id: null });
    // Commit trigger and lifecycle metadata when the controlled input changes.
    private pendingOpenChange?: { open: boolean; commit: () => void };

    /**
     * Per-popup floating root context (ADR 0015) — the shared store the positioner's dismissal
     * capability reads (`open`, `triggers`, the reference/floating elements). The tree node is
     * registered by the positioner; this context exists independently so dismissal can read `open()`.
     */
    readonly floatingContext: RdxFloatingRootContext = createFloatingRootContext({
        ownerDocument: inject(ElementRef).nativeElement.ownerDocument,
        open: () => this.open()
    });

    /**
     * Controls whether the tooltip is open. When omitted, the root manages its own state.
     */
    readonly openInput = input<boolean | undefined, BooleanInput>(undefined, {
        alias: 'open',
        transform: (value) => (value === undefined ? undefined : booleanAttribute(value))
    });
    private readonly openState = computed(() => this.openInput() ?? this.uncontrolledOpen());
    readonly open = computed(() => !this.disabled() && this.openState());

    /** Emitted for open/close requests that were not canceled. Supports `[(open)]`. */
    readonly openChange = output<boolean>();

    /**
     * Whether the tooltip is initially open. Uncontrolled.
     */
    readonly defaultOpen = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** ID of the active trigger. Null or undefined falls back to the local selection. */
    readonly triggerIdInput = input<string | null>(undefined, { alias: 'triggerId' });

    /** ID of the trigger associated with an initially open uncontrolled tooltip. */
    readonly defaultTriggerId = input<string | null>(null);

    /** Accepted requests to change the active trigger. Supports `[(triggerId)]`. */
    readonly triggerIdChange = output<string | null>();

    private readonly implicitTriggerId = computed(() => {
        if (!this.open() || this.localTrigger().external) return null;
        const triggers = this.registeredTriggers();
        return triggers.size === 1 ? (triggers.keys().next().value ?? null) : null;
    });

    readonly triggerId = computed(() => this.triggerIdInput() ?? this.localTrigger().id ?? this.implicitTriggerId());

    /**
     * How long to wait before opening the tooltip. Specified in milliseconds.
     * Falls back to the surrounding provider, then to the global config.
     */
    readonly delay = input<number | undefined, NumberInput | undefined>(undefined, {
        transform: (value) => (value == null ? undefined : numberAttribute(value))
    });

    /**
     * How long to wait before closing the tooltip. Specified in milliseconds.
     */
    readonly closeDelay = input<number | undefined, NumberInput | undefined>(undefined, {
        transform: (value) => (value == null ? undefined : numberAttribute(value))
    });

    /**
     * When `true`, the tooltip closes as the pointer leaves the trigger instead of
     * staying open while the pointer moves over the popup.
     */
    readonly disableHoverablePopup = input<boolean, BooleanInput>(this.defaultConfig.disableHoverablePopup, {
        transform: booleanAttribute
    });

    /**
     * Determines which axis the tooltip should track the cursor on.
     */
    readonly trackCursorAxis = input<RdxTrackCursorAxis>('none');

    /**
     * Hides the tooltip and requests closure if it was open.
     */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Associates this root with detached trigger elements.
     */
    readonly handle = input<RdxTooltipHandle<unknown>>();

    /**
     * A cancellable request to change the open state.
     */
    readonly onOpenChange = output<RdxTooltipOpenChangeEvent>();

    readonly contentId = injectId('rdx-tooltip-content-');
    private readonly activeRegistration = computed(() => {
        const id = this.triggerId();
        return id === null ? undefined : this.registeredTriggers().get(id);
    });
    private readonly externalTrigger = computed(() => {
        const local = this.localTrigger();
        return local.id === this.triggerId() ? local.external : undefined;
    });
    private readonly detachedPayload = linkedSignal<string | null, { value: unknown } | undefined>({
        source: this.triggerId,
        computation: () => undefined
    });
    readonly trigger = computed(() => this.activeRegistration()?.element ?? this.externalTrigger()?.element);
    readonly triggers = computed(() => Array.from(this.registeredTriggers().values(), ({ element }) => element));
    readonly payload = computed(() => {
        const active = this.activeRegistration();
        if (active) return active.payload();
        const external = this.externalTrigger();
        return external ? external.payload : this.detachedPayload()?.value;
    });
    readonly cursorPosition = signal<{ x: number; y: number } | undefined>(undefined);
    readonly openChangeReason = signal<RdxTooltipOpenChangeReason>('none');
    private readonly preventUnmountOnClose = signal(false);

    private readonly openedInstant = signal(false);
    private readonly openedInstantType = signal<RdxTooltipInstantType | undefined>(undefined);

    /** Whether the most recent open happened without the delay. */
    readonly instant = this.openedInstant.asReadonly();
    /**
     * Reason the open/close was instant (Base UI `data-instant`). Cursor tracking takes precedence
     * while open — the popup follows the cursor, so its position updates can never be transitioned.
     */
    readonly instantType = computed<RdxTooltipInstantType | undefined>(() =>
        this.open() && this.trackCursorAxis() !== 'none' ? 'tracking-cursor' : this.openedInstantType()
    );
    /** @internal Shared with structural Portal. */
    readonly renderLifecycle = useRenderLifecycle(
        (open) => {
            if (!open && !this.openState() && !this.preventUnmountOnClose()) {
                this.localTrigger.set({ id: null });
                this.detachedPayload.set(undefined);
            }
        },
        { open: () => this.open() }
    );
    readonly present = computed(() => this.open() || this.preventUnmountOnClose());

    private readonly virtualAnchor = computed<ReferenceElement | undefined>(() => {
        const axis = this.trackCursorAxis();
        const element = this.trigger();

        if (axis === 'none' || !element) {
            return element;
        }

        const position = this.cursorPosition();

        if (!position) {
            return element;
        }

        const followX = axis === 'x' || axis === 'both';
        const followY = axis === 'y' || axis === 'both';

        return {
            getBoundingClientRect: () => {
                const rect = element.getBoundingClientRect();
                const width = followX ? 0 : rect.width;
                const height = followY ? 0 : rect.height;
                const x = followX ? position.x : rect.x;
                const y = followY ? position.y : rect.y;

                return { width, height, x, y, top: y, left: x, right: x + width, bottom: y + height };
            }
        };
    });

    private pendingHoverTrigger?: HTMLElement;
    private readonly openTimer = createTooltipTimer(this.destroyRef);
    private readonly closeTimer = createTooltipTimer(this.destroyRef);
    private readonly blurTimer = createTooltipTimer(this.destroyRef);
    private readonly closeForSibling = () => {
        if (!this.destroyRef.destroyed && this.open()) this.close('none');
    };

    constructor() {
        watch([], () => {
            this.localTrigger.set({ id: this.defaultTriggerId() });
            this.uncontrolledOpen.set(this.defaultOpen());
        });

        afterRenderEffect({
            read: () => {
                if (this.triggerIdInput() != null || this.localTrigger().id !== null) return;

                const id = this.implicitTriggerId();
                if (id !== null) this.localTrigger.set({ id });
            }
        });

        let previousState = false;
        watch([this.openState, this.openInput], ([open, supplied]) => {
            if (supplied === undefined) this.pendingOpenChange = undefined;
            if (open === previousState) return;

            previousState = open;
            const pending = this.pendingOpenChange;
            this.pendingOpenChange = undefined;
            if (pending?.open === open) {
                pending.commit();
            } else if (supplied !== undefined) {
                this.openChangeReason.set('none');
            }
        });

        watch([this.disabled, this.openState], ([disabled, open]) => {
            if (!disabled) return;

            if (this.pendingOpenChange?.open) this.pendingOpenChange = undefined;
            if (open) this.close('disabled');
            else this.cancelPendingOpen();
        });

        let previousOpen = false;
        watch([this.open], ([open]) => {
            if (open === previousOpen) return;

            previousOpen = open;
            this.cancelPendingInteractions();
            this.renderLifecycle.start(open);
            if (open) {
                this.preventUnmountOnClose.set(false);
                this.provider?.onOpen(this.closeForSibling);
            } else {
                this.provider?.onClose(this.closeForSibling);
                this.openedInstant.set(false);
                this.openedInstantType.set(undefined);
            }
        });

        this.destroyRef.onDestroy(() => {
            if (previousOpen) this.provider?.onClose(this.closeForSibling);
        });

        effect((onCleanup) => {
            const handle = this.handle();

            if (handle) {
                onCleanup(untracked(() => handle.registerRoot(contextFor(this))));
            }
        });

        // Keep the popper anchored to the active trigger, or to the cursor while tracking.
        effect(() => this.popper.anchorOverride.set(this.virtualAnchor()));

        // Sync the dismissal reference (the active trigger) so an outside-press on the trigger counts
        // as "inside" and never dismisses (ADR 0015).
        effect(() => this.floatingContext.setReferenceElement(this.trigger() ?? null));
    }

    /** Opens immediately, optionally switching the active trigger/payload. */
    show(
        trigger = this.trigger(),
        payload?: unknown,
        event?: Event,
        reason: RdxTooltipOpenChangeReason = 'trigger-focus'
    ) {
        this.blurTimer.stop();
        this.applyOpen(true, trigger, payload, reason, event);
    }

    close(reason: RdxTooltipOpenChangeReason = 'none', event?: Event) {
        this.cancelPendingInteractions();
        this.applyClose(reason, event);
    }

    private cancelPendingInteractions(): void {
        this.cancelPendingOpen();
        this.closeTimer.stop();
        this.blurTimer.stop();
    }

    cancelPendingOpen(trigger?: HTMLElement): void {
        if (trigger && this.pendingHoverTrigger !== trigger) return;

        this.pendingHoverTrigger = undefined;
        this.openTimer.stop();
    }

    closeHoverOpen(event?: Event): void {
        this.cancelPendingOpen();
        this.closeTimer.stop();
        if (this.open() && this.openChangeReason() === 'trigger-hover') {
            this.applyClose('trigger-hover', event);
        }
    }

    /** Closes after the current hover close delay. */
    scheduleClose(event?: Event) {
        this.cancelPendingOpen();
        const trigger = this.trigger();
        if (!this.open() || !trigger) return;
        const options = this.activeRegistration()?.options;
        if (options?.disabled()) return;
        if (this.openChangeReason() === 'trigger-focus' && trigger.contains(getActiveElement(trigger.ownerDocument))) {
            return;
        }

        const delay =
            options?.closeDelay() ?? this.closeDelay() ?? this.provider?.closeDelay() ?? this.defaultConfig.closeDelay;
        if (delay <= 0) {
            this.applyClose('trigger-hover', event);
        } else {
            this.closeTimer.start(() => this.applyClose('trigger-hover', event), delay);
        }
    }

    /** Hover entered — open after the delay, or instantly within the provider's window. */
    onTriggerEnter(trigger: HTMLElement, payload: unknown, event: Event, delay?: number) {
        if (this.disabled()) return;

        this.closeTimer.stop();
        if (this.open() && this.trigger() === trigger) return;
        const resolvedDelay = delay ?? this.delay() ?? this.provider?.delay() ?? this.defaultConfig.delay;
        if (this.provider?.isInstant() || resolvedDelay <= 0) {
            this.applyOpen(true, trigger, payload, 'trigger-hover', event);
        } else {
            this.pendingHoverTrigger = trigger;
            this.openTimer.start(() => this.applyOpen(false, trigger, payload, 'trigger-hover', event), resolvedDelay);
        }
    }

    onTriggerLeave(trigger: HTMLElement, event: Event) {
        this.cancelPendingOpen(trigger);

        if (this.disableHoverablePopup() && this.trigger() === trigger) {
            this.scheduleClose(event);
        }
        // Otherwise the positioner's grace area decides when to close.
    }

    onTriggerBlur(trigger: HTMLElement, event: FocusEvent): void {
        this.blurTimer.start(() => {
            if (!this.open() || this.trigger() !== trigger) return;

            const activeElement = getActiveElement(trigger.ownerDocument);
            if (trigger.contains(activeElement) || this.floatingContext.floatingElement?.contains(activeElement)) {
                return;
            }

            const next = isNode(event.relatedTarget) ? event.relatedTarget : activeElement;
            if (
                Array.from(this.registeredTriggers().values()).some(
                    ({ element, options }) => element.contains(next) && !options?.disabled()
                )
            ) {
                return;
            }

            this.close('trigger-focus', event);
        }, 0);
    }

    registerTrigger(id: string, trigger: HTMLElement, payload: () => unknown, options?: RdxTooltipTriggerRegistration) {
        const registration = { element: trigger, payload, options };
        const previous = this.registeredTriggers().get(id);
        if (previous && previous.element !== trigger) this.floatingContext.triggers.delete(previous.element);

        this.registeredTriggers.update((triggers) => new Map(triggers).set(id, registration));
        this.floatingContext.triggers.add(trigger);

        return () => {
            const triggers = this.registeredTriggers();
            if (triggers.get(id) !== registration) return;

            const lostActiveTrigger = this.open() && this.triggerId() === id;
            if (lostActiveTrigger) this.detachedPayload.set({ value: payload() });
            this.cancelPendingOpen(trigger);
            const remaining = new Map(triggers);
            remaining.delete(id);
            this.registeredTriggers.set(remaining);
            this.floatingContext.triggers.delete(trigger);

            if (lostActiveTrigger) {
                // Allow a replacement view or a changed ID to register before treating the anchor as lost.
                queueMicrotask(() => {
                    if (this.destroyRef.destroyed || !this.open() || this.triggerId() !== id) return;
                    if (this.registeredTriggers().has(id)) return;

                    const replacementId = this.registeredId(trigger);
                    if (replacementId !== undefined && this.triggerIdInput() == null) {
                        this.localTrigger.set({ id: replacementId });
                        return;
                    }
                    this.close('none');
                });
            }
        };
    }

    private registeredId(trigger: HTMLElement): string | undefined {
        for (const [id, registration] of this.registeredTriggers()) {
            if (registration.element === trigger) return id;
        }
        return undefined;
    }

    setCursorPosition(position: { x: number; y: number } | undefined) {
        this.cursorPosition.set(position);
    }

    private applyOpen(
        instant: boolean,
        trigger = this.trigger(),
        payload?: unknown,
        reason: RdxTooltipOpenChangeReason = 'none',
        event?: Event
    ) {
        this.cancelPendingOpen();
        if (this.disabled() || (trigger && !trigger.isConnected)) {
            return;
        }
        const wasOpen = this.open();
        const selection = this.requestedTriggerSelection(trigger, payload);
        const changesTrigger = selection !== undefined && selection.id !== this.triggerId();

        this.closeTimer.stop();

        if (!wasOpen || changesTrigger || reason === 'imperative-action') {
            const { eventDetails } = createCancelableChangeEventDetails(
                reason,
                event ?? new Event('tooltip.open-change'),
                trigger
            );
            this.onOpenChange.emit({ open: true, eventDetails });

            if (eventDetails.isCanceled()) {
                return;
            }
        }

        const inInstantGroup = this.provider?.isInstant() ?? false;
        const commit = () => {
            if (selection && (!selection.external || selection.external.element.isConnected)) {
                this.localTrigger.set(selection);
            }
            this.openedInstant.set(instant || inInstantGroup);
            this.openedInstantType.set(inInstantGroup ? 'delay' : reason === 'trigger-focus' ? 'focus' : undefined);
            this.preventUnmountOnClose.set(false);
            this.openChangeReason.set(reason);
        };
        if (wasOpen) {
            commit();
            if (changesTrigger) this.triggerIdChange.emit(selection.id);
        } else {
            this.acceptOpenRequest(true, commit, changesTrigger ? selection.id : undefined);
        }
    }

    private requestedTriggerSelection(
        trigger: HTMLElement | undefined,
        payload: unknown
    ): RdxTooltipTriggerSelection | undefined {
        if (!trigger) return undefined;

        const id = this.registeredId(trigger);
        return id !== undefined ? { id } : { id: trigger.id || null, external: { element: trigger, payload } };
    }

    private applyClose(reason: RdxTooltipOpenChangeReason = 'none', event?: Event) {
        if (!this.openState()) {
            return;
        }
        const trigger = this.trigger();
        const change = createCancelableChangeEventDetails(
            reason,
            event ?? new Event('tooltip.open-change'),
            trigger?.isConnected ? trigger : undefined
        );
        const { eventDetails } = change;
        this.onOpenChange.emit({ open: false, eventDetails });

        if (eventDetails.isCanceled()) {
            return;
        }
        const isInstant = this.provider?.isInstant() ?? false;
        const retain = change.shouldPreventUnmountOnClose();
        this.acceptOpenRequest(false, () => {
            this.preventUnmountOnClose.set(retain);
            this.openedInstant.set(isInstant);
            this.openedInstantType.set(
                reason === 'escape-key' || reason === 'outside-press' ? 'dismiss' : isInstant ? 'delay' : undefined
            );
            this.openChangeReason.set(reason);
        });
    }

    private acceptOpenRequest(open: boolean, commit: () => void, requestedTriggerId?: string | null): void {
        if (this.openInput() === undefined) {
            this.uncontrolledOpen.set(open);
            commit();
        } else {
            this.pendingOpenChange = { open, commit };
        }
        if (requestedTriggerId !== undefined) this.triggerIdChange.emit(requestedTriggerId);
        this.openChange.emit(open);
    }
}

function contextFor(root: RdxTooltip): RdxTooltipContext {
    return {
        contentId: root.contentId,
        isOpen: root.open,
        present: root.present,
        renderLifecycle: root.renderLifecycle,
        instant: root.instant,
        instantType: root.instantType,
        disabled: root.disabled,
        disableHoverablePopup: root.disableHoverablePopup,
        trackCursorAxis: root.trackCursorAxis,
        trigger: root.trigger,
        triggers: root.triggers,
        payload: root.payload,
        openChangeReason: root.openChangeReason.asReadonly(),
        open: (trigger, payload, event, reason) => root.show(trigger, payload, event, reason),
        close: (reason?: RdxTooltipOpenChangeReason, event?: Event) => root.close(reason, event),
        cancelPendingOpen: (trigger) => root.cancelPendingOpen(trigger),
        closeHoverOpen: (event) => root.closeHoverOpen(event),
        closeDelayed: (event) => root.scheduleClose(event),
        registerTrigger: (id, trigger, payload, options) => root.registerTrigger(id, trigger, payload, options),
        onTriggerEnter: (trigger, payload, event, delay) => root.onTriggerEnter(trigger, payload, event, delay),
        onTriggerLeave: (trigger, event) => root.onTriggerLeave(trigger, event),
        onTriggerBlur: (trigger, event) => root.onTriggerBlur(trigger, event),
        setCursorPosition: (position) => root.setCursorPosition(position)
    };
}
