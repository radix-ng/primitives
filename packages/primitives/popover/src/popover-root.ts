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
    isPointerDownOnTrigger: Signal<boolean>;
    close: () => void;
    payload: Signal<unknown>;
    open: (trigger?: HTMLElement, payload?: unknown) => void;
    registerTrigger: (trigger: HTMLElement) => () => void;
    setDescriptionId: (id: string | undefined) => void;
    setTitleId: (id: string | undefined) => void;
    setPointerDownOnTrigger: (pointerDown: boolean) => void;
    registerPopupClose: () => () => void;
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
    }

    show(trigger = this.trigger(), payload?: unknown) {
        if (trigger) {
            this.trigger.set(trigger);
        }

        this.payload.set(payload);
        this.open.set(true);
    }

    close() {
        this.open.set(false);
    }

    toggle(trigger: HTMLElement, payload?: unknown) {
        if (this.open() && this.trigger() === trigger) {
            this.close();
            return;
        }

        this.show(trigger, payload);
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
        isPointerDownOnTrigger: root.isPointerDownOnTrigger.asReadonly(),
        close: () => root.close(),
        open: (trigger?: HTMLElement, payload?: unknown) => root.show(trigger, payload),
        registerTrigger: (trigger: HTMLElement) => root.registerTrigger(trigger),
        setDescriptionId: (id: string | undefined) => root.descriptionId.set(id),
        setTitleId: (id: string | undefined) => root.titleId.set(id),
        setPointerDownOnTrigger: (pointerDown: boolean) => root.isPointerDownOnTrigger.set(pointerDown),
        registerPopupClose: () => {
            root.popupCloseCount.update((count) => count + 1);
            return () => root.popupCloseCount.update((count) => count - 1);
        },
        toggle: (trigger: HTMLElement, payload?: unknown) => root.toggle(trigger, payload)
    };
}
