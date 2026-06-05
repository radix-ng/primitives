import { _IdGenerator } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
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
import { createContext, RdxTransitionStatus, useTransitionStatus } from '@radix-ng/primitives/core';

export type RdxDialogModal = boolean | 'trap-focus';

export type RdxDialogOpenChangeReason =
    | 'trigger-press'
    | 'close-press'
    | 'outside-press'
    | 'focus-out'
    | 'escape-key'
    | 'imperative-action'
    | 'none';

export interface RdxDialogOpenChange {
    open: boolean;
    reason: RdxDialogOpenChangeReason;
    event: Event;
}

const transformModal = (value: BooleanInput | 'trap-focus'): RdxDialogModal =>
    value === 'trap-focus' ? value : booleanAttribute(value);

const context = () => contextFor(inject(RdxDialogRoot));

export interface RdxDialogRootContext {
    contentId: string;
    titleId: Signal<string | undefined>;
    descriptionId: Signal<string | undefined>;
    isOpen: Signal<boolean>;
    modal: Signal<RdxDialogModal>;
    disablePointerDismissal: Signal<boolean>;
    transitionStatus: Signal<RdxTransitionStatus>;
    triggerElement: Signal<HTMLElement | undefined>;
    setTitleId: (id: string | undefined) => void;
    setDescriptionId: (id: string | undefined) => void;
    setTriggerElement: (element: HTMLElement | undefined) => void;
    registerTransitionElement: (element: HTMLElement) => () => void;
    close: (reason?: RdxDialogOpenChangeReason, event?: Event) => void;
    toggle: (event?: Event) => void;
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
    private readonly idGenerator = inject(_IdGenerator);
    private hasAppliedDefaultOpen = false;

    private readonly transition = useTransitionStatus((open) => this.onOpenChangeComplete.emit(open));
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
     * Event handler called when the dialog is opened or closed.
     */
    readonly onOpenChange = output<RdxDialogOpenChange>();

    /**
     * Event handler called after any animations complete when the dialog is opened or closed.
     */
    readonly onOpenChangeComplete = output<boolean>();

    readonly contentId = this.idGenerator.getId('rdx-dialog-content-');
    readonly titleId = signal<string | undefined>(undefined);
    readonly descriptionId = signal<string | undefined>(undefined);
    readonly triggerElement = signal<HTMLElement | undefined>(undefined);

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
            const open = this.open();

            if (open !== previousOpen) {
                previousOpen = open;
                untracked(() => this.transition.start(open));
            }
        });
    }

    show(reason: RdxDialogOpenChangeReason = 'none', event = new Event('dialog.open-change')) {
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

    toggle(event = new Event('dialog.open-change')) {
        if (this.open()) {
            this.close('trigger-press', event);
        } else {
            this.show('trigger-press', event);
        }
    }

    private emitOpenChange(open: boolean, reason: RdxDialogOpenChangeReason, event: Event) {
        this.onOpenChange.emit({ open, reason, event });
    }
}

function contextFor(root: RdxDialogRoot): RdxDialogRootContext {
    return {
        contentId: root.contentId,
        titleId: root.titleId.asReadonly(),
        descriptionId: root.descriptionId.asReadonly(),
        isOpen: root.open,
        modal: root.modal,
        disablePointerDismissal: root.disablePointerDismissal,
        transitionStatus: root.transitionStatus,
        triggerElement: root.triggerElement.asReadonly(),
        setTitleId: (id: string | undefined) => root.titleId.set(id),
        setDescriptionId: (id: string | undefined) => root.descriptionId.set(id),
        setTriggerElement: (element: HTMLElement | undefined) => root.triggerElement.set(element),
        registerTransitionElement: (element) => root.registerTransitionElement(element),
        close: (reason, event) => root.close(reason, event),
        toggle: (event) => root.toggle(event)
    };
}
