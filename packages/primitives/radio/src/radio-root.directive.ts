import {
    afterEveryRender,
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    linkedSignal,
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
    type RdxNativeInputRef,
    type RdxValidationError,
    serializeItemValue,
    serializeNativeFormValue,
    useNativeFormControl,
    watch
} from '@radix-ng/primitives/core';
import { injectFieldRootContext, type RdxFieldRootContext } from '@radix-ng/primitives/field';
import { injectFieldsetRootContext } from '@radix-ng/primitives/fieldset';
import { injectFormRootContext } from '@radix-ng/primitives/form';
import { radioDescribedBy, type RadioItemRegistration } from './radio-field';
import { useRadioInputRef } from './radio-input-ref';
import { RdxRadioValueChangeReason } from './radio-tokens';

export type { RdxRadioValueChangeReason } from './radio-tokens';

export type RdxRadioValueChangeEventDetails = RdxCancelableChangeEventDetails<RdxRadioValueChangeReason>;

interface RadioRequiredError {
    readonly target: HTMLElement;
    readonly message: string;
}

/** An explicit form attribute takes precedence even when the specified form does not exist. */
function hasNoFormOwner(input: HTMLInputElement): boolean {
    return input.form === null && !input.hasAttribute('form');
}

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
        '[attr.aria-labelledby]': 'labelledBy()',
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
    private readonly fieldset = injectFieldsetRootContext(true);
    private readonly formRoot = injectFormRootContext(true);
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

    /** Called with the group's representative authored input and released when the binding changes. */
    readonly inputRef = input<RdxNativeInputRef>();

    /** ID of the radiogroup, used for the enclosing Field's focus target. */
    readonly id = input(injectId('rdx-radio-group-'));

    /** Override the accessible label supplied by Field or Fieldset. */
    readonly ariaLabelledBy = input<string>(undefined, { alias: 'aria-labelledby' });

    /** Additional description IDs. Field descriptions and errors are appended automatically. */
    readonly ariaDescribedBy = input<string>(undefined, { alias: 'aria-describedby' });

    protected readonly describedBy = computed(() => radioDescribedBy(this.ariaDescribedBy(), this.field));
    protected readonly labelledBy = computed(
        () => this.ariaLabelledBy() ?? this.field?.labelId() ?? this.fieldset?.labelId()
    );

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
    private readonly representativeInput = linkedSignal({
        source: () => {
            const value = this.currentValue();
            const candidates: HTMLInputElement[] = [];
            let checked: HTMLInputElement | null = null;
            for (const item of this.items()) {
                const input = item.nativeInput()?.element;
                if (!input || item.disabled()) continue;
                candidates.push(input);
                if (item.value() === value && value !== null) checked ??= input;
            }
            return { value, candidates, checked };
        },
        computation: ({ value, candidates, checked }, previous): HTMLInputElement | null => {
            if (checked) return checked;
            if (!previous || (value === null && previous.source.value !== null)) return candidates[0] ?? null;
            if (previous.value && candidates.includes(previous.value)) return previous.value;

            // A detached representative releases its ref. An existing unchecked sibling does
            // not claim that binding until it becomes selected or registers again.
            const previousCandidates = new Set(previous.source.candidates);
            return candidates.find((input) => !previousCandidates.has(input)) ?? null;
        }
    });

    /** The currently forwarded native radio input. Fallback form inputs are excluded. */
    readonly nativeInput = this.representativeInput.asReadonly();
    private readonly submissionValue = computed(() => {
        const item = this.selectedItem();
        return item && !item.disabled() ? this.currentValue() : null;
    });
    private readonly focusedItem = signal<HTMLElement | null>(null);
    private readonly initialSelection = signal<Value | null>(null);
    private readonly validationBlurred = signal(false);
    private readonly validationChanged = linkedSignal({
        // With updateOn: 'blur', the visible selection can be ahead of the form model.
        source: () => (this.ngControlState.connected() ? (this.ngControlState.value() ?? null) : this.currentValue()),
        computation: (value, previous): boolean => !!previous && (previous.value || previous.source !== value)
    });
    private readonly requiredError = signal<RadioRequiredError | null>(null, {
        equal: (previous, next) => previous?.target === next?.target && previous?.message === next?.message
    });
    private readonly nativeErrors = computed<readonly RdxValidationError[]>(() => {
        const error = this.requiredError();
        return error ? [{ kind: 'valueMissing', message: error.message }] : [];
    });

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

        useRadioInputRef(this.nativeInput, this.inputRef);

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
                if (this.controlledValue() === undefined) {
                    // A connected Angular form owns its reset baseline.
                    if (!this.resetNgControl(undefined)) this.value.set(value);
                }
                this.reset();
            }
        });

        watch([], () => {
            this.value.set(this.initialEditableValue());
            this.initialSelection.set(this.currentValue());
            this.validationChanged.set(false);
        });

        const field = this.field;
        if (field) {
            effect(() => field.setControlId(this.id()));
            effect(() => field.setDirty(this.currentValue() !== this.initialSelection()));
            effect(() => {
                const item = this.items().find(({ element }) => element === this.focusedItem());
                field.setFocused(Boolean(item && !item.disabled()));
            });
            const unregisterState = field.registerControlState({
                filled: () => this.currentValue() !== null,
                blurred: this.validationBlurred,
                changed: this.validationChanged,
                nativeErrors: this.nativeErrors,
                refreshNativeValidity: () => this.refreshNativeValidity(),
                invalidFocusTarget: () => this.requiredError()?.target ?? null,
                portaledEntry: () => this.portaledEntry()
            });
            afterEveryRender({ read: () => this.refreshNativeValidity() });
            inject(DestroyRef).onDestroy(() => {
                unregisterState();
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

    private refreshNativeValidity(): void {
        const form = this.formRoot?.element;
        for (const { element, nativeInput } of this.items()) {
            const input = nativeInput()?.element;
            if (!input?.isConnected || !input.willValidate) continue;
            if (form && input.form !== form && !hasNoFormOwner(input)) continue;
            if (input.validity.valueMissing) {
                this.requiredError.set({ target: element, message: input.validationMessage });
                return;
            }
        }
        this.requiredError.set(null);
    }

    private portaledEntry(): readonly [name: string, value: string] | undefined {
        const input = this.selectedItem()?.nativeInput()?.element;
        if (
            !input?.isConnected ||
            !hasNoFormOwner(input) ||
            !input.checked ||
            !input.name ||
            input.matches(':disabled')
        )
            return undefined;
        return [input.name, input.value];
    }

    /** @ignore Bridge the CVA `onTouched` so `markAsTouched()` also notifies Reactive/template forms. */
    protected override formUiTouchTarget(): RdxFormUiTouchTarget {
        return { markAsTouched: () => this.onTouched() };
    }

    /** @ignore Clear interaction state when the surrounding native or Angular form resets. */
    override reset(): void {
        super.reset();
        this.validationBlurred.set(false);
        this.validationChanged.set(false);
        this.field?.setDirty(false);
        this.field?.setTouched(false);
    }

    /**
     * Update the value of the radio group.
     * @param value The new value of the radio group.
     * @ignore
     */
    writeValue(value: Value | null): void {
        const initialWrite = !this.hasCvaValue;
        this.hasCvaValue = true;
        untracked(() => {
            this.value.set(value ?? null);
            if (initialWrite) this.validationChanged.set(false);
        });
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
            this.validationBlurred.set(true);
            this.field?.setTouched(true);
            this.formUi.markAsTouched();
        }
    }
}
