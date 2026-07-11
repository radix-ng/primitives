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
    untracked,
    WritableSignal
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import {
    AcceptableValue,
    createCancelableChangeEventDetails,
    createContext,
    createFloatingRootContext,
    Direction,
    formUiStateContext,
    injectId,
    isNullish,
    ItemValueComparator,
    provideFloatingRootContext,
    provideFloatingTree,
    provideValueAccessor,
    RdxCancelableChangeEventDetails,
    RdxFloatingRootContext,
    RdxFormUiControlBase,
    RdxFormUiStateContext,
    RdxFormUiTouchTarget,
    RdxFormValueControl,
    RdxTransitionStatus,
    serializeNativeFormValue,
    useNativeFormControl,
    useTransitionStatus
} from '@radix-ng/primitives/core';
import { injectDirection } from '@radix-ng/primitives/direction-provider';
import { getInteractionTypeFromEvent, RdxInteractionType } from '@radix-ng/primitives/floating-focus-manager';
import { RdxPopper } from '@radix-ng/primitives/popper';
import { compare, valueComparator } from './utils';

export interface SelectOption {
    value: AcceptableValue | undefined;
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
    value: AcceptableValue | AcceptableValue[] | undefined;
    eventDetails: RdxSelectValueChangeEventDetails;
}

export interface RdxSelectRootContext extends RdxFormUiStateContext {
    triggerElement: WritableSignal<HTMLElement | null>;
    valueElement: WritableSignal<HTMLElement | null>;
    triggerPointerDownPosRef: WritableSignal<{ x: number; y: number } | null>;
    contentId: string;
    dir: Signal<Direction>;
    value: Signal<AcceptableValue | AcceptableValue[] | undefined>;
    multiple: Signal<boolean>;
    isItemEqualToValue: Signal<ItemValueComparator<AcceptableValue> | undefined>;
    itemToStringLabel: Signal<((value: AcceptableValue) => string) | undefined>;
    open: Signal<boolean>;
    openedByTouch: Signal<boolean>;
    openMethod: Signal<RdxSelectOpenMethod>;
    openInteractionType: Signal<RdxInteractionType>;
    closeInteractionType: Signal<RdxInteractionType>;
    disabled: Signal<boolean>;
    readOnly: Signal<boolean>;
    required: Signal<boolean>;
    modal: Signal<boolean>;
    isEmptyModelValue: Signal<boolean>;
    transitionStatus: Signal<RdxTransitionStatus>;
    registerTransitionElement: (element: HTMLElement) => () => void;
    optionsSet: Signal<Set<SelectOption>>;
    onOptionAdd: (option: () => SelectOption) => void;
    onOptionRemove: (option: () => SelectOption) => void;
    onValueChange: (value: AcceptableValue | undefined, reason?: RdxSelectValueChangeReason, event?: Event) => boolean;
    onTriggerChange: (node: ElementRef<HTMLElement>) => void;
    onValueElementChange: (node: HTMLElement) => void;
    onOpenChange: (value: boolean, reason?: RdxSelectOpenChangeReason, event?: Event) => boolean;
}

const context = (): RdxSelectRootContext => {
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
        ...formUiStateContext(context.formUi),
        disabled: context.disabledState,
        readOnly: context.readOnly,
        required: context.required,
        modal: context.modal,
        isEmptyModelValue: context.isEmptyModelValue,
        transitionStatus: context.transitionStatus,
        registerTransitionElement: context.registerTransitionElement,
        optionsSet: context.optionsSet,
        onOptionAdd: (option: () => SelectOption) => {
            const existingOption = context.getOption(option());
            if (existingOption) {
                context.optionsSet().delete(existingOption);
            }

            context.optionsSet().add(option());
        },
        onOptionRemove: (option: () => SelectOption) => {
            const existingOption = context.getOption(option());
            if (existingOption) {
                context.optionsSet().delete(existingOption);
            }
        },
        onValueChange: (value: AcceptableValue | undefined, reason?: RdxSelectValueChangeReason, event?: Event) =>
            context.setValue(value, reason, event),
        onTriggerChange: (node: ElementRef<HTMLElement>) => {
            context.triggerElement.set(node.nativeElement);
        },
        onValueElementChange: (node: HTMLElement) => {
            context.valueElement.set(node);
        },
        onOpenChange: (value: boolean, reason?: RdxSelectOpenChangeReason, event?: Event) =>
            context.setOpen(value, reason, event)
    };
};

export const [injectSelectRootContext, provideSelectRootContext] = createContext<RdxSelectRootContext>(
    'RdxSelectRootContext',
    'components/select'
);

