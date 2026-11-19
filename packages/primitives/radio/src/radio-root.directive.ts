import {
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    model,
    OnChanges,
    output,
    signal,
    Signal,
    SimpleChanges,
    untracked
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { RdxCompositeRoot } from '@radix-ng/primitives/composite';
import {
    BooleanInput,
    createCancelableChangeEventDetails,
    createContext,
    injectId,
    injectTabIndexAttribute,
    provideValueAccessor,
    RdxCancelableChangeEventDetails,
    RdxFormUiControlBase,
    RdxFormUiTouchTarget,
    RdxFormValueControl,
    serializeItemValue,
    serializeNativeFormValue,
    useNativeFormControl,
    watch
} from '@radix-ng/primitives/core';
import { injectFieldRootContext, type RdxFieldRootContext } from '@radix-ng/primitives/field';
import { radioDescribedBy, type RadioItemRegistration } from './radio-field';
import { RdxRadioValueChangeReason } from './radio-tokens';

export type { RdxRadioValueChangeReason } from './radio-tokens';

export type RdxRadioValueChangeEventDetails = RdxCancelableChangeEventDetails<RdxRadioValueChangeReason>;

export interface RdxRadioValueChangeEvent<Value = string> {
    value: Value;
    eventDetails: RdxRadioValueChangeEventDetails;
}

export interface RadioRootContext {
    value: Signal<unknown>;
    disabledState: Signal<boolean>;
    readonly: Signal<boolean>;
    required: Signal<boolean>;
    name: Signal<string | undefined>;
    form: Signal<string | undefined>;
    field: RdxFieldRootContext | null;
    syncNativeInputs(): void;
    select(value: unknown, event?: Event, reason?: RdxRadioValueChangeReason, trigger?: HTMLElement): boolean;
    tabStopIndex: Signal<number>;
    isKeyboardFocus(element: HTMLElement): boolean;
}

const rootContext = (): RadioRootContext => {
    const root = inject(RdxRadioGroupDirective);

    return {
        value: root.currentValue,
        disabledState: root.disabledState,
        readonly: root.readonly,
        required: root.requiredState,
        name: root.effectiveName,
        form: root.form,
        field: root.field,
        syncNativeInputs: () => root.syncNativeInputs(),
        select: (value, event, reason, trigger) => root.select(value, event, reason, trigger),
        tabStopIndex: root.tabStopIndex,
        isKeyboardFocus: (element) => root.isKeyboardFocus(element)
    };
};

export const [injectRadioRootContext, provideRadioRootContext] = createContext<RadioRootContext>(
    'RadioRootContext',
    'components/radio'
);

@Directive({
    selector: '[rdxRadioRoot]',
    exportAs: 'rdxRadioRoot',
    providers: [provideValueAccessor(RdxRadioGroupDirective), provideRadioRootContext(rootContext)],
    hostDirectives: [RdxCompositeRoot],
    host: {
        role: 'radiogroup',
        '[attr.id]': 'id()',
        '[attr.tabindex]': 'authoredTabIndex ?? (field ? -1 : undefined)',
        '[attr.aria-labelledby]': 'ariaLabelledBy() ?? field?.labelId()',
        '[attr.aria-describedby]': 'describedBy()',
        '[attr.aria-required]': 'requiredState() ? "true" : undefined',
        '[attr.aria-disabled]': 'disabledState() ? "true" : undefined',
        '[attr.aria-readonly]': 'readonly() ? "true" : undefined',
        '[attr.aria-invalid]': 'displayValid() === false ? "true" : undefined',
        '[attr.data-disabled]': 'disabledState() ? "" : undefined',
        '[attr.data-required]': 'requiredState() ? "" : undefined',
        '[attr.data-readonly]': 'readonly() ? "" : undefined',
        '[attr.data-invalid]': 'displayValid() === false ? "" : undefined',
        '[attr.data-valid]': 'displayValid() === true ? "" : undefined',
        '[attr.data-touched]': 'touchedState() || field?.touchedState() ? "" : undefined',
        '[attr.data-dirty]': 'dirtyState() || field?.dirtyState() ? "" : undefined',
        '[attr.data-filled]': 'field?.filledState() ? "" : undefined',
        '[attr.data-focused]': 'field?.focusedState() ? "" : undefined',
        '(focus)': 'focusGroupItem()',
        '(focusin)': 'onFocusIn($event)',
        '(focusout)': 'onFocusOut($event)'
    }
})
export class RdxRadioGroupDirective<Value = string>
    extends RdxFormUiControlBase
    implements ControlValueAccessor, RdxFormValueControl<Value | null>, OnChanges
{
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly compositeRoot = inject(RdxCompositeRoot, { self: true });
    /** @ignore Optional enclosing Field, distinct from a radio's own Field.Item context. */
    readonly field = injectFieldRootContext(true);
    protected readonly authoredTabIndex = injectTabIndexAttribute();
    private hasExplicitValueInput = false;
    private hasCvaValue = false;

    /**
     * The editable form value. Use a unique value per option and null for no selection.
     * Object and array values are compared by reference.
     * Accepts local edits and connects to Angular Forms or `[(value)]`.
     */
    readonly value = model<Value | null>(null);

    /** Parent-owned selection. A defined value, including null, takes precedence over the editable model. */
    readonly controlledValue = input<Value | null>();

    /** The effective selection used by the items and native form controls. */
    readonly currentValue = computed(() => {
        const controlledValue = this.controlledValue();
        return controlledValue === undefined ? (this.value() ?? null) : controlledValue;
    });

    /** Initial selection when neither a value binding nor an Angular form supplies one. */
    readonly defaultValue = input<Value>();

    readonly name = input<string>();

    readonly form = input<string>();

    /** ID of the radiogroup, used for the enclosing Field's focus target. */
    readonly id = input(injectId('rdx-radio-group-'));

    /** Override the accessible label supplied by Field. */
    readonly ariaLabelledBy = input<string>(undefined, { alias: 'aria-labelledby' });

    /** Additional description IDs. Field descriptions and errors are appended automatically. */
    readonly ariaDescribedBy = input<string>(undefined, { alias: 'aria-describedby' });

    protected readonly describedBy = computed(() => radioDescribedBy(this.ariaDescribedBy(), this.field));

    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Whether the user should be unable to select a different radio button. Bound in templates as
     * `readOnly` (Base UI spelling); the TS member stays `readonly` for cross-primitive consistency.
     */
    readonly readonly = input<boolean, BooleanInput>(false, { alias: 'readOnly', transform: booleanAttribute });

    readonly required = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** @ignore Field can supply native form metadata. */
    readonly requiredState = computed(() => this.required() || Boolean(this.field?.requiredState()));

    /** @ignore Field's name takes precedence for browser submission. */
    readonly effectiveName = computed(() => this.field?.name() ?? this.name());

    /**
     * Event handler called when the value changes.
     */
    readonly onValueChange = output<RdxRadioValueChangeEvent<Value>>();

    private readonly disable = signal<boolean>(false);
    readonly disabledState = computed(() => this.disable() || this.disabled() || Boolean(this.field?.disabledState()));
    readonly invalidState = this.formUi.invalidState;
    readonly touchedState = this.formUi.touchedState;
    readonly dirtyState = this.formUi.dirtyState;
    /** @ignore The last focused index, seeded from the checked Item when the Composite mounts. */
    readonly tabStopIndex = this.compositeRoot.highlightedIndex.asReadonly();
    private readonly items = computed(() =>
        this.compositeRoot.items().flatMap(({ element, metadata }) => {
            const radio = metadata()?.['radio'] as RadioItemRegistration | undefined;
            return radio ? [{ element, ...radio }] : [];
        })
    );
    private readonly selectedItem = computed(() => {
        const value = this.currentValue();
        return value === null ? undefined : this.items().find((item) => item.value() === value);
    });
    private readonly submissionValue = computed(() => {
        const item = this.selectedItem();
        return item && !item.disabled() ? this.currentValue() : null;
    });
    private readonly focusedItem = signal<HTMLElement | null>(null);
    private readonly initialSelection = signal<Value | null>(null);

    /**
     * The callback function to call when the value of the radio group changes.
     */
    private onChange: (value: Value | null) => void = () => {
        /* Empty */
    };

    /**
     * The callback function to call when the radio group is touched.
     * @ignore
     */
    onTouched: () => void = () => {
        /* Empty */
    };

    constructor() {
        super();

        useNativeFormControl({
            name: this.effectiveName,
            form: this.form,
            disabled: this.disabledState,
            value: this.submissionValue,
            serialize: (value) => serializeNativeFormValue(value, serializeItemValue, { multiple: false }),
            hasNativeControl: computed(() => Boolean(this.selectedItem()?.nativeInput())),
            syncNativeControl: () => this.syncNativeInputs(),
            defaultValue: () => this.initialEditableValue(),
            onReset: (value) => {
                if (this.controlledValue() !== undefined) return;
                // A connected Angular form owns its reset baseline.
                if (!this.resetNgControl(undefined)) this.value.set(value);
                this.reset();
            }
        });

        watch([], () => {
            this.value.set(this.initialEditableValue());
            this.initialSelection.set(this.currentValue());
        });

        const field = this.field;
        if (field) {
            effect(() => field.setControlId(this.id()));
            effect(() => {
                const value = this.currentValue();
                field.setFilled(value !== null);
                field.setDirty(value !== this.initialSelection());
            });
            effect(() => {
                const item = this.items().find(({ element }) => element === this.focusedItem());
                field.setFocused(Boolean(item && !item.disabled()));
            });
            inject(DestroyRef).onDestroy(() => {
                if (field.controlId() === this.id()) field.setFocused(false);
            });
        }

        this.compositeRoot.setModifierKeys(['Shift']);
        this.compositeRoot.configureKeyboardNavigation({ respectDefaultPrevented: true, stopPropagation: false });
    }

    /** @ignore */
    // eslint-disable-next-line no-restricted-syntax -- Observe initial model input presence, including null (ADR 0071).
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['value']?.currentValue !== undefined) this.hasExplicitValueInput = true;
    }

    private initialEditableValue(): Value | null {
        const value = this.value() ?? null;
        if (this.controlledValue() !== undefined) return value;
        return this.hasExplicitValueInput || this.hasCvaValue || value !== null ? value : (this.defaultValue() ?? null);
    }

    /**
     * Request a selection. Returns whether an editable value was committed.
     * @ignore
     */
    select(
        value: Value | null,
        event?: Event,
        reason: RdxRadioValueChangeReason = 'none',
        trigger?: HTMLElement
    ): boolean {
        if (event?.defaultPrevented || this.disabledState() || this.readonly() || this.currentValue() === value) {
            return false;
        }

        const controlled = this.controlledValue() !== undefined;

        if (value !== null) {
            const { eventDetails } = createCancelableChangeEventDetails(
                reason,
                event ?? new Event('radio.value-change'),
                trigger
            );
            this.onValueChange.emit({ value, eventDetails });
            if (eventDetails.isCanceled()) {
                return false;
            }
        }

        if (controlled) return false;

        this.value.set(value);
        this.formUi.markDirty();
        this.onChange?.(value);
        this.onTouched();
        this.field?.setTouched(true);
        this.field?.notifyEdited();

        const input = this.selectedItem()?.nativeInput()?.element;
        if (input && event?.target !== input && this.currentValue() === value) {
            this.syncNativeInputs();
            input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }
        return true;
    }

    /** @ignore Restore the actual checked properties from the effective selection. */
    syncNativeInputs(): void {
        const selectedValue = this.currentValue();
        for (const item of this.items()) {
            const input = item.nativeInput()?.element;
            if (input) input.checked = selectedValue !== null && item.value() === selectedValue;
        }
    }

    /** @ignore Bridge the CVA `onTouched` so `markAsTouched()` also notifies Reactive/template forms. */
    protected override formUiTouchTarget(): RdxFormUiTouchTarget {
        return { markAsTouched: () => this.onTouched() };
    }

    /**
     * Update the value of the radio group.
     * @param value The new value of the radio group.
     * @ignore
     */
    writeValue(value: Value | null): void {
        this.hasCvaValue = true;
        untracked(() => this.value.set(value ?? null));
    }

    /**
     * Register a callback function to call when the value of the radio group changes.
     * @param fn The callback function to call when the value of the radio group changes.
     * @ignore
     */
    registerOnChange(fn: (value: Value | null) => void): void {
        this.onChange = fn;
    }

    /** @ignore */
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    /**
     * Set the disabled state of the radio group.
     * @param isDisabled Whether the radio group is disabled.
     * @ignore
     */
    setDisabledState(isDisabled: boolean): void {
        this.disable.set(isDisabled);
    }

    /** @ignore Limits selection on focus to an actual Composite keyboard move. */
    isKeyboardFocus(element: HTMLElement): boolean {
        return this.compositeRoot.isKeyboardFocus(element);
    }

    protected focusGroupItem(): void {
        if (!this.field || this.disabledState()) return;
        const selected = this.selectedItem();
        const item = selected && !selected.disabled() ? selected : this.items().find((item) => !item.disabled());
        item?.element.focus();
    }

    protected onFocusIn(event: FocusEvent): void {
        if (this.field) this.focusedItem.set(event.target as HTMLElement);
    }

    /**
     * Marks the control touched when focus leaves the whole group (Base UI `RadioGroup` parity and the
     * ADR 0004 CVA strategy) — moving focus between items stays inside, so `relatedTarget` is checked.
     */
    protected onFocusOut(event: FocusEvent): void {
        const next = event.relatedTarget as Node | null;
        if (!this.elementRef.nativeElement.contains(next)) {
            this.focusedItem.set(null);
            this.field?.setTouched(true);
            this.formUi.markAsTouched();
        }
    }
}
