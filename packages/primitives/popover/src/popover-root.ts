import { _IdGenerator } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    inject,
    input,
    model,
    output,
    Signal,
    signal,
    untracked
} from '@angular/core';
import { createContext } from '@radix-ng/primitives/core';
import { RdxPopper } from '@radix-ng/primitives/popper';
import { RdxPopoverHandle } from './popover-handle';

export type RdxPopoverModal = boolean | 'trap-focus';
export type RdxPopoverOpenChangeReason =
    | 'trigger-hover'
    | 'trigger-press'
    | 'outside-press'
    | 'escape-key'
    | 'close-press'
    | 'focus-out'
    | 'imperative-action'
    | 'none';

export interface RdxPopoverOpenChange {
    open: boolean;
    triggerId: string | null;
    trigger: HTMLElement | undefined;
    reason: RdxPopoverOpenChangeReason;
    event: Event;
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
    modal: Signal<RdxPopoverModal>;
    titleId: Signal<string | undefined>;
    trigger: Signal<HTMLElement | undefined>;
    triggers: Signal<HTMLElement[]>;
    hasPopupClose: Signal<boolean>;
    isHoverActive: Signal<boolean>;
    isPointerDownOnTrigger: Signal<boolean>;
    close: (reason?: RdxPopoverOpenChangeReason, event?: Event) => void;
    cancelHoverClose: () => void;
    closeOnHover: (withGracePeriod?: boolean) => void;
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
    setHoverDelays: (delay: number, closeDelay: number) => void;
    registerPopupClose: () => () => void;
    registerViewport: (onTriggerChange: (previous: HTMLElement, next: HTMLElement) => void) => () => void;
    toggle: (triggerId: string, trigger: HTMLElement, payload?: unknown, event?: Event) => void;
}

export const [injectRdxPopoverRootContext, provideRdxPopoverRootContext] =
    createContext<RdxPopoverRootContext>('RdxPopoverRootContext');

/**
 * Groups all parts of the popover.
 */
@Directive({
    selector: '[rdxPopoverRoot]',
    exportAs: 'rdxPopoverRoot',
    providers: [provideRdxPopoverRootContext(context)],
    hostDirectives: [RdxPopper]
})
export class RdxPopoverRoot {
    private readonly idGenerator = inject(_IdGenerator);
    private readonly popper = inject(RdxPopper);
    private readonly destroyRef = inject(DestroyRef);
    private hasAppliedDefaultOpen = false;
    private hasAppliedDefaultTriggerId = false;
    private openTimer: ReturnType<typeof setTimeout> | undefined;
    private closeTimer: ReturnType<typeof setTimeout> | undefined;
    private hoverDelay = 300;
    private hoverCloseDelay = 0;
    readonly isHoverActive = signal(false);

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

    readonly contentId = this.idGenerator.getId('rdx-popover-content-');
    readonly descriptionId = signal<string | undefined>(undefined);
    readonly titleId = signal<string | undefined>(undefined);
    readonly trigger = signal<HTMLElement | undefined>(undefined);
    readonly triggers = signal<HTMLElement[]>([]);
    readonly payload = signal<unknown>(undefined);
    readonly isPointerDownOnTrigger = signal(false);
    readonly popupCloseCount = signal(0);
    readonly onOpenChange = output<RdxPopoverOpenChange>();
    private readonly registeredTriggers = new Map<string, RdxPopoverRegisteredTrigger>();
    private readonly viewportTriggerChange = new Set<(previous: HTMLElement, next: HTMLElement) => void>();

    readonly state = computed(() => (this.open() ? 'open' : 'closed'));

    constructor() {
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

        effect((onCleanup) => {
            const handle = this.handle();

            if (handle) {
                onCleanup(untracked(() => handle.registerRoot(contextFor(this))));
            }
        });

        effect(() => this.popper.anchorOverride.set(this.trigger()));

        this.destroyRef.onDestroy(() => this.clearHoverTimers());
    }

    show(
        trigger = this.trigger(),
        payload?: unknown,
        triggerId?: string,
        reason: RdxPopoverOpenChangeReason = 'none',
        event = new Event('popover.open-change'),
        fromHover = false
    ) {
        this.clearHoverTimers();
        this.isHoverActive.set(fromHover);
        const previousTrigger = this.trigger();

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

    close(reason: RdxPopoverOpenChangeReason = 'none', event = new Event('popover.open-change')) {
        this.clearHoverTimers();
        this.isHoverActive.set(false);

        if (!this.open()) {
            return;
        }

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

    closeOnHover(withGracePeriod = false) {
        if (!this.isHoverActive()) {
            return;
        }

        this.clearOpenTimer();
        this.clearCloseTimer();

        // Leave enough time to cross the gap between the trigger and popup.
        const delay = withGracePeriod ? Math.max(this.hoverCloseDelay, 100) : this.hoverCloseDelay;
        this.closeTimer = setTimeout(() => this.close('trigger-hover', new Event('popover.hover-close')), delay);
    }

    cancelHoverClose() {
        this.clearCloseTimer();
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
                    | [string, RdxPopoverRegisteredTrigger]
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

    private emitOpenChange(open: boolean, reason: RdxPopoverOpenChangeReason, event: Event) {
        this.onOpenChange.emit({
            open,
            triggerId: this.triggerId(),
            trigger: this.trigger(),
            reason,
            event
        });
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
}

function contextFor(root: RdxPopoverRoot): RdxPopoverRootContext {
    return {
        contentId: root.contentId,
        descriptionId: root.descriptionId.asReadonly(),
        isOpen: root.open,
        modal: root.modal,
        titleId: root.titleId.asReadonly(),
        trigger: root.trigger.asReadonly(),
        triggers: root.triggers.asReadonly(),
        payload: root.payload.asReadonly(),
        hasPopupClose: computed(() => root.popupCloseCount() > 0),
        isHoverActive: root.isHoverActive.asReadonly(),
        isPointerDownOnTrigger: root.isPointerDownOnTrigger.asReadonly(),
        close: (reason?: RdxPopoverOpenChangeReason, event?: Event) => root.close(reason, event),
        cancelHoverClose: () => root.cancelHoverClose(),
        closeOnHover: (withGracePeriod?: boolean) => root.closeOnHover(withGracePeriod),
        open: (trigger, payload, triggerId, reason, event) => root.show(trigger, payload, triggerId, reason, event),
        openOnHover: (trigger, payload, triggerId, event) => root.openOnHover(trigger, payload, triggerId, event),
        registerTrigger: (id, trigger, payload) => root.registerTrigger(id, trigger, payload),
        setDescriptionId: (id: string | undefined) => root.descriptionId.set(id),
        setTitleId: (id: string | undefined) => root.titleId.set(id),
        setPointerDownOnTrigger: (pointerDown: boolean) => root.isPointerDownOnTrigger.set(pointerDown),
        setHoverDelays: (delay: number, closeDelay: number) => root.setHoverDelays(delay, closeDelay),
        registerPopupClose: () => {
            root.popupCloseCount.update((count) => count + 1);
            return () => root.popupCloseCount.update((count) => count - 1);
        },
        registerViewport: (onTriggerChange) => root.registerViewport(onTriggerChange),
        toggle: (triggerId, trigger, payload, event) => root.toggle(triggerId, trigger, payload, event)
    };
}
