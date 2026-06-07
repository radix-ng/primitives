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
import {
    BooleanInput,
    createContext,
    injectId,
    RdxTransitionStatus,
    useTransitionStatus
} from '@radix-ng/primitives/core';
import { RdxDialogHandle } from './dialog-handle';
import { RDX_DIALOG_VARIANT, RdxDialogRole } from './dialog-variant';

export type RdxDialogModal = boolean | 'trap-focus';

export type RdxDialogOpenChangeReason =
    | 'trigger-press'
    | 'close-press'
    | 'outside-press'
    | 'focus-out'
    | 'escape-key'
    | 'swipe'
    | 'imperative-action'
    | 'none';

export interface RdxDialogOpenChange {
    open: boolean;
    triggerId: string | null;
    trigger: HTMLElement | undefined;
    reason: RdxDialogOpenChangeReason;
    event: Event;
}

interface RdxDialogRegisteredTrigger {
    element: HTMLElement;
    payload: () => unknown;
}

const transformModal = (value: BooleanInput | 'trap-focus'): RdxDialogModal =>
    value === 'trap-focus' ? value : booleanAttribute(value);

const context = () => contextFor(inject(RdxDialogRoot));

export interface RdxDialogRootContext {
    contentId: string;
    titleId: Signal<string | undefined>;
    descriptionId: Signal<string | undefined>;
    isOpen: Signal<boolean>;
    /** Effective modality (the variant can pin this to `true`). */
    modal: Signal<RdxDialogModal>;
    /** Effective outside-press / focus-out dismissal flag (the variant can force it on). */
    disablePointerDismissal: Signal<boolean>;
    /** ARIA role for the popup; constant, fixed by the variant at construction. */
    role: RdxDialogRole;
    transitionStatus: Signal<RdxTransitionStatus>;
    trigger: Signal<HTMLElement | undefined>;
    triggers: Signal<HTMLElement[]>;
    payload: Signal<unknown>;
    /** Whether this dialog is nested in another; constant, fixed at construction. */
    nested: boolean;
    nestedDialogOpen: Signal<boolean>;
    setTitleId: (id: string | undefined) => void;
    setDescriptionId: (id: string | undefined) => void;
    registerTransitionElement: (element: HTMLElement) => () => void;
    registerTrigger: (id: string, trigger: HTMLElement, payload: () => unknown) => () => void;
    open: (
        trigger?: HTMLElement,
        payload?: unknown,
        triggerId?: string,
        reason?: RdxDialogOpenChangeReason,
        event?: Event
    ) => void;
    close: (reason?: RdxDialogOpenChangeReason, event?: Event) => void;
    toggle: (triggerId: string, trigger: HTMLElement, payload?: unknown, event?: Event) => void;
}

export const [injectRdxDialogRootContext, provideRdxDialogRootContext] =
    createContext<RdxDialogRootContext>('RdxDialogRootContext');

/**
 * Groups all parts of the dialog.
 */
@Directive({
    selector: '[rdxDialogRoot]',
    exportAs: 'rdxDialogRoot',
    providers: [provideRdxDialogRootContext(context)]
})
export class RdxDialogRoot {
    private readonly destroyRef = inject(DestroyRef);
    private readonly parentRoot = inject(RdxDialogRoot, { optional: true, skipSelf: true });
    private readonly variant = inject(RDX_DIALOG_VARIANT);
    private hasAppliedDefaultOpen = false;
    private hasAppliedDefaultTriggerId = false;
    private readonly registeredTriggers = new Map<string, RdxDialogRegisteredTrigger>();

    private readonly transition = useTransitionStatus((open) => this.emitOpenChangeComplete(open));
    readonly transitionStatus = this.transition.status;
    readonly registerTransitionElement = this.transition.registerElement;

    /**
     * Whether the dialog is currently open.
     */
    readonly open = model(false);

