import {
    booleanAttribute,
    computed,
    Directive,
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
    provideValueAccessor,
    RdxCancelableChangeEventDetails,
    RdxFormUiControlBase,
    RdxFormUiTouchTarget,
    RdxFormValueControl,
    serializeNativeFormValue,
    useNativeFormControl,
    watch
} from '@radix-ng/primitives/core';
import { RdxRadioValueChangeReason } from './radio-tokens';

export type { RdxRadioValueChangeReason } from './radio-tokens';

export type RdxRadioValueChangeEventDetails = RdxCancelableChangeEventDetails<RdxRadioValueChangeReason>;

export interface RdxRadioValueChangeEvent {
    value: string;
    eventDetails: RdxRadioValueChangeEventDetails;
}

export interface RadioRootContext {
    value: Signal<string | null>;
    disabledState: Signal<boolean>;
    readonly: Signal<boolean>;
    required: Signal<boolean>;
    name: Signal<string | undefined>;
    form: Signal<string | undefined>;
    registerNativeInput(value: string, input: HTMLInputElement): () => void;
    syncNativeInputs(): void;
    select(value: string | null, event?: Event, reason?: RdxRadioValueChangeReason, trigger?: HTMLElement): boolean;
    tabStopIndex: Signal<number>;
    isKeyboardFocus(element: HTMLElement): boolean;
}

const rootContext = (): RadioRootContext => {
    const root = inject(RdxRadioGroupDirective);

    return {
        value: root.currentValue,
        disabledState: root.disabledState,
        readonly: root.readonly,
        required: root.required,
        name: root.name,
        form: root.form,
        registerNativeInput: (value, input) => root.registerNativeInput(value, input),
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
        '[attr.aria-required]': 'required() ? "true" : undefined',
        '[attr.aria-disabled]': 'disabledState() ? "true" : undefined',
        '[attr.aria-readonly]': 'readonly() ? "true" : undefined',
        '[attr.aria-invalid]': 'displayValid() === false ? "true" : undefined',
        '[attr.data-disabled]': 'disabledState() ? "" : undefined',
        '[attr.data-invalid]': 'displayValid() === false ? "" : undefined',
        '[attr.data-valid]': 'displayValid() === true ? "" : undefined',
        '[attr.data-touched]': 'touchedState() ? "" : undefined',
        '[attr.data-dirty]': 'dirtyState() ? "" : undefined',
        '(focusout)': 'onFocusOut($event)'
    }
})
export class RdxRadioGroupDirective
    extends RdxFormUiControlBase
    implements ControlValueAccessor, RdxFormValueControl<string | null>, OnChanges
{
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly compositeRoot = inject(RdxCompositeRoot, { self: true });
    private hasExplicitValueInput = false;
    private hasCvaValue = false;

    /**
     * The editable form value. Use a string identifier for each option and null for no selection.
     * Accepts local edits and connects to Angular Forms or `[(value)]`.
     */
    readonly value = model<string | null>(null);

    /** Parent-owned selection. A defined value, including null, takes precedence over the editable model. */
    readonly controlledValue = input<string | null>();

    /** The effective selection used by the items and native form controls. */
    readonly currentValue = computed(() => {
        const controlledValue = this.controlledValue();
        return controlledValue === undefined ? this.value() : controlledValue;
    });

    /** Initial selection when neither a value binding nor an Angular form supplies one. */
    readonly defaultValue = input<string>();

    readonly name = input<string>();

    readonly form = input<string>();

    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Whether the user should be unable to select a different radio button. Bound in templates as
     * `readOnly` (Base UI spelling); the TS member stays `readonly` for cross-primitive consistency.
     */
    readonly readonly = input<boolean, BooleanInput>(false, { alias: 'readOnly', transform: booleanAttribute });

    readonly required = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Event handler called when the value changes.
     */
    readonly onValueChange = output<RdxRadioValueChangeEvent>();

    private readonly disable = signal<boolean>(false);
    readonly disabledState = computed(() => this.disable() || this.disabled());
    readonly invalidState = this.formUi.invalidState;
    readonly touchedState = this.formUi.touchedState;
    readonly dirtyState = this.formUi.dirtyState;
    /** @ignore The last focused index, seeded from the checked Item when the Composite mounts. */
    readonly tabStopIndex = this.compositeRoot.highlightedIndex.asReadonly();
    private readonly nativeInputs = signal<ReadonlyMap<string, HTMLInputElement>>(new Map());
    private readonly selectedItemHasNativeInput = computed(() => {
        const value = this.currentValue();
        return value !== null && this.nativeInputs().has(value);
    });

    /**
     * The callback function to call when the value of the radio group changes.
     */
    private onChange: (value: string | null) => void = () => {
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
            name: this.name,
            form: this.form,
            disabled: this.disabledState,
            value: this.currentValue,
            serialize: serializeNativeFormValue,
            hasNativeControl: this.selectedItemHasNativeInput,
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
        });

        this.compositeRoot.setModifierKeys(['Shift']);
        this.compositeRoot.configureKeyboardNavigation({ respectDefaultPrevented: true, stopPropagation: false });
    }

    /** @ignore */
    // eslint-disable-next-line no-restricted-syntax -- Observe initial model input presence, including null (ADR 0071).
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['value']?.currentValue !== undefined) this.hasExplicitValueInput = true;
    }

    private initialEditableValue(): string | null {
        const value = this.value();
        if (this.controlledValue() !== undefined) return value;
        return this.hasExplicitValueInput || this.hasCvaValue || value !== null ? value : (this.defaultValue() ?? null);
    }

    /**
     * Request a selection. Returns whether an editable value was committed.
     * @ignore
     */
    select(
        value: string | null,
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

        const input = value === null ? undefined : this.nativeInputs().get(value);
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
        for (const [value, input] of this.nativeInputs()) {
            input.checked = value === selectedValue;
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
    writeValue(value: string | null): void {
        this.hasCvaValue = true;
        untracked(() => this.value.set(value ?? null));
    }

    /**
     * Register a callback function to call when the value of the radio group changes.
     * @param fn The callback function to call when the value of the radio group changes.
     * @ignore
     */
    registerOnChange(fn: (value: string | null) => void): void {
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

    /** @ignore Register an optional native radio input by its item value. */
    registerNativeInput(value: string, input: HTMLInputElement): () => void {
        this.nativeInputs.update((inputs) => new Map(inputs).set(value, input));
        return () => {
            this.nativeInputs.update((inputs) => {
                if (inputs.get(value) !== input) {
                    return inputs;
                }

                const next = new Map(inputs);
                next.delete(value);
                return next;
            });
        };
    }

    /**
     * Marks the control touched when focus leaves the whole group (Base UI `RadioGroup` parity and the
     * ADR 0004 CVA strategy) — moving focus between items stays inside, so `relatedTarget` is checked.
     */
    protected onFocusOut(event: FocusEvent): void {
        const next = event.relatedTarget as Node | null;
        if (!this.elementRef.nativeElement.contains(next)) {
            this.formUi.markAsTouched();
        }
    }
}