@Directive({
    selector: '[rdxSelectRoot]',
    exportAs: 'rdxSelectRoot',
    providers: [
        provideValueAccessor(RdxSelectRoot),
        provideSelectRootContext(context),
        // New floating foundation (ADR 0015/0017) — the dismissal capability reads this shared context.
        provideFloatingTree(),
        provideFloatingRootContext(() => inject(RdxSelectRoot).floatingContext)
    ],
    hostDirectives: [RdxPopper]
})
export class RdxSelectRoot
    extends RdxFormUiControlBase
    implements ControlValueAccessor, RdxFormValueControl<AcceptableValue | AcceptableValue[] | undefined>
{
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

    /** Initial value for the uncontrolled case. Applied once on init; `value`/`[(value)]` take over after. */
    readonly defaultValue = input<AcceptableValue | AcceptableValue[]>();

    /** Whether the select is initially open (uncontrolled). Applied once on init. */
    readonly defaultOpen = input(false, { transform: booleanAttribute });

    readonly multiple = input(false, { transform: booleanAttribute });

    readonly disabled = input(false, { transform: booleanAttribute });
    private readonly cvaDisabled = signal(false);
    readonly disabledState = computed(() => this.disabled() || this.cvaDisabled());

    /** When `true`, the value cannot be changed by the user (the popup can still be opened to view it). */
    readonly readOnly = input(false, { transform: booleanAttribute });

    /** Marks the control as required — reflected on the trigger as `aria-required` / `data-required`. */
    readonly required = input(false, { transform: booleanAttribute });

    /** Name used when serializing this composite control into native `FormData`. */
    readonly name = input<string>();

    /** Id of an external form that owns this control. */
    readonly form = input<string>();

    /** Whether the popup is modal: locks page scroll and makes outside content inert while open. */
    readonly modal = input(true, { transform: booleanAttribute });

    readonly dirInput = input<Direction | undefined>(undefined, { alias: 'dir' });
    readonly dir: Signal<Direction> = injectDirection(this.dirInput);

    /** How item values are compared for equality — a function `(a, b) => boolean` or an object key. */
    readonly isItemEqualToValue = input<ItemValueComparator<AcceptableValue>>();

    /** Converts a value to its display label (used by `RdxSelectValue`). */
    readonly itemToStringLabel = input<(value: AcceptableValue) => string>();

    /** Converts an item value to the string submitted by a native form. */
    readonly itemToStringValue = input<(value: AcceptableValue) => string>();

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

    private hasAppliedDefaultValue = false;
    private hasAppliedDefaultOpen = false;

    private readonly nativeFormControl = useNativeFormControl({
        name: this.name,
        form: this.form,
        disabled: this.disabledState,
        value: this.value,
        serialize: (value) => {
            const itemToStringValue = this.itemToStringValue();
            return itemToStringValue
                ? serializeNativeFormValue(value, (entry) => itemToStringValue(entry as AcceptableValue))
                : serializeNativeFormValue(value);
        },
        defaultValue: () => {
            const defaultValue = this.defaultValue();
            return defaultValue === undefined ? this.value() : defaultValue;
        },
        onReset: (value) => {
            this.value.set(value);
            if (!this.resetNgControl(value)) {
                this.onChange?.(value);
            }
            this.formUi.resetInteractionState?.();
        }
    });

    constructor() {
        super();

        // Seed the uncontrolled value/open exactly once, then hand off to the model (so a later user
        // change is not snapped back by the still-set default input).
        effect(() => {
            const defaultValue = this.defaultValue();
            if (!this.hasAppliedDefaultValue && defaultValue !== undefined) {
                this.hasAppliedDefaultValue = true;
                if (untracked(this.value) === undefined) {
                    this.value.set(defaultValue);
                }
            }
        });

        effect(() => {
            const defaultOpen = this.defaultOpen();
            if (!this.hasAppliedDefaultOpen && defaultOpen) {
                this.hasAppliedDefaultOpen = true;
                this.open.set(defaultOpen);
            }
        });

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
        value: AcceptableValue | undefined,
        reason: RdxSelectValueChangeReason = 'none',
        event: Event = new Event('select.value-change')
    ): boolean {
        if (this.disabledState() || this.readOnly()) {
            return false;
        }

        const nextValue = this.multiple()
            ? (() => {
                  const current = this.value();
                  const array = Array.isArray(current) ? [...current] : [];
                  if (value === undefined) {
                      return array;
                  }
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

        this.value.set(nextValue);
        this.formUi.markDirty();
        this.onChange?.(nextValue);

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

    /** @ignore Bridge the CVA touched callback into the shared Signal Forms UI-state path. */
    protected override formUiTouchTarget(): RdxFormUiTouchTarget {
        return { markAsTouched: () => this.onTouched?.() };
    }

    /** @ignore Write a form-owned value without emitting a user change. */
    writeValue(value: AcceptableValue | AcceptableValue[] | undefined): void {
        untracked(() => this.value.set(value));
    }

    /** @ignore Register the Reactive Forms / ngModel value callback. */
    registerOnChange(fn: (value: AcceptableValue | AcceptableValue[] | undefined) => void): void {
        this.onChange = fn;
    }

    /** @ignore Register the Reactive Forms / ngModel touched callback. */
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    /** @ignore Merge form-owned disabled state with the public disabled input. */
    setDisabledState(isDisabled: boolean): void {
        this.cvaDisabled.set(isDisabled);
    }

    private onChange?: (value: AcceptableValue | AcceptableValue[] | undefined) => void;
    private onTouched?: () => void;
}
