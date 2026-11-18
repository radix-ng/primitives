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
    output,
    Signal,
    signal,
    untracked
} from '@angular/core';
import type { RdxRenderLifecycle } from '@radix-ng/primitives/core';
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
    useRenderLifecycle,
    watch
} from '@radix-ng/primitives/core';
import { getInteractionTypeFromEvent, RdxInteractionType } from '@radix-ng/primitives/floating-focus-manager';
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
    | 'close-watcher'
    | 'none';

export type RdxDialogOpenChangeEventDetails = RdxCancelableChangeEventDetails<RdxDialogOpenChangeReason>;

export interface RdxDialogOpenChange {
    open: boolean;
    triggerId: string | null;
    trigger: HTMLElement | undefined;
    reason: RdxDialogOpenChangeReason;
    event: Event;
    eventDetails: RdxDialogOpenChangeEventDetails;
}

interface RdxDialogRegisteredTrigger {
    element: HTMLElement;
    payload: () => unknown;
}

interface RdxDialogTriggerSelection {
    id: string | null;
    fallback?: { element: HTMLElement | undefined; payload: unknown };
}

const transformModal = (value: BooleanInput | 'trap-focus'): RdxDialogModal =>
    value === 'trap-focus' ? value : booleanAttribute(value);

function transformOpen(value: BooleanInput): boolean | undefined {
    return value === undefined ? undefined : booleanAttribute(value);
}

const context = () => contextFor(inject(RdxDialogRoot));

export interface RdxDialogRootContext {
    contentId: string;
    titleId: Signal<string | undefined>;
    descriptionId: Signal<string | undefined>;
    isOpen: Signal<boolean>;
    present: Signal<boolean>;
    renderLifecycle: RdxRenderLifecycle;
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
    openInteractionType: Signal<RdxInteractionType>;
    closeInteractionType: Signal<RdxInteractionType>;
    /** Whether this dialog is nested in another; constant, fixed at construction. */
    nested: boolean;
    nestedDialogOpen: Signal<boolean>;
    /** Number of currently-open dialogs nested directly inside this one (Base UI `--nested-dialogs`). */
    nestedOpenCount: Signal<number>;
    setTitleId: (id: string | undefined) => void;
    setDescriptionId: (id: string | undefined) => void;
    registerTransitionElement: (element: HTMLElement) => () => void;
    registerTrigger: (id: string, trigger: HTMLElement, payload: () => unknown) => () => void;
    setTriggerOpenInteractionType: (type: RdxInteractionType) => void;
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

export const [injectRdxDialogRootContext, provideRdxDialogRootContext] = createContext<RdxDialogRootContext>(
    'RdxDialogRootContext',
    'components/dialog'
);

/**
 * Groups all parts of the dialog.
 */
@Directive({
    selector: '[rdxDialogRoot]',
    exportAs: 'rdxDialogRoot',
    providers: [
        provideRdxDialogRootContext(context),
        // New floating foundation (ADR 0015/0017 migration). Inherit-or-create tree so a nested dialog
        // shares its parent's tree; the per-popup root context bridges open / triggers / reference.
        provideFloatingTree(),
        provideFloatingRootContext(() => inject(RdxDialogRoot).floatingContext)
    ]
})
export class RdxDialogRoot {
    private readonly destroyRef = inject(DestroyRef);
    private readonly parentRoot = inject(RdxDialogRoot, { optional: true, skipSelf: true });
    private readonly variant = inject(RDX_DIALOG_VARIANT);
    private readonly registeredTriggers = signal<ReadonlyMap<string, RdxDialogRegisteredTrigger>>(new Map());
    private readonly localTrigger = signal<RdxDialogTriggerSelection>({ id: null });
    private readonly uncontrolledOpen = signal(false);
    // Keep the latest request's metadata until the controlled input commits it.
    private pendingOpenChange: { open: boolean; commit: () => void } | undefined;

    private readonly transition = useRenderLifecycle((open) => this.emitOpenChangeComplete(open), {
        open: () => this.open()
    });
    readonly transitionStatus = this.transition.status;
    /** @internal Shared render owner for structural Portal/Presence. */
    readonly renderLifecycle = this.transition;
    readonly registerTransitionElement = this.transition.registerElement;

    /**
     * Controlled open state. Leave undefined to let the dialog own its state.
     */
    readonly openInput = input<boolean | undefined, BooleanInput>(undefined, {
        alias: 'open',
        transform: transformOpen
    });

    /** Whether the dialog is currently open. */
    readonly open = computed(() => this.openInput() ?? this.uncontrolledOpen());

    /** Accepted open requests. Supports two-way binding to the controlled input. */
    readonly openChange = output<boolean>();

    /**
     * Whether the dialog is initially open.
     */
    readonly defaultOpen = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * ID of the trigger associated with a controlled dialog.
     * Null or undefined falls back to the internally selected trigger.
     */
    readonly triggerIdInput = input<string | null>(undefined, { alias: 'triggerId' });

