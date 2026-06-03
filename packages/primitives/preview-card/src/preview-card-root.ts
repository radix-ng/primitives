import { _IdGenerator } from '@angular/cdk/a11y';
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
    Signal,
    signal,
    untracked
} from '@angular/core';
import { createContext } from '@radix-ng/primitives/core';
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

export interface RdxPreviewCardOpenChange {
    open: boolean;
    triggerId: string | null;
    trigger: HTMLElement | undefined;
    reason: RdxPreviewCardOpenChangeReason;
    event: Event;
}

interface RdxPreviewCardRegisteredTrigger {
    element: HTMLElement;
    payload: () => unknown;
}

const context = () => contextFor(inject(RdxPreviewCardRoot));

export interface RdxPreviewCardRootContext {
    contentId: string;
    isOpen: Signal<boolean>;
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
    createContext<RdxPreviewCardRootContext>('RdxPreviewCardRootContext');

export type RdxPreviewCardTransitionStatus = 'starting' | 'ending' | undefined;

/**
 * Groups all parts of the preview-card.
 */
@Directive({
    selector: '[rdxPreviewCardRoot]',
    exportAs: 'rdxPreviewCardRoot',
    providers: [provideRdxPreviewCardRootContext(context)],
    hostDirectives: [RdxPopper]
})
export class RdxPreviewCardRoot {
    private readonly idGenerator = inject(_IdGenerator);
    private readonly popper = inject(RdxPopper);
    private readonly destroyRef = inject(DestroyRef);
    private readonly injector = inject(Injector);
    private hasAppliedDefaultOpen = false;
    private hasAppliedDefaultTriggerId = false;
    private openTimer: ReturnType<typeof setTimeout> | undefined;
    private closeTimer: ReturnType<typeof setTimeout> | undefined;
    private hoverDelay = 600;
    private hoverCloseDelay = 300;
    private transitionTimer: ReturnType<typeof setTimeout> | undefined;
    private transitionFrame: number | undefined;
    private transitionVersion = 0;
    private instantFrame: number | undefined;
    private transitionElement: HTMLElement | undefined;
    readonly isHoverActive = signal(false);
    readonly instant = signal(false);
    readonly openChangeReason = signal<RdxPreviewCardOpenChangeReason>('none');
    readonly transitionStatus = signal<RdxPreviewCardTransitionStatus>(undefined);

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

    readonly contentId = this.idGenerator.getId('rdx-preview-card-content-');
    readonly trigger = signal<HTMLElement | undefined>(undefined);
    readonly triggers = signal<HTMLElement[]>([]);
    readonly payload = signal<unknown>(undefined);
    readonly isPointerDownOnTrigger = signal(false);
    readonly onOpenChange = output<RdxPreviewCardOpenChange>();
    readonly onOpenChangeComplete = output<boolean>();
    private readonly registeredTriggers = new Map<string, RdxPreviewCardRegisteredTrigger>();
    private readonly viewportTriggerChange = new Set<(previous: HTMLElement, next: HTMLElement) => void>();

    readonly state = computed(() => (this.open() ? 'open' : 'closed'));

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
                untracked(() => this.beginTransition(open));
            }
        });

        effect((onCleanup) => {
            const handle = this.handle();

            if (handle) {
                onCleanup(untracked(() => handle.registerRoot(contextFor(this))));
            }
        });

        effect(() => this.popper.anchorOverride.set(this.trigger()));

        this.destroyRef.onDestroy(() => {
            this.clearHoverTimers();
            this.clearTransitionTimer();

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
        this.isHoverActive.set(fromHover);
        this.openChangeReason.set(reason);
        const previousTrigger = this.trigger();
        const changedTriggerWhileOpen = this.open() && previousTrigger !== trigger;
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
        const changed = !this.open() || previousTrigger !== trigger;
        this.open.set(true);

        if (changed) {
            this.emitOpenChange(true, reason, event);
        }
    }

    close(reason: RdxPreviewCardOpenChangeReason = 'none', event = new Event('preview-card.open-change')) {
        this.clearHoverTimers();
        this.isHoverActive.set(false);

        if (!this.open()) {
            return;
        }

        this.instant.set(reason !== 'none' && reason !== 'trigger-hover');
        this.openChangeReason.set(reason);
        this.open.set(false);
        this.emitOpenChange(false, reason, event);
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

            if (this.destroyRef.destroyed) {
                return;
            }

            if (this.trigger() === trigger) {
                const next = this.registeredTriggers.entries().next().value as
                    | [string, RdxPreviewCardRegisteredTrigger]
                    | undefined;

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
        this.transitionElement = element;

        return () => {
            if (this.transitionElement === element) {
                this.transitionElement = undefined;
            }
        };
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

    private emitOpenChange(open: boolean, reason: RdxPreviewCardOpenChangeReason, event: Event) {
        this.onOpenChange.emit({
            open,
            triggerId: this.triggerId(),
            trigger: this.trigger(),
            reason,
            event
        });
    }

    private beginTransition(open: boolean) {
        const version = ++this.transitionVersion;
        this.clearTransitionTimer();
        this.transitionStatus.set(open ? 'starting' : 'ending');

        afterNextRender(
            () => {
                if (this.destroyRef.destroyed || version !== this.transitionVersion) {
                    return;
                }

                if (open) {
                    this.transitionFrame = requestAnimationFrame(() => {
                        this.transitionFrame = undefined;

                        if (this.destroyRef.destroyed || version !== this.transitionVersion) {
                            return;
                        }

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
        if (version !== this.transitionVersion) {
            return;
        }

        this.clearTransitionTimer();
        this.transitionStatus.set(undefined);
        this.instant.set(false);

        if (!this.destroyRef.destroyed) {
            this.onOpenChangeComplete.emit(open);
        }
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

    private clearTransitionTimer() {
        if (this.transitionFrame !== undefined) {
            cancelAnimationFrame(this.transitionFrame);
            this.transitionFrame = undefined;
        }

        if (this.transitionTimer !== undefined) {
            clearTimeout(this.transitionTimer);
            this.transitionTimer = undefined;
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
        transitionStatus: root.transitionStatus.asReadonly(),
        registerViewport: (onTriggerChange) => root.registerViewport(onTriggerChange),
        toggle: (triggerId, trigger, payload, event) => root.toggle(triggerId, trigger, payload, event)
    };
}

function getMaxTransitionDuration(element: HTMLElement) {
    const styles = getComputedStyle(element);

    return Math.max(
        getMaxCssDuration(styles.transitionDuration, styles.transitionDelay),
        getMaxCssDuration(styles.animationDuration, styles.animationDelay)
    );
}

function getMaxCssDuration(durations: string, delays: string) {
    const parsedDurations = durations.split(',').map(parseCssTime);
    const parsedDelays = delays.split(',').map(parseCssTime);

    return parsedDurations.reduce(
        (max, duration, index) => Math.max(max, duration + parsedDelays[index % parsedDelays.length]),
        0
    );
}

function parseCssTime(value: string) {
    const trimmed = value.trim();
    const number = Number.parseFloat(trimmed);

    if (!Number.isFinite(number)) {
        return 0;
    }

    return trimmed.endsWith('ms') ? number : number * 1000;
}
