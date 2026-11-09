import {
    afterNextRender,
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    forwardRef,
    inject,
    Injector,
    input,
    model,
    output,
    Provider,
    Signal,
    signal,
    Type,
    untracked,
    WritableSignal
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import {
    BooleanInput,
    createCancelableChangeEventDetails,
    createContext,
    createFloatingRootContext,
    createLabelRegistry,
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
    RdxLabelRegistry,
    RdxNativeInputRef,
    RdxPopupPresenceRegistration,
    RdxTransitionStatus,
    serializeNativeFormValue,
    itemToStringValue as stringifyValue,
    useNativeFormControl,
    usePopupLifecycle
} from '@radix-ng/primitives/core';
import { injectDirection } from '@radix-ng/primitives/direction-provider';
import { injectFieldRootContext } from '@radix-ng/primitives/field';
import { getInteractionTypeFromEvent, RdxInteractionType } from '@radix-ng/primitives/floating-focus-manager';
import { RdxPopper } from '@radix-ng/primitives/popper';
import { RdxSelectItems, resolveSelectLabel } from './select-items';
import { compare } from './utils';

export type { RdxSelectItemGroup, RdxSelectItemOption, RdxSelectItems, RdxSelectLabelValue } from './select-items';

export interface SelectOption<Value = unknown> {
    value: Value | undefined;
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
    | 'imperative-action'
    | 'none';

export type RdxSelectValueChangeReason = RdxSelectOpenChangeReason;

export type RdxSelectOpenChangeEventDetails = RdxCancelableChangeEventDetails<RdxSelectOpenChangeReason>;

export interface RdxSelectOpenChangeEvent {
    open: boolean;
    eventDetails: RdxSelectOpenChangeEventDetails;
}

/** Imperative actions available directly on a Root template reference or view query. */
export interface RdxSelectRootActions {
    close: () => boolean;
    unmount: () => void;
}

export type RdxSelectValueChangeEventDetails = RdxCancelableChangeEventDetails<RdxSelectValueChangeReason>;

/** The selection shape follows Base UI's Value / Multiple contract; undefined remains accepted from Angular bindings. */
export type RdxSelectValueType<Value, Multiple extends boolean = boolean> =
    | (Multiple extends true ? Value[] : Value | null)
    | undefined;

export interface RdxSelectValueChangeEvent<Value = unknown, Multiple extends boolean = boolean> {
    value: RdxSelectValueType<Value, Multiple>;
    eventDetails: RdxSelectValueChangeEventDetails;
}

export interface RdxSelectRootContext<Value = unknown> extends RdxFormUiStateContext, RdxLabelRegistry {
    present: Signal<boolean>;
    skipExitAnimation: Signal<boolean>;
    registerPresence: (presence: RdxPopupPresenceRegistration) => () => void;
    autofillProbe: Signal<boolean>;
    id: Signal<string>;
    triggerId: WritableSignal<string | undefined>;
    triggerElement: WritableSignal<HTMLElement | null>;
    valueElement: WritableSignal<HTMLElement | null>;
    triggerPointerDownPosRef: WritableSignal<{ x: number; y: number } | null>;
    contentId: string;
    dir: Signal<Direction>;
    value: Signal<RdxSelectValueType<Value>>;
    multiple: Signal<boolean>;
    items: Signal<RdxSelectItems<Value> | undefined>;
    highlightItemOnHover: Signal<boolean>;
    isItemEqualToValue: Signal<ItemValueComparator<Value> | undefined>;
    itemToStringLabel: Signal<((value: Value) => string) | undefined>;
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
    optionsSet: Signal<Set<SelectOption<Value>>>;
    onOptionAdd: (option: () => SelectOption<Value>) => void;
    onOptionRemove: (option: () => SelectOption<Value>) => void;
    onValueChange: (value: Value | undefined, reason?: RdxSelectValueChangeReason, event?: Event) => boolean;
    onTriggerChange: (node: ElementRef<HTMLElement>) => void;
    onValueElementChange: (node: HTMLElement) => void;
    onOpenChange: (value: boolean, reason?: RdxSelectOpenChangeReason, event?: Event) => boolean;
}

// Angular DI erases a family's template generics. Independent child directives exchange unknown
// here; Root and application wrappers retain their own precise public Value contract.
const context = (): RdxSelectRootContext => {
    const context = inject(RdxSelectRoot);

    return {
        present: context.present,
        skipExitAnimation: context.skipExitAnimation,
        registerPresence: context.registerPresence,
        autofillProbe: context.autofillProbe,
        ...context.labelRegistry,
        id: context.controlId,
        triggerId: context.triggerId,
        triggerElement: context.triggerElement,
        valueElement: context.valueElement,
        triggerPointerDownPosRef: context.triggerPointerDownPosRef,
        contentId: context.contentId,
        dir: context.dir,
        value: context.value,
        multiple: context.multiple,
        items: context.items,
        highlightItemOnHover: context.highlightItemOnHover,
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
        onOptionAdd: (option) => context.optionGetters.update((current) => [...current, option]),
        onOptionRemove: (option) =>
            context.optionGetters.update((current) => current.filter((entry) => entry !== option)),
        onValueChange: (value: unknown, reason?: RdxSelectValueChangeReason, event?: Event) =>
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

/** Rebind the root's DI and form providers when a design-system component extends RdxSelectRoot. */
export function provideRdxSelectRoot<Value, Multiple extends boolean>(
    root: Type<RdxSelectRoot<Value, Multiple>>
): Provider[] {
    return [
        ...(root === RdxSelectRoot ? [] : [{ provide: RdxSelectRoot, useExisting: root }]),
        provideValueAccessor(root),
        provideSelectRootContext(context),
        provideFloatingTree(),
        provideFloatingRootContext(() => inject(root).floatingContext)
    ];
}

@Directive({
    selector: '[rdxSelectRoot]',
    exportAs: 'rdxSelectRoot',
    // AOT static fields run before the outer class binding used by the provider helper is initialized.
    providers: [forwardRef(() => provideRdxSelectRoot(RdxSelectRoot))],
    hostDirectives: [RdxPopper]
})
export class RdxSelectRoot<Value = unknown, Multiple extends boolean = boolean>
    extends RdxFormUiControlBase
    implements ControlValueAccessor, RdxFormValueControl<RdxSelectValueType<Value, Multiple>>, RdxSelectRootActions
{
    private readonly popper = inject(RdxPopper, { self: true });
    private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    private readonly injector = inject(Injector);
    private readonly destroyRef = inject(DestroyRef);
    private readonly field = injectFieldRootContext(true);

    /** Id of the select control. Forwarded to Trigger unless Trigger supplies its own id. */
    readonly id = input<string>();
    private readonly defaultId = injectId('rdx-select-');
    readonly controlId = computed(() => this.id() ?? this.defaultId, { debugName: 'RdxSelectRoot.controlId' });
    readonly labelRegistry = createLabelRegistry();
    readonly triggerId = signal<string | undefined>(undefined);

    readonly contentId = injectId('rdx-select-content-');

    readonly open = model<boolean>(false);
    private readonly forceMount = signal(false, { debugName: 'RdxSelectRoot.forceMount' });
    /** @internal Retained until the next open so a probe cannot flash during presence cleanup. */
    readonly autofillProbe = signal(false, { debugName: 'RdxSelectRoot.autofillProbe' });
    /** @internal Mount while open, during a deferred close, or to resolve browser-autofilled items. */
    readonly present = computed(() => this.lifecycle.present() || this.forceMount(), {
        debugName: 'RdxSelectRoot.present'
    });
    private autofillRequest = 0;

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

    readonly value = model<RdxSelectValueType<Value, Multiple>>();

    /** Initial value for the uncontrolled case. Applied once on init; `value`/`[(value)]` take over after. */
    readonly defaultValue = input<RdxSelectValueType<Value, Multiple>>();

    /** Whether the select is initially open (uncontrolled). Applied once on init. */
    readonly defaultOpen = input(false, { transform: booleanAttribute });

    readonly multiple = input<Multiple, Multiple | Exclude<BooleanInput, boolean>>(false as Multiple, {
        transform: (value) => booleanAttribute(value) as Multiple
    });

    /** Labels for Select.Value, available even when the popup's items are not mounted. */
    readonly items = input<RdxSelectItems<Value>>();

    /** Whether pointer movement highlights items. Keyboard navigation is independent. */
    readonly highlightItemOnHover = input(true, { transform: booleanAttribute });

    readonly disabled = input(false, { transform: booleanAttribute });
    private readonly cvaDisabled = signal(false);
    readonly disabledState = computed(
        () => this.disabled() || this.cvaDisabled() || Boolean(this.field?.disabledState())
    );

    /** When `true`, the value cannot be changed by the user (the popup can still be opened to view it). */
    readonly readOnly = input(false, { transform: booleanAttribute });

    /** Marks the control as required — reflected on the trigger as `aria-required` / `data-required`. */
    readonly required = input(false, { transform: booleanAttribute });

    /** Name used when serializing this composite control into native `FormData`. */
    readonly name = input<string>();
    readonly effectiveName = computed(() => this.field?.name() ?? this.name(), {
        debugName: 'RdxSelectRoot.effectiveName'
    });
    private readonly requiredState = computed(() => this.required() || Boolean(this.field?.requiredState()), {
        debugName: 'RdxSelectRoot.requiredState'
    });

    /** Hint passed to the generated native input for browser autofill. */
    readonly autoComplete = input<string>();

    /** Called with the generated native input after hydration, and null when replaced or destroyed. */
    readonly inputRef = input<RdxNativeInputRef>();

    /** Id of an external form that owns this control. */
    readonly form = input<string>();

    /** Whether the popup is modal: locks page scroll and makes outside content inert while open. */
    readonly modal = input(true, { transform: booleanAttribute });

    readonly dirInput = input<Direction | undefined>(undefined, { alias: 'dir' });
    readonly dir: Signal<Direction> = injectDirection(this.dirInput);

    /** How item values are compared for equality — a function `(a, b) => boolean` or an object key. */
    readonly isItemEqualToValue = input<ItemValueComparator<Value>>();

    /** Converts a value to its display label (used by `RdxSelectValue`). */
    readonly itemToStringLabel = input<(value: Value) => string>();

    /** Converts an item value to the string submitted by a native form. */
    readonly itemToStringValue = input<(value: Value) => string>();

    /** Emits before an open-state change is committed; call `eventDetails.cancel()` to veto it. */
    readonly onOpenChange = output<RdxSelectOpenChangeEvent>();

    /** Emits before a value change is committed; call `eventDetails.cancel()` to veto it. */
    readonly onValueChange = output<RdxSelectValueChangeEvent<Value, Multiple>>();

    /** Emits after the open/close transition (including any exit animation) finishes. */
    readonly onOpenChangeComplete = output<boolean>();

    private readonly lifecycle = usePopupLifecycle(
        this.open,
        (open) => this.onOpenChangeComplete.emit(open),
        'RdxSelectRoot'
    );

    /** Open/close transition phase, for `data-starting-style` / `data-ending-style`. */
    readonly transitionStatus = this.lifecycle.status;

    /** Registers the popup element whose animation determines transition completion. */
    readonly registerTransitionElement = this.lifecycle.registerElement;
    /** @internal Presence reports when the live popup view has actually finished exiting. */
    readonly registerPresence = this.lifecycle.registerPresence;
    /** @internal An imperative completion bypasses a second CSS exit wait in Presence. */
    readonly skipExitAnimation = this.lifecycle.skipExitAnimation;

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
        name: this.effectiveName,
        form: this.form,
        disabled: this.disabledState,
        value: this.value,
        serialize: (value) => {
            return serializeNativeFormValue<Value>(value, this.itemToStringValue(), { multiple: this.multiple() });
        },
        input: {
            anchor: () => this.triggerElement(),
            type: () =>
                this.field || this.effectiveName() || this.autoComplete() || this.requiredState() || this.inputRef()
                    ? 'text'
                    : 'hidden',
            name: () => (this.scalarNativeValue() ? this.effectiveName() : undefined),
            value: () => {
                if (!this.scalarNativeValue()) return '';
                const value = this.value();
                return value == null ? '' : (this.itemToStringValue()?.(value as Value) ?? stringifyValue(value));
            },
            id: () =>
                this.scalarNativeValue() && this.effectiveName() ? undefined : `${this.controlId()}-hidden-input`,
            autoComplete: this.autoComplete,
            required: () => this.requiredState() && (this.scalarNativeValue() || this.isEmptyModelValue()),
            readOnly: this.readOnly,
            ref: this.inputRef,
            onChange: (value, event) => this.handleAutofill(value, event),
            onFocus: () => {
                const focusOptions = { preventScroll: false, focusVisible: true };
                this.triggerElement()?.focus(focusOptions);
            },
            onInvalid: () => {
                this.formUi.markAsTouched();
                this.field?.setTouched(true);
            }
        },
        defaultValue: () => {
            const defaultValue = this.defaultValue();
            const emptyValue = (this.multiple() ? [] : null) as RdxSelectValueType<Value, Multiple>;
            if (defaultValue !== undefined) return defaultValue ?? emptyValue;
            const value = this.value();
            return value === undefined ? emptyValue : value;
        },
        onReset: (value) => {
            this.autofillRequest++;
            this.forceMount.set(false);
            this.value.set(value);
            if (!this.resetNgControl(value)) {
                this.onChange?.(value);
            }
            this.formUi.resetInteractionState?.();
        }
    });

    /** The technical native input, available after hydration; null on the server and after destruction. */
    readonly nativeInput = this.nativeFormControl.inputElement;

    private scalarNativeValue(): boolean {
        return !this.multiple();
    }

    private async handleAutofill(text: string, event: Event): Promise<void> {
        if (!this.scalarNativeValue() || this.disabledState() || this.readOnly()) return;
        const request = ++this.autofillRequest;
        if (!this.open()) {
            this.autofillProbe.set(true);
            this.forceMount.set(true);
        }
        // Items and their labels are now available even when the popup had never opened.
        await new Promise<void>((resolve) => {
            const unregister = this.destroyRef.onDestroy(resolve);
            afterNextRender(
                {
                    read: () => {
                        unregister();
                        resolve();
                    }
                },
                { injector: this.injector }
            );
        });
        if (this.destroyRef.destroyed || request !== this.autofillRequest) return;
        try {
            const options = this.optionGetters().map((option) => option());
            const key = text.toLowerCase();
            const match =
                options.find(
                    (option) =>
                        option.value != null &&
                        ((
                            this.itemToStringValue()?.(option.value as Value) ?? stringifyValue(option.value)
                        ).toLowerCase() === key ||
                            resolveSelectLabel(option.value, undefined, this.itemToStringLabel()).toLowerCase() === key)
                ) ?? options.find((option) => option.value != null && option.textContent.toLowerCase() === key);
            if (match && !compare(this.value() as Value, match.value, this.isItemEqualToValue())) {
                this.setValue(match.value, 'none', event);
            }
        } finally {
            this.forceMount.set(false);
        }
    }

    constructor() {
        super();

        effect(() => {
            if (this.open()) this.autofillProbe.set(false);
        });

        // Root is also valid on ng-container. Forward its logical id without host bindings on
        // container nodes, and avoid duplicating a static id on a separate root element.
        effect(() => {
            const id = this.controlId();
            if (
                this.hostElement.nodeType === 1 &&
                this.triggerElement() !== this.hostElement &&
                this.hostElement.getAttribute('id') === id
            ) {
                this.hostElement.removeAttribute('id');
            }
        });

        // Seed the uncontrolled value/open exactly once, then hand off to the model (so a later user
        // change is not snapped back by the still-set default input).
        effect(() => {
            const defaultValue = this.defaultValue();
            const multiple = this.multiple();
            if (!this.hasAppliedDefaultValue) {
                this.hasAppliedDefaultValue = true;
                if (untracked(this.value) === undefined) {
                    this.value.set(
                        (multiple ? (defaultValue ?? []) : (defaultValue ?? null)) as RdxSelectValueType<
                            Value,
                            Multiple
                        >
                    );
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
            // A component wrapper's trigger is a view child, outside Popper's content query.
            // Register the same trigger explicitly so both composition forms stay anchored.
            this.popper.anchorOverride.set(trigger ?? undefined);
            this.floatingContext.setReferenceElement(trigger);
            if (trigger) {
                this.floatingContext.triggers.add(trigger);
                onCleanup(() => this.floatingContext.triggers.delete(trigger));
            }
        });
    }

    /** @internal Live getters retain option identity and read current rendered labels for autofill. */
    readonly optionGetters = signal<readonly (() => SelectOption<Value>)[]>([], {
        debugName: 'RdxSelectRoot.optionGetters'
    });
    readonly optionsSet = computed(() => new Set(this.optionGetters().map((option) => option())), {
        debugName: 'RdxSelectRoot.optionsSet'
    });

    /** Legacy option-key view of the live option registry. */
    readonly nativeSelectKey = computed(() => {
        return Array.from(this.optionsSet())
            .map(({ value }) => (value == null ? '' : (this.itemToStringValue()?.(value) ?? stringifyValue(value))))
            .join(';');
    });

    readonly triggerElement = signal<HTMLElement | null>(null);
    readonly valueElement = signal<HTMLElement | null>(null);
    readonly triggerPointerDownPosRef = signal<{ x: number; y: number } | null>({
        x: 0,
        y: 0
    });

    getOption(value: Value | undefined) {
        return Array.from(this.optionsSet()).find((option) => compare(value, option.value, this.isItemEqualToValue()));
    }

    setValue(
        value: Value | undefined,
        reason: RdxSelectValueChangeReason = 'none',
        event: Event = new Event('select.value-change')
    ): boolean {
        if (this.disabledState() || this.readOnly()) {
            return false;
        }

        const nextValue = (
            this.multiple()
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
                : value
        ) as RdxSelectValueType<Value, Multiple>;

        const { eventDetails } = createCancelableChangeEventDetails(reason, event, this.triggerElement() ?? undefined);
        this.onValueChange.emit({ value: nextValue, eventDetails });

        if (eventDetails.isCanceled()) {
            return false;
        }

        this.value.set(nextValue);
        this.formUi.markDirty();
        this.onChange?.(nextValue);
        this.field?.notifyEdited();

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
        const transaction = this.lifecycle.prepareOpenChange(open);
        eventDetails.preventUnmountOnClose = transaction.preventUnmountOnClose;

        this.onOpenChange.emit({ open, eventDetails });

        if (eventDetails.isCanceled()) {
            return false;
        }

        this.open.set(open);
        transaction.commit();

        if (open) {
            this.openedByTouch.set((event as PointerEvent | undefined)?.pointerType === 'touch');
            this.openInteractionType.set(interactionType);
        } else {
            this.closeInteractionType.set(interactionType);
        }

        return true;
    }

    /** Request a cancelable close with the Base UI `imperative-action` reason. */
    close(): boolean {
        return this.open() ? this.setOpen(false, 'imperative-action') : false;
    }

    /** Finish a pending close after an external animation; ignored while open or already complete. */
    unmount(): void {
        this.lifecycle.unmount();
    }

    /** @ignore Bridge the CVA touched callback into the shared Signal Forms UI-state path. */
    protected override formUiTouchTarget(): RdxFormUiTouchTarget {
        return { markAsTouched: () => this.onTouched?.() };
    }

    /** @ignore Write a form-owned value without emitting a user change. */
    writeValue(value: RdxSelectValueType<Value, Multiple>): void {
        untracked(() => this.value.set(value));
    }

    /** @ignore Register the Reactive Forms / ngModel value callback. */
    registerOnChange(fn: (value: RdxSelectValueType<Value, Multiple>) => void): void {
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

    private onChange?: (value: RdxSelectValueType<Value, Multiple>) => void;
    private onTouched?: () => void;
}