    /**
     * Whether the dialog is initially open.
     */
    readonly defaultOpen = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * ID of the trigger associated with a controlled dialog.
     */
    readonly triggerId = model<string | null>(null);

    /**
     * ID of the trigger associated with an initially open uncontrolled dialog.
     */
    readonly defaultTriggerId = input<string | null>(null);

    /**
     * Determines if the dialog enters a modal state when open.
     * - `true`: focus is trapped, page scroll is locked, outside pointer events are disabled.
     * - `false`: interaction with the rest of the document is allowed.
     * - `'trap-focus'`: focus is trapped, but scroll is not locked and outside pointer events remain enabled.
     */
    readonly modal = input<RdxDialogModal, BooleanInput | 'trap-focus'>(true, { transform: transformModal });

    /**
     * Determines whether the dialog should close on outside clicks.
     */
    readonly disablePointerDismissal = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Associates this root with detached trigger elements rendered outside of it.
     */
    readonly handle = input<RdxDialogHandle<any>>();

    /**
     * Event handler called when the dialog is opened or closed.
     */
    readonly onOpenChange = output<RdxDialogOpenChange>();

    /**
     * Event handler called after any animations complete when the dialog is opened or closed.
     */
    readonly onOpenChangeComplete = output<boolean>();

    readonly contentId = injectId('rdx-dialog-content-');
    readonly titleId = signal<string | undefined>(undefined);
    readonly descriptionId = signal<string | undefined>(undefined);
    readonly trigger = signal<HTMLElement | undefined>(undefined);
    readonly triggers = signal<HTMLElement[]>([]);
    readonly payload = signal<unknown>(undefined);
    readonly nestedOpenCount = signal(0);

    /** Whether this dialog is rendered inside another dialog. Fixed at construction. */
    readonly nested = !!this.parentRoot;
    readonly nestedDialogOpen = computed(() => this.nestedOpenCount() > 0);

    /** ARIA role, fixed at construction by the dialog variant (`alertdialog` for alert dialogs). */
    readonly role = this.variant.role;

    /** Effective modality: the variant can pin it to `true` regardless of the `modal` input. */
    readonly effectiveModal = computed<RdxDialogModal>(() => (this.variant.forceModal ? true : this.modal()));
    /** Effective dismissal flag: disabled when the input asks, or when the variant forces it (alerts). */
    readonly effectiveDisablePointerDismissal = computed(
        () => this.disablePointerDismissal() || this.variant.forcePointerDismissalDisabled
    );

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

        // Report nested open state to the parent dialog so it can apply data-nested-dialog-open.
        effect((onCleanup) => {
            const open = this.open();

            if (open && this.parentRoot) {
                onCleanup(untracked(() => this.parentRoot!.openNestedChild()));
            }
        });