    private readonly implicitTriggerId = computed(() => {
        if (!this.open() || this.localTrigger().fallback) return null;
        const registered = this.registeredTriggers();
        return registered.size === 1 ? (registered.keys().next().value ?? null) : null;
    });

    /** The active trigger ID after resolving the input and internal selection. */
    readonly triggerId = computed(() => this.triggerIdInput() ?? this.localTrigger().id ?? this.implicitTriggerId());

    /** Accepted trigger requests. Supports `[(triggerId)]`. */
    readonly triggerIdChange = output<string | null>();

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
     * Determines whether the dialog should close on outside clicks. For a non-modal dialog this also
     * prevents the dialog from closing when focus moves outside of it.
     */
    readonly disablePointerDismissal = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Associates this root with detached trigger elements rendered outside of it.
     */
    readonly handle = input<RdxDialogHandle<unknown>>();

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
    private readonly activeTrigger = computed(() => {
        const id = this.triggerId();
        const registered = id === null ? undefined : this.registeredTriggers().get(id);
        if (registered) return { element: registered.element, payload: registered.payload() };
        const local = this.localTrigger();
        return id === local.id ? local.fallback : undefined;
    });
    readonly trigger = computed(() => this.activeTrigger()?.element);
    readonly triggers = computed(() => [
        ...new Set([...this.registeredTriggers().values()].map(({ element }) => element))
    ]);
    readonly payload = computed(() => this.activeTrigger()?.payload);
    readonly nestedOpenCount = signal(0);
    readonly openInteractionType = signal<RdxInteractionType>(null);
    readonly closeInteractionType = signal<RdxInteractionType>(null);
    private readonly preventUnmountOnClose = signal(false);
    private readonly pendingTriggerOpenInteractionType = signal<RdxInteractionType>(null);

    readonly present = computed(() => this.open() || this.preventUnmountOnClose());

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

    /**
     * The shared per-popup floating context (ADR 0015 §1) — `open` mirrors the dialog's open state, the
     * trigger registry is bridged from {@link registerTrigger}, and the reference / floating elements are
     * set by the trigger / popup. The new dismissal + focus engines read this once the popup migrates.
     */
    readonly floatingContext: RdxFloatingRootContext = createFloatingRootContext({
        ownerDocument: inject(ElementRef).nativeElement.ownerDocument,
        open: () => this.open()
    });

