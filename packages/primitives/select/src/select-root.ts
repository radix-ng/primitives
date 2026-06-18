import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    model,
    output,
    Signal,
    signal,
    untracked
} from '@angular/core';
import {
    AcceptableValue,
    createCancelableChangeEventDetails,
    createContext,
    createFloatingRootContext,
    Direction,
    injectId,
    isNullish,
    ItemValueComparator,
    provideFloatingRootContext,
    provideFloatingTree,
    RdxCancelableChangeEventDetails,
    RdxFloatingRootContext,
    useTransitionStatus
} from '@radix-ng/primitives/core';
import { injectDirection } from '@radix-ng/primitives/direction-provider';
import { getInteractionTypeFromEvent, RdxInteractionType } from '@radix-ng/primitives/floating-focus-manager';
import { RdxPopper } from '@radix-ng/primitives/popper';
import { compare, valueComparator } from './utils';

export interface SelectOption {
    value: any;
    disabled?: boolean;
    textContent: string;
}

export type RdxSelectOpenMethod = RdxInteractionType;

export type RdxSelectOpenChangeReason =
    | 'trigger-press'
    | 'item-press'
    | 'outside-press'
    | 'escape-key'
    | 'window-resize'
    | 'focus-out'
    | 'list-navigation'
    | 'cancel-open'
    | 'none';

export type RdxSelectValueChangeReason = RdxSelectOpenChangeReason;

export type RdxSelectOpenChangeEventDetails = RdxCancelableChangeEventDetails<RdxSelectOpenChangeReason>;

export interface RdxSelectOpenChangeEvent {
    open: boolean;
    eventDetails: RdxSelectOpenChangeEventDetails;
}

export type RdxSelectValueChangeEventDetails = RdxCancelableChangeEventDetails<RdxSelectValueChangeReason>;

export interface RdxSelectValueChangeEvent {
    value: AcceptableValue | AcceptableValue[];
    eventDetails: RdxSelectValueChangeEventDetails;
}

const context = () => {
    const context = inject(RdxSelectRoot);

    return {
        triggerElement: context.triggerElement,
        valueElement: context.valueElement,
        triggerPointerDownPosRef: context.triggerPointerDownPosRef,
        contentId: context.contentId,
        dir: context.dir,
        value: context.value,
        multiple: context.multiple,
        isItemEqualToValue: context.isItemEqualToValue,
        itemToStringLabel: context.itemToStringLabel,
        open: context.open,
        openedByTouch: context.openedByTouch,
        openMethod: context.openMethod,
        openInteractionType: context.openInteractionType,
        closeInteractionType: context.closeInteractionType,
        disabled: context.disabled,
        modal: context.modal,
        isEmptyModelValue: context.isEmptyModelValue,
        transitionStatus: context.transitionStatus,
        registerTransitionElement: context.registerTransitionElement,
        optionsSet: context.optionsSet,
        onOptionAdd: (option: any) => {
            const existingOption = context.getOption(option());
            if (existingOption) {
                context.optionsSet().delete(existingOption);
            }

            context.optionsSet().add(option());
        },
        onOptionRemove: (option: any) => {
            const existingOption = context.getOption(option());
            if (existingOption) {
                context.optionsSet().delete(existingOption);
            }
        },
        onValueChange: (value: AcceptableValue, reason?: RdxSelectValueChangeReason, event?: Event) =>
            context.setValue(value, reason, event),
        onTriggerChange: (node: any) => {
            context.triggerElement.set(node.nativeElement);
        },
        onValueElementChange: (node: any) => {
            context.valueElement.set(node);
        },
        onOpenChange: (value: boolean, reason?: RdxSelectOpenChangeReason, event?: Event) =>
            context.setOpen(value, reason, event)
    };
};

export type RdxSelectRootContext = ReturnType<typeof context>;

export const [injectSelectRootContext, provideSelectRootContext] = createContext<RdxSelectRootContext>(
    'RdxSelectRootContext',
    'components/select'
);

@Directive({
    selector: '[rdxSelectRoot]',
    exportAs: 'rdxSelectRoot',
    providers: [
        provideSelectRootContext(context),
        // New floating foundation (ADR 0015/0017) — the dismissal capability reads this shared context.
        provideFloatingTree(),
        provideFloatingRootContext(() => inject(RdxSelectRoot).floatingContext)
    ],
    hostDirectives: [RdxPopper]
})
export class RdxSelectRoot {
    readonly contentId = injectId('rdx-select-content-');

    readonly open = model<boolean>(false);

    /** Whether the current open was initiated by **touch** (ADR 0016 §3 — gates the anchored scroll lock). */
    readonly openedByTouch = signal(false);
    /** How the select was opened. Base UI names this state `openMethod`. */
    readonly openInteractionType = signal<RdxInteractionType>(null);
    /** How the select was closed. */
    readonly closeInteractionType = signal<RdxInteractionType>(null);
    /** Public Base UI-aligned alias for the open interaction type. */
    readonly openMethod: Signal<RdxSelectOpenMethod> = computed(() => this.openInteractionType());

    /** Per-popup floating root context (ADR 0015) — `open` / `triggers` / reference for the dismissal engine. */
    readonly floatingContext: RdxFloatingRootContext = createFloatingRootContext({
        ownerDocument: inject(ElementRef).nativeElement.ownerDocument,
        open: () => this.open()
    });

