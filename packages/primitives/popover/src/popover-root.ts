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
    Signal,
    signal,
    untracked
} from '@angular/core';
import { createContext } from '@radix-ng/primitives/core';
import { RdxPopper } from '@radix-ng/primitives/popper';
import { RdxPopoverHandle } from './popover-handle';

export type RdxPopoverModal = boolean | 'trap-focus';

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
    close: () => void;
    cancelHoverClose: () => void;
    closeOnHover: (withGracePeriod?: boolean) => void;
    payload: Signal<unknown>;
    open: (trigger?: HTMLElement, payload?: unknown) => void;
    openOnHover: (trigger: HTMLElement, payload?: unknown) => void;
    registerTrigger: (trigger: HTMLElement) => () => void;
    setDescriptionId: (id: string | undefined) => void;
    setTitleId: (id: string | undefined) => void;
    setPointerDownOnTrigger: (pointerDown: boolean) => void;
    setHoverDelays: (delay: number, closeDelay: number) => void;
    registerPopupClose: () => () => void;
    registerViewport: (onTriggerChange: (previous: HTMLElement, next: HTMLElement) => void) => () => void;
    toggle: (trigger: HTMLElement, payload?: unknown) => void;
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
    private readonly viewportTriggerChange = new Set<(previous: HTMLElement, next: HTMLElement) => void>();

    readonly state = computed(() => (this.open() ? 'open' : 'closed'));

    constructor() {
        effect(() => {
            const defaultOpen = this.defaultOpen();

            if (!this.hasAppliedDefaultOpen) {
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

        effect(() => this.popper.anchorOverride.set(this.trigger()));

        this.destroyRef.onDestroy(() => this.clearHoverTimers());
    }

    show(trigger = this.trigger(), payload?: unknown, fromHover = false) {
        this.clearHoverTimers();
        this.isHoverActive.set(fromHover);

        if (trigger) {
            const previousTrigger = this.trigger();

            if (previousTrigger && previousTrigger !== trigger) {
                this.viewportTriggerChange.forEach((notify) => notify(previousTrigger, trigger));
            }

            this.trigger.set(trigger);
        }

        this.payload.set(payload);
        this.open.set(true);
    }

    close() {
        this.clearHoverTimers();
        this.isHoverActive.set(false);
        this.open.set(false);
    }

    toggle(trigger: HTMLElement, payload?: unknown) {
        this.clearHoverTimers();

        if (this.open() && this.trigger() === trigger) {
            this.close();
            return;
        }

        this.show(trigger, payload);
    }

    openOnHover(trigger: HTMLElement, payload?: unknown) {
        this.clearHoverTimers();
        this.isHoverActive.set(true);

        if (this.open()) {
            this.show(trigger, payload, true);
            return;
        }

        this.openTimer = setTimeout(() => this.show(trigger, payload, true), this.hoverDelay);
    }

    closeOnHover(withGracePeriod = false) {
        if (!this.isHoverActive()) {
            return;
        }

        this.clearOpenTimer();
        this.clearCloseTimer();

        // Leave enough time to cross the gap between the trigger and popup.
        const delay = withGracePeriod ? Math.max(this.hoverCloseDelay, 100) : this.hoverCloseDelay;
        this.closeTimer = setTimeout(() => this.close(), delay);
    }

    cancelHoverClose() {
        this.clearCloseTimer();
    }

    setHoverDelays(delay: number, closeDelay: number) {
        this.hoverDelay = delay;
        this.hoverCloseDelay = closeDelay;
    }

    registerTrigger(trigger: HTMLElement) {
        this.triggers.update((triggers) => (triggers.includes(trigger) ? triggers : [...triggers, trigger]));

        if (!this.trigger()) {
            this.trigger.set(trigger);
        }

        return () => {
            this.triggers.update((triggers) => triggers.filter((candidate) => candidate !== trigger));

            if (this.trigger() === trigger) {
                const nextTrigger = this.triggers()[0];

                this.trigger.set(nextTrigger);

                if (!nextTrigger && !this.destroyRef.destroyed) {
                    this.close();
                }
            }
        };
    }

    registerViewport(onTriggerChange: (previous: HTMLElement, next: HTMLElement) => void) {
        this.viewportTriggerChange.add(onTriggerChange);
        return () => this.viewportTriggerChange.delete(onTriggerChange);
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
        close: () => root.close(),
        cancelHoverClose: () => root.cancelHoverClose(),
        closeOnHover: (withGracePeriod?: boolean) => root.closeOnHover(withGracePeriod),
        open: (trigger?: HTMLElement, payload?: unknown) => root.show(trigger, payload),
        openOnHover: (trigger: HTMLElement, payload?: unknown) => root.openOnHover(trigger, payload),
        registerTrigger: (trigger: HTMLElement) => root.registerTrigger(trigger),
        setDescriptionId: (id: string | undefined) => root.descriptionId.set(id),
        setTitleId: (id: string | undefined) => root.titleId.set(id),
        setPointerDownOnTrigger: (pointerDown: boolean) => root.isPointerDownOnTrigger.set(pointerDown),
        setHoverDelays: (delay: number, closeDelay: number) => root.setHoverDelays(delay, closeDelay),
        registerPopupClose: () => {
            root.popupCloseCount.update((count) => count + 1);
            return () => root.popupCloseCount.update((count) => count - 1);
        },
        registerViewport: (onTriggerChange) => root.registerViewport(onTriggerChange),
        toggle: (trigger: HTMLElement, payload?: unknown) => root.toggle(trigger, payload)
    };
}