    constructor() {
        // Keep the floating context's reference element in sync with the active trigger.
        effect(() => this.floatingContext.setReferenceElement(this.trigger() ?? null));

        effect(() => {
            if (this.open() && this.preventUnmountOnClose()) {
                this.preventUnmountOnClose.set(false);
            }
        });

        watch([], () => {
            this.localTrigger.set({ id: this.defaultTriggerId() });
            this.uncontrolledOpen.set(this.defaultOpen());
        });

        afterRenderEffect({
            read: () => {
                if (this.triggerIdInput() != null || this.localTrigger().id !== null) return;
                // Child views may register separately during a render. Latch only a settled lone trigger.
                const id = this.implicitTriggerId();
                if (id !== null) this.localTrigger.set({ id });
            }
        });

        let previousOpen = this.open();
        watch([this.open, this.openInput], ([open, supplied]) => {
            if (supplied === undefined) this.pendingOpenChange = undefined;
            if (open === previousOpen) return;

            previousOpen = open;
            const pending = this.pendingOpenChange;
            this.pendingOpenChange = undefined;
            if (pending?.open === open) {
                pending.commit();
            }
            this.transition.start(open);
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
        event?: Event
    ) {
        const selection = this.requestedTriggerSelection(trigger, payload, triggerId);
        const interactionType = this.consumeOpenInteractionType(event);

        if (this.open()) {
            if (selection) {
                const previousId = this.triggerId();
                this.localTrigger.set(selection);
                if (selection.id !== previousId) this.triggerIdChange.emit(selection.id);
            }
            return;
        }

        const resolvedEvent = event ?? new Event('dialog.open-change');
        const change = this.createOpenChangeEvent(
            true,
            reason,
            resolvedEvent,
            trigger,
            selection ? selection.id : this.triggerId()
        );
        this.onOpenChange.emit(change.payload);

        if (change.eventDetails.isCanceled()) {
            return;
        }

        this.acceptOpenRequest(
            true,
            () => {
                this.openInteractionType.set(interactionType);
                if (selection) this.localTrigger.set(selection);
                this.preventUnmountOnClose.set(false);
                this.floatingContext.events.emit('openchange', { open: true, reason, event: resolvedEvent });
            },
            selection?.id
        );
    }

    close(reason: RdxDialogOpenChangeReason = 'none', event?: Event) {
        this.pendingTriggerOpenInteractionType.set(null);
        if (!this.open()) {
            return;
        }

        const resolvedEvent = event ?? new Event('dialog.open-change');
        const change = this.createOpenChangeEvent(false, reason, resolvedEvent, this.trigger(), this.triggerId());
        this.onOpenChange.emit(change.payload);

        if (change.eventDetails.isCanceled()) {
            return;
        }

        const interactionType = getInteractionTypeFromEvent(event);
        this.acceptOpenRequest(false, () => {
            this.closeInteractionType.set(interactionType);
            this.preventUnmountOnClose.set(change.shouldPreventUnmountOnClose());
            this.floatingContext.events.emit('openchange', { open: false, reason, event: resolvedEvent });
        });
    }

    private acceptOpenRequest(open: boolean, commit: () => void, requestedTriggerId?: string | null) {
        const changesTrigger = requestedTriggerId !== undefined && requestedTriggerId !== this.triggerId();
        if (this.openInput() === undefined) {
            this.pendingOpenChange = undefined;
            this.uncontrolledOpen.set(open);
            commit();
        } else {
            this.pendingOpenChange = { open, commit };
        }
        if (changesTrigger) this.triggerIdChange.emit(requestedTriggerId);
        this.openChange.emit(open);
    }

    toggle(triggerId: string, trigger: HTMLElement, payload?: unknown, event = new Event('dialog.open-change')) {
        if (this.open() && this.trigger() === trigger) {
            this.close('trigger-press', event);
            return;
        }

        this.show(trigger, payload, triggerId, 'trigger-press', event);
    }

    setTriggerOpenInteractionType(type: RdxInteractionType): void {
        this.pendingTriggerOpenInteractionType.set(type);
    }

    registerTrigger(id: string, trigger: HTMLElement, payload: () => unknown) {
        const registration = { element: trigger, payload };
        this.registeredTriggers.update((triggers) => new Map(triggers).set(id, registration));
        // Bridge into the floating context's trigger registry — the new dismissal/focus engines read it
        // for inside-element checks (a press/focus on the trigger counts as inside, ADR 0015 §2).
        this.floatingContext.triggers.add(trigger);

        return () => {
            this.registeredTriggers.update((triggers) => {
                if (triggers.get(id) !== registration) return triggers;
                const remaining = new Map(triggers);
                remaining.delete(id);
                return remaining;
            });
            this.floatingContext.triggers.delete(trigger);
        };
    }

    /** Increments the nested-open counter and returns a release callback that decrements it. */
    openNestedChild() {
        this.nestedOpenCount.update((count) => count + 1);
        return () => this.nestedOpenCount.update((count) => count - 1);
    }

    private requestedTriggerSelection(
        trigger: HTMLElement | undefined,
        payload: unknown,
        triggerId: string | undefined
    ): RdxDialogTriggerSelection | undefined {
        if (triggerId === undefined && trigger === undefined && payload === undefined) return undefined;
        const id = triggerId ?? (trigger?.id || null);
        const registered = id === null ? undefined : this.registeredTriggers().get(id);
        // Read live payloads from registered triggers and keep only explicit external context here.
        if (registered && (!trigger || registered.element === trigger)) return { id };
        return { id, fallback: { element: trigger, payload } };
    }

    private createOpenChangeEvent(
        open: boolean,
        reason: RdxDialogOpenChangeReason,
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
            } satisfies RdxDialogOpenChange
        };
    }

    private emitOpenChangeComplete(open: boolean) {
        if (!this.destroyRef.destroyed) {
            this.onOpenChangeComplete.emit(open);
        }
    }

    private consumeOpenInteractionType(event?: Event): RdxInteractionType {
        const pending = this.pendingTriggerOpenInteractionType();
        this.pendingTriggerOpenInteractionType.set(null);
        return pending ?? getInteractionTypeFromEvent(event);
    }
}

function contextFor(root: RdxDialogRoot): RdxDialogRootContext {
    return {
        contentId: root.contentId,
        titleId: root.titleId.asReadonly(),
        descriptionId: root.descriptionId.asReadonly(),
        isOpen: root.open,
        present: root.present,
        renderLifecycle: root.renderLifecycle,
        modal: root.effectiveModal,
        disablePointerDismissal: root.effectiveDisablePointerDismissal,
        role: root.role,
        transitionStatus: root.transitionStatus,
        trigger: root.trigger,
        triggers: root.triggers,
        payload: root.payload,
        openInteractionType: root.openInteractionType.asReadonly(),
        closeInteractionType: root.closeInteractionType.asReadonly(),
        nested: root.nested,
        nestedDialogOpen: root.nestedDialogOpen,
        nestedOpenCount: root.nestedOpenCount.asReadonly(),
        setTitleId: (id: string | undefined) => root.titleId.set(id),
        setDescriptionId: (id: string | undefined) => root.descriptionId.set(id),
        registerTransitionElement: (element) => root.registerTransitionElement(element),
        registerTrigger: (id, trigger, payload) => root.registerTrigger(id, trigger, payload),
        setTriggerOpenInteractionType: (type) => root.setTriggerOpenInteractionType(type),
        open: (trigger, payload, triggerId, reason, event) => root.show(trigger, payload, triggerId, reason, event),
        close: (reason, event) => root.close(reason, event),
        toggle: (triggerId, trigger, payload, event) => root.toggle(triggerId, trigger, payload, event)
    };
}
