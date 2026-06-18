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
    /** Whether the tooltip opened/closed without waiting for the delay. */
    instant: Signal<boolean>;
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
    private hasAppliedDefaultOpen = false;

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
     * Whether the tooltip is currently open.
     */
    readonly open = model(false);

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
    readonly handle = input<RdxTooltipHandle<any>>();

    /**
     * Event handler called when the open state changes.
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
    private suppressNextOpenChangeEmit = false;

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

    private readonly openTimer = useTimeoutFn(
        () => this.applyOpen(false, this.trigger(), this.payload(), 'trigger-hover'),
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
        effect(() => {
            const defaultOpen = this.defaultOpen();

            if (!this.hasAppliedDefaultOpen && defaultOpen) {
                this.hasAppliedDefaultOpen = true;
                this.open.set(defaultOpen);
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

        watch(
            [this.open],
            ([isOpen]) => {
                if (this.suppressNextOpenChangeEmit) {
                    this.suppressNextOpenChangeEmit = false;
                } else {
                    const { eventDetails } = createCancelableChangeEventDetails(
                        this.openChangeReason(),
                        new Event('tooltip.open-change'),
                        this.trigger()
                    );
                    this.onOpenChange.emit({ open: isOpen, eventDetails });
                }

                if (isOpen) {
                    this.preventUnmountOnClose.set(false);
                    this.instantGroup.onOpen();
                } else {
                    this.instantGroup.onClose();
                    this.openedInstant.set(false);
                }
            },
            { defer: true }
        );
    }

    /** Opens immediately, optionally switching the active trigger/payload. */
    show(trigger = this.trigger(), payload?: unknown, event?: Event) {
        this.applyOpen(true, trigger, payload, 'trigger-focus', event);
    }

    close(reason: RdxTooltipOpenChangeReason = 'none', event?: Event) {
        this.openTimer.stop();
        this.closeTimer.stop();
        this.applyClose(reason, event);
    }

    cancelPendingOpen(): void {
        this.openTimer.stop();
    }

    closeHoverOpen(event?: Event): void {
        this.openTimer.stop();
        this.closeTimer.stop();
        if (this.open() && this.openChangeReason() === 'trigger-hover') {
            this.applyClose('trigger-hover', event);
        }
    }

    /** Closes after the resolved close delay, e.g. when the pointer or focus leaves. */
    scheduleClose(event?: Event) {
        this.openTimer.stop();

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

        if (trigger) {
            this.trigger.set(trigger);
        }

        this.payload.set(payload);
        this.closeTimer.stop();

        if (this.instantGroup.isInstant() || this.resolvedDelay() <= 0) {
            this.applyOpen(true, trigger, payload, 'trigger-hover', event);
        } else {
            this.openTimer.start();
        }
    }

    onTriggerLeave() {
        this.openTimer.stop();

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
        if (this.disabled()) {
            return;
        }
        const wasOpen = this.open();

        this.openTimer.stop();
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
            this.suppressNextOpenChangeEmit = true;
        }

        if (trigger) {
            this.trigger.set(trigger);
        }

        if (payload !== undefined) {
            this.payload.set(payload);
        }

        this.openedInstant.set(instant || this.instantGroup.isInstant());
        this.preventUnmountOnClose.set(false);
        this.openChangeReason.set(reason);
        this.open.set(true);
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
        this.suppressNextOpenChangeEmit = true;
        this.preventUnmountOnClose.set(change.shouldPreventUnmountOnClose());
        this.openedInstant.set(this.instantGroup.isInstant());
        this.openChangeReason.set(reason);
        this.open.set(false);
    }
}

function contextFor(root: RdxTooltip): RdxTooltipContext {
    return {
        contentId: root.contentId,
        isOpen: root.open,
        present: root.present,
        instant: root.instant,
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