    readonly value = model<AcceptableValue | AcceptableValue[]>();

    readonly multiple = input(false, { transform: booleanAttribute });

    readonly disabled = input(false, { transform: booleanAttribute });

    /** Whether the popup is modal: locks page scroll and makes outside content inert while open. */
    readonly modal = input(true, { transform: booleanAttribute });

    readonly dirInput = input<Direction | undefined>(undefined, { alias: 'dir' });
    readonly dir: Signal<Direction> = injectDirection(this.dirInput);

    /** How item values are compared for equality — a function `(a, b) => boolean` or an object key. */
    readonly isItemEqualToValue = input<ItemValueComparator<AcceptableValue>>();

    /** Converts a value to its display label (used by `RdxSelectValue`). */
    readonly itemToStringLabel = input<(value: AcceptableValue) => string>();

    /** Emits before an open-state change is committed; call `eventDetails.cancel()` to veto it. */
    readonly onOpenChange = output<RdxSelectOpenChangeEvent>();

    /** Emits before a value change is committed; call `eventDetails.cancel()` to veto it. */
    readonly onValueChange = output<RdxSelectValueChangeEvent>();

    /** Emits after the open/close transition (including any exit animation) finishes. */
    readonly onOpenChangeComplete = output<boolean>();

    private readonly transition = useTransitionStatus((open) => this.onOpenChangeComplete.emit(open));

    /** Open/close transition phase, for `data-starting-style` / `data-ending-style`. */
    readonly transitionStatus = this.transition.status;

    /** Registers the popup element whose animation determines transition completion. */
    readonly registerTransitionElement = this.transition.registerElement;

    readonly isEmptyModelValue = computed(() => {
        const value = this.value();
        if (this.multiple() && Array.isArray(value)) {
            return value.length === 0;
        }
        return isNullish(value);
    });

    constructor() {
        let previousOpen = untracked(this.open);
        effect(() => {
            const open = this.open();
            if (open === previousOpen) {
                return;
            }
            previousOpen = open;
            untracked(() => this.transition.start(open));
        });

        // A fresh open starts non-touch; the trigger flips it on a touch open. Reset whenever it closes.
        effect(() => {
            if (!this.open()) {
                untracked(() => this.openedByTouch.set(false));
            }
        });

        // Bridge the trigger into the floating context: the dismissal capability treats a press on the
        // trigger (the reference) as "inside", and uses it for positioning containment (ADR 0015).
        effect((onCleanup) => {
            const trigger = this.triggerElement();
            this.floatingContext.setReferenceElement(trigger);
            if (trigger) {
                this.floatingContext.triggers.add(trigger);
                onCleanup(() => this.floatingContext.triggers.delete(trigger));
            }
        });
    }

    readonly optionsSet = signal<Set<SelectOption>>(new Set());

    // The native `select` only associates the correct default value if the corresponding
    // `option` is rendered as a child **at the same time** as itself.
    // Because it might take a few renders for our items to gather the information to build
    // the native `option`(s), we generate a key on the `select` to make sure Vue re-builds it
    // each time the options change.
    readonly nativeSelectKey = computed(() => {
        return Array.from(this.optionsSet())
            .map((option) => option.value)
            .join(';');
    });

    readonly triggerElement = signal<HTMLElement | null>(null);
    readonly valueElement = signal<HTMLElement | null>(null);
    readonly triggerPointerDownPosRef = signal<{ x: number; y: number } | null>({
        x: 0,
        y: 0
    });

    getOption(value: SelectOption['value']) {
        return Array.from(this.optionsSet()).find((option) =>
            valueComparator(value, option.value, this.isItemEqualToValue())
        );
    }

    setValue(
        value: AcceptableValue,
        reason: RdxSelectValueChangeReason = 'none',
        event: Event = new Event('select.value-change')
    ): boolean {
        const nextValue = this.multiple()
            ? (() => {
                  const current = this.value();
                  const array = Array.isArray(current) ? [...current] : [];
                  const index = array.findIndex((i) => compare(i, value, this.isItemEqualToValue()));
                  index === -1 ? array.push(value) : array.splice(index, 1);
                  return [...array];
              })()
            : value;

        const { eventDetails } = createCancelableChangeEventDetails(reason, event, this.triggerElement() ?? undefined);
        this.onValueChange.emit({ value: nextValue, eventDetails });

        if (eventDetails.isCanceled()) {
            return false;
        }

        if (this.multiple()) {
            this.value.set(nextValue);
        } else {
            this.value.set(nextValue);
        }

        return true;
    }

    setOpen(open: boolean, reason: RdxSelectOpenChangeReason = 'none', event?: Event): boolean {
        const resolvedEvent = event ?? new Event('select.open-change');
        const interactionType = getInteractionTypeFromEvent(event);
        const { eventDetails } = createCancelableChangeEventDetails(
            reason,
            resolvedEvent,
            this.triggerElement() ?? undefined
        );

        this.onOpenChange.emit({ open, eventDetails });

        if (eventDetails.isCanceled()) {
            return false;
        }

        this.open.set(open);

        if (open) {
            this.openedByTouch.set((event as PointerEvent | undefined)?.pointerType === 'touch');
            this.openInteractionType.set(interactionType);
        } else {
            this.closeInteractionType.set(interactionType);
        }

        return true;
    }
}
