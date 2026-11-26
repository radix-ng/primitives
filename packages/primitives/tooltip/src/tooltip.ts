import {
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
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
    injectId,
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
import { createTooltipInstantController, TooltipInstantController, useTimeoutFn } from './utils';

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
    open: (trigger?: HTMLElement, payload?: unknown, event?: Event) => void;
    close: (reason?: RdxTooltipOpenChangeReason, event?: Event) => void;
    openChangeReason: Signal<RdxTooltipOpenChangeReason>;
    cancelPendingOpen: () => void;
    closeHoverOpen: (event?: Event) => void;
    /** Closes after the resolved close delay (used when hover/focus is lost). */
    closeDelayed: (event?: Event) => void;
    registerTrigger: (trigger: HTMLElement) => () => void;
    /** Hover entered a trigger — opens after the resolved delay (or instantly). */
    onTriggerEnter: (trigger?: HTMLElement, payload?: unknown, event?: Event) => void;
    /** Hover left a trigger — cancels a pending open and closes when appropriate. */
    onTriggerLeave: () => void;
    setCursorPosition: (position: { x: number; y: number } | undefined) => void;
    setDelays: (delay: number | undefined, closeDelay: number | undefined) => void;
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
    readonly open = computed(() => this.openInput() ?? this.uncontrolledOpen());

    /** Emitted for open/close requests that were not canceled. Supports `[(open)]`. */
    readonly openChange = output<boolean>();

    /**
     * Whether the tooltip is initially open. Uncontrolled.
     */
    readonly defaultOpen = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

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
     * When `true`, the tooltip will not open.
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
    readonly trigger = signal<HTMLElement | undefined>(undefined);
    readonly triggers = signal<HTMLElement[]>([]);
    readonly payload = signal<unknown>(undefined);
    readonly cursorPosition = signal<{ x: number; y: number } | undefined>(undefined);
    readonly openChangeReason = signal<RdxTooltipOpenChangeReason>('none');
    private readonly preventUnmountOnClose = signal(false);

    private readonly openedInstant = signal(false);
    private readonly openedInstantType = signal<RdxTooltipInstantType | undefined>(undefined);

    /** Local instant window used when this tooltip is not inside a provider. */
    private readonly localInstant: TooltipInstantController = createTooltipInstantController(
        () => this.defaultConfig.timeout,
        this.destroyRef
    );

    private readonly instantGroup = this.provider ?? this.localInstant;

    /** Per-trigger overrides set by the active trigger, taking precedence over the root/provider. */
    private readonly triggerDelay = signal<number | undefined>(undefined);
    private readonly triggerCloseDelay = signal<number | undefined>(undefined);

    private readonly resolvedDelay = computed(
        () => this.triggerDelay() ?? this.delay() ?? this.provider?.delay() ?? this.defaultConfig.delay
    );
    private readonly resolvedCloseDelay = computed(
        () =>
            this.triggerCloseDelay() ??
            this.closeDelay() ??
            this.provider?.closeDelay() ??
            this.defaultConfig.closeDelay
    );

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
    readonly renderLifecycle = useRenderLifecycle(undefined, { open: () => this.open() });
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

    private pendingHoverOpen?: () => void;
    private readonly openTimer = useTimeoutFn(
        () => this.pendingHoverOpen?.(),
        () => this.resolvedDelay(),
        { immediate: false },
        this.destroyRef
    );

    private readonly closeTimer = useTimeoutFn(
        () => this.applyClose(),
        () => this.resolvedCloseDelay(),
        { immediate: false },
        this.destroyRef
    );

    constructor() {
        watch([], () => {
            this.uncontrolledOpen.set(this.defaultOpen());
        });

        let previousOpen = false;
        watch([this.open, this.openInput], ([open, supplied]) => {
            if (supplied === undefined) this.pendingOpenChange = undefined;
            if (open === previousOpen) return;

            previousOpen = open;
            const pending = this.pendingOpenChange;
            this.pendingOpenChange = undefined;
            if (pending?.open === open) {
                pending.commit();
            } else if (supplied !== undefined) {
                this.openChangeReason.set('none');
            }

            this.renderLifecycle.start(open);
            if (open) {
                this.preventUnmountOnClose.set(false);
                this.instantGroup.onOpen();
            } else {
                this.instantGroup.onClose();
                this.openedInstant.set(false);
                this.openedInstantType.set(undefined);
            }
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
    show(trigger = this.trigger(), payload?: unknown, event?: Event) {
        this.applyOpen(true, trigger, payload, 'trigger-focus', event);
    }

    close(reason: RdxTooltipOpenChangeReason = 'none', event?: Event) {
        this.cancelPendingOpen();
        this.closeTimer.stop();
        this.applyClose(reason, event);
    }

    cancelPendingOpen(): void {
        this.pendingHoverOpen = undefined;
        this.openTimer.stop();
    }

    closeHoverOpen(event?: Event): void {
        this.cancelPendingOpen();
        this.closeTimer.stop();
        if (this.open() && this.openChangeReason() === 'trigger-hover') {
            this.applyClose('trigger-hover', event);
        }
    }

    /** Closes after the resolved close delay, e.g. when the pointer or focus leaves. */
    scheduleClose(event?: Event) {
        this.cancelPendingOpen();

        if (this.resolvedCloseDelay() <= 0) {
            this.applyClose('trigger-hover', event);
        } else {
            this.closeTimer.start();
        }
    }

    /** Hover/focus entered — open after the delay, or instantly within the instant window. */
    onTriggerEnter(trigger = this.trigger(), payload?: unknown, event?: Event) {
        if (this.disabled()) {
            return;
        }

        this.closeTimer.stop();

        if (this.instantGroup.isInstant() || this.resolvedDelay() <= 0) {
            this.applyOpen(true, trigger, payload, 'trigger-hover', event);
        } else {
            this.pendingHoverOpen = () => this.applyOpen(false, trigger, payload, 'trigger-hover', event);
            this.openTimer.start();
        }
    }

    onTriggerLeave() {
        this.cancelPendingOpen();

        if (this.disableHoverablePopup()) {
            this.scheduleClose();
        }
        // Otherwise the positioner's grace area decides when to close.
    }

    registerTrigger(trigger: HTMLElement) {
        this.triggers.update((triggers) => (triggers.includes(trigger) ? triggers : [...triggers, trigger]));
        this.floatingContext.triggers.add(trigger);

        if (!this.trigger()) {
            this.trigger.set(trigger);
        }

        return () => {
            this.triggers.update((triggers) => triggers.filter((candidate) => candidate !== trigger));
            this.floatingContext.triggers.delete(trigger);

            if (this.trigger() === trigger) {
                const nextTrigger = this.triggers()[0];
                this.trigger.set(nextTrigger);

                if (!nextTrigger && !this.destroyRef.destroyed) {
                    this.applyClose('none');
                }
            }
        };
    }

    setCursorPosition(position: { x: number; y: number } | undefined) {
        this.cursorPosition.set(position);
    }

    /** Applies per-trigger delay overrides from the trigger that is becoming active. */
    setDelays(delay: number | undefined, closeDelay: number | undefined) {
        this.triggerDelay.set(delay);
        this.triggerCloseDelay.set(closeDelay);
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

        this.closeTimer.stop();

        if (!wasOpen) {
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

        const isInstant = instant || this.instantGroup.isInstant();
        const commit = () => {
            if (trigger?.isConnected) {
                this.trigger.set(trigger);
                this.payload.set(payload);
            } else {
                this.payload.set(undefined);
            }
            this.openedInstant.set(isInstant);
            this.openedInstantType.set(isInstant ? (reason === 'trigger-focus' ? 'focus' : 'delay') : undefined);
            this.preventUnmountOnClose.set(false);
            this.openChangeReason.set(reason);
        };
        if (wasOpen) {
            commit();
        } else {
            this.acceptOpenRequest(true, commit);
        }
    }

    private applyClose(reason: RdxTooltipOpenChangeReason = 'none', event?: Event) {
        if (!this.open()) {
            return;
        }
        const change = createCancelableChangeEventDetails(
            reason,
            event ?? new Event('tooltip.open-change'),
            this.trigger()
        );
        const { eventDetails } = change;
        this.onOpenChange.emit({ open: false, eventDetails });

        if (eventDetails.isCanceled()) {
            return;
        }
        const isInstant = this.instantGroup.isInstant();
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

    private acceptOpenRequest(open: boolean, commit: () => void): void {
        if (this.openInput() === undefined) {
            this.uncontrolledOpen.set(open);
            commit();
        } else {
            this.pendingOpenChange = { open, commit };
        }
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
        trigger: root.trigger.asReadonly(),
        triggers: root.triggers.asReadonly(),
        payload: root.payload.asReadonly(),
        openChangeReason: root.openChangeReason.asReadonly(),
        open: (trigger?: HTMLElement, payload?: unknown, event?: Event) => root.show(trigger, payload, event),
        close: (reason?: RdxTooltipOpenChangeReason, event?: Event) => root.close(reason, event),
        cancelPendingOpen: () => root.cancelPendingOpen(),
        closeHoverOpen: (event?: Event) => root.closeHoverOpen(event),
        closeDelayed: (event?: Event) => root.scheduleClose(event),
        registerTrigger: (trigger: HTMLElement) => root.registerTrigger(trigger),
        onTriggerEnter: (trigger?: HTMLElement, payload?: unknown, event?: Event) =>
            root.onTriggerEnter(trigger, payload, event),
        onTriggerLeave: () => root.onTriggerLeave(),
        setCursorPosition: (position) => root.setCursorPosition(position),
        setDelays: (delay, closeDelay) => root.setDelays(delay, closeDelay)
    };
}