        effect((onCleanup) => {
            const handle = this.handle();

            if (handle) {
                onCleanup(untracked(() => handle.registerRoot(contextFor(this))));
            }
        });
    }

    show(
        trigger = this.trigger(),
        payload?: unknown,
        triggerId?: string,
        reason: RdxDialogOpenChangeReason = 'none',
        event = new Event('dialog.open-change')
    ) {
        if (trigger) {
            this.trigger.set(trigger);
        }

        if (triggerId !== undefined) {
            this.triggerId.set(triggerId);
        }

        // Only adopt the payload when a trigger context is actually provided, so a bare
        // imperative re-show on an already-open dialog doesn't clobber the live payload.
        if (trigger !== undefined || payload !== undefined) {
            this.payload.set(payload);
        }

        if (this.open()) {
            return;
        }

        this.open.set(true);
        this.emitOpenChange(true, reason, event);
    }

    close(reason: RdxDialogOpenChangeReason = 'none', event = new Event('dialog.open-change')) {
        if (!this.open()) {
            return;
        }

        this.open.set(false);
        this.emitOpenChange(false, reason, event);
    }

    toggle(triggerId: string, trigger: HTMLElement, payload?: unknown, event = new Event('dialog.open-change')) {
        if (this.open() && this.trigger() === trigger) {
            this.close('trigger-press', event);
            return;
        }

        this.show(trigger, payload, triggerId, 'trigger-press', event);
    }

    registerTrigger(id: string, trigger: HTMLElement, payload: () => unknown) {
        this.registeredTriggers.set(id, { element: trigger, payload });
        this.triggers.update((triggers) => (triggers.includes(trigger) ? triggers : [...triggers, trigger]));

        if (this.triggerId() === id || (!this.trigger() && this.triggerId() === null)) {
            this.trigger.set(trigger);
            this.payload.set(payload());
        }

        return () => {
            if (this.registeredTriggers.get(id)?.element === trigger) {
                this.registeredTriggers.delete(id);
            }

            this.triggers.update((triggers) => triggers.filter((candidate) => candidate !== trigger));

            if (!this.destroyRef.destroyed && this.trigger() === trigger) {
                const next = this.registeredTriggers.entries().next().value as
                    | [string, RdxDialogRegisteredTrigger]
                    | undefined;

                if (this.triggerId() !== null) {
                    this.triggerId.set(next?.[0] ?? null);
                }

                this.trigger.set(next?.[1].element);
                this.payload.set(next?.[1].payload());

                // Intentionally do NOT close when the last trigger unregisters (unlike popover):
                // a controlled / imperatively-opened dialog must survive its trigger unmounting.
            }
        };
    }

    /** Increments the nested-open counter and returns a release callback that decrements it. */
    openNestedChild() {
        this.nestedOpenCount.update((count) => count + 1);
        return () => this.nestedOpenCount.update((count) => count - 1);
    }

    private syncTriggerId(triggerId: string | null) {
        if (triggerId === null) {
            // Controlled triggerId cleared: drop the active trigger so stale state doesn't linger.
            this.trigger.set(undefined);
            this.payload.set(undefined);
            return;
        }

        const trigger = this.registeredTriggers.get(triggerId);

        if (trigger && trigger.element !== this.trigger()) {
            this.trigger.set(trigger.element);
            this.payload.set(trigger.payload());
        }
    }

    private emitOpenChange(open: boolean, reason: RdxDialogOpenChangeReason, event: Event) {
        this.onOpenChange.emit({
            open,
            triggerId: this.triggerId(),
            trigger: this.trigger(),
            reason,
            event
        });
    }

    private emitOpenChangeComplete(open: boolean) {
        if (!this.destroyRef.destroyed) {
            this.onOpenChangeComplete.emit(open);
        }
    }
}

function contextFor(root: RdxDialogRoot): RdxDialogRootContext {
    return {
        contentId: root.contentId,
        titleId: root.titleId.asReadonly(),
        descriptionId: root.descriptionId.asReadonly(),
        isOpen: root.open,
        modal: root.effectiveModal,
        disablePointerDismissal: root.effectiveDisablePointerDismissal,
        role: root.role,
        transitionStatus: root.transitionStatus,
        trigger: root.trigger.asReadonly(),
        triggers: root.triggers.asReadonly(),
        payload: root.payload.asReadonly(),
        nested: root.nested,
        nestedDialogOpen: root.nestedDialogOpen,
        setTitleId: (id: string | undefined) => root.titleId.set(id),
        setDescriptionId: (id: string | undefined) => root.descriptionId.set(id),
        registerTransitionElement: (element) => root.registerTransitionElement(element),
        registerTrigger: (id, trigger, payload) => root.registerTrigger(id, trigger, payload),
        open: (trigger, payload, triggerId, reason, event) => root.show(trigger, payload, triggerId, reason, event),
        close: (reason, event) => root.close(reason, event),
        toggle: (triggerId, trigger, payload, event) => root.toggle(triggerId, trigger, payload, event)
    };
}
