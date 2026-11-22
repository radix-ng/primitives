import {
    afterNextRender,
    afterRenderEffect,
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
    SimpleChanges,
    untracked
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import {
    BooleanInput,
    createCancelableChangeEventDetails,
    injectId,
    provideValueAccessor,
    RdxCancelableChangeEventDetails,
    RdxFormCheckboxControl,
    RdxFormUiControlBase,
    RdxFormUiTouchTarget,
    RdxNativeInputRef,
    useNativeFormControl,
    watch
} from '@radix-ng/primitives/core';
import { fieldDescribedBy, injectFieldRootContext, useFieldValueMissing } from '@radix-ng/primitives/field';
import { provideSwitchContext, RdxSwitchContext } from './switch-context';

export type RdxSwitchCheckedChangeReason = 'none';
export type RdxSwitchCheckedChangeEventDetails = RdxCancelableChangeEventDetails<RdxSwitchCheckedChangeReason>;

export interface RdxSwitchCheckedChangeEvent {
    checked: boolean;
    eventDetails: RdxSwitchCheckedChangeEventDetails;
}

const context = (): RdxSwitchContext => {
    const root = inject(RdxSwitchRoot);

    return {
        checked: root.checkedState,
        disabled: root.disabledState,
        readonly: root.readonly,
        required: root.requiredState,
        name: root.nativeName,
        form: root.form,
        value: root.submitValue,
        ariaLabel: root.ariaLabel,
        ariaLabelledBy: root.ariaLabelledBy,
        displayValid: root.displayValid,
        touched: root.touchedState,
        dirty: root.dirtyState,
        filled: root.filledState,
        focused: root.focusedState,
        registerNativeInput: (input) => root.registerNativeInput(input),
        markAsTouched: () => root.markAsTouched(),
        focus: () => root.focus(),
        onNativeInputClick: (input, event) => root.onNativeInputClick(input, event)
    };
};

/**
 * A control that toggles between on and off.
 *
 * @see https://base-ui.com/react/components/switch
 */
@Directive({
    selector: 'button[rdxSwitchRoot]',
    exportAs: 'rdxSwitchRoot',
    providers: [provideSwitchContext(context), provideValueAccessor(RdxSwitchRoot)],
    host: {
        role: 'switch',
        type: 'button',
        '[id]': 'id()',
        '[attr.aria-checked]': 'checkedState()',
        '[attr.aria-required]': 'requiredState() ? "true" : undefined',
        '[attr.aria-readonly]': 'readonly() ? "true" : undefined',
        '[attr.aria-invalid]': '!disabledState() && displayValid() === false ? "true" : undefined',
        '[attr.aria-label]': 'ariaLabel()',
        '[attr.aria-labelledby]': 'labelledBy()',
        '[attr.aria-describedby]': 'describedBy()',
        '[attr.data-checked]': 'checkedState() ? "" : undefined',
        '[attr.data-unchecked]': 'checkedState() ? undefined : ""',
        '[attr.data-disabled]': 'disabledState() ? "" : undefined',
        '[attr.data-readonly]': 'readonly() ? "" : undefined',
        '[attr.data-required]': 'requiredState() ? "" : undefined',
        '[attr.data-invalid]': 'displayValid() === false ? "" : undefined',
        '[attr.data-valid]': 'displayValid() === true ? "" : undefined',
        '[attr.data-touched]': 'touchedState() ? "" : undefined',
        '[attr.data-dirty]': 'dirtyState() ? "" : undefined',
        '[attr.data-filled]': 'filledState() ? "" : undefined',
        '[attr.data-focused]': 'focusedState() ? "" : undefined',
        '[disabled]': 'disabledState()',
        '(click)': 'activate($event)',
        '(focus)': 'onFocus()',
        '(blur)': 'onBlur()'
    }
})
export class RdxSwitchRoot
    extends RdxFormUiControlBase
    implements RdxFormCheckboxControl, ControlValueAccessor, OnChanges
{
    private readonly element = inject<ElementRef<HTMLButtonElement>>(ElementRef).nativeElement;
    private readonly field = injectFieldRootContext(true);
    private readonly disabledByCva = signal(false);
    private readonly authoredInput = signal<HTMLInputElement | null>(null);
    private hasCheckedInput = false;
    private hasCvaValue = false;
    private fieldInitialChecked = false;
    private onChange?: (value: boolean) => void;
    private onTouched?: () => void;

    readonly id = input<string>(injectId('rdx-switch-'));

    /**
     * The state of the switch when it is initially rendered. Use when you do not need to control its state.
     *
     * @default false
     */
    readonly defaultChecked = input<boolean | undefined, BooleanInput | undefined>(undefined, {
        transform: (value) => (value === undefined ? undefined : booleanAttribute(value))
    });

    /**
     * Editable checked state for Angular Forms and two-way bindings.
     */
    readonly checked = model<boolean>(false);

    /** Parent-owned checked state. A defined value takes precedence over the editable model. */
    readonly controlledChecked = input<boolean>();

    /** Receives the active native checkbox in the browser, and null when the association ends. */
    readonly inputRef = input<RdxNativeInputRef>();

    /**
     * When `true`, prevents the user from interacting with the switch.
     *
     * @default false
     */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * When `true`, the switch is focusable but cannot be toggled.
     *
     * @default false
     */
    readonly readonly = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * When `true`, the switch must be on before the owning form can be submitted.
     *
     * @default false
     */
    readonly required = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Native form field name. */
    readonly name = input<string>();

    /** Associates the switch with an external form by id. */
    readonly form = input<string>();

    /**
     * Value submitted with the form when the switch is on.
     *
     * Bound publicly as `[value]`; the TS member is named `submitValue` so the
     * directive can satisfy `RdxFormCheckboxControl`, whose contract reserves a
     * `value` member for `RdxFormValueControl` and forbids it on checkbox-style
     * controls.
     *
     * @default 'on'
     */
    readonly submitValue = input<string>('on', { alias: 'value' });

    /**
     * Value submitted while the switch is off. When omitted, the off state contributes no entry,
     * matching native checkbox behavior.
     */
    readonly uncheckedValue = input<string>();

    /** Explicit ID references for the switch label. */
    readonly ariaLabelledBy = input<string>(undefined, { alias: 'aria-labelledby' });
    /** Accessible name supplied directly to the visible switch. */
    readonly ariaLabel = input<string>(undefined, { alias: 'aria-label' });
    /** Additional description IDs, followed by Field descriptions and errors. */
    readonly ariaDescribedBy = input<string>(undefined, { alias: 'aria-describedby' });

    protected readonly labelledBy = computed(
        () => this.ariaLabelledBy() ?? (this.ariaLabel()?.trim() ? undefined : this.field?.labelId())
    );
    protected readonly describedBy = computed(() => fieldDescribedBy(this.ariaDescribedBy(), this.field));

    /** Event handler called when the checked state of the switch changes. */
    readonly onCheckedChange = output<RdxSwitchCheckedChangeEvent>();

    /** @ignore */
    readonly checkedState = computed(() => this.controlledChecked() ?? this.checked());
    /** @ignore */
    readonly disabledState = computed(
        () => this.disabled() || this.disabledByCva() || (this.field?.disabledState() ?? false)
    );
    /** @ignore */
    readonly requiredState = computed(() => this.required() || (this.field?.requiredState() ?? false));
    /** @ignore */
    readonly nativeName = computed(() => this.field?.name() ?? this.name());
    /** The active native checkbox, generated after browser rendering when the template omits it. */
    readonly nativeInput = computed(() => this.authoredInput() ?? this.browserForm.inputElement());
    private readonly nativeInputOwnsValue = computed(
        () => this.authoredInput() !== null && (this.checkedState() || this.uncheckedValue() === undefined)
    );

    /** @ignore */
    readonly invalidState = this.formUi.invalidState;
    /** @ignore */
    readonly touchedState = computed(() => this.field?.touchedState() ?? this.formUi.touchedState());
    /** @ignore */
    readonly dirtyState = computed(() => this.field?.dirtyState() ?? this.formUi.dirtyState());
    /** @ignore */
    readonly filledState = computed(() => this.field?.filledState() ?? false);
    /** @ignore */
    readonly focusedState = computed(() => this.field?.focusedState() ?? false);

    private readonly browserForm = useNativeFormControl({
        name: this.nativeName,
        form: this.form,
        disabled: this.disabledState,
        value: this.checkedState,
        serialize: (checked) => {
            const value = checked ? this.submitValue() : this.uncheckedValue();
            return value === undefined ? [] : [value];
        },
        hasNativeControl: this.nativeInputOwnsValue,
        syncNativeControl: () => {
            const input = this.authoredInput();
            if (input) input.checked = this.checkedState();
        },
        input: {
            type: () => 'checkbox',
            enabled: () => this.authoredInput() === null,
            name: this.nativeName,
            value: this.submitValue,
            checked: this.checkedState,
            required: this.requiredState,
            anchor: () => this.element,
            onClick: (input, event) => this.onNativeInputClick(input, event),
            onFocus: () => this.focus()
        },
        defaultValue: () => this.initialChecked(),
        onReset: (value) => {
            if (this.controlledChecked() !== undefined) return;
            if (!this.resetNgControl(undefined)) this.checked.set(value);
            this.reset();
        }
    });

    constructor() {
        super();
        watch([], () => {
            if (this.controlledChecked() === undefined) this.checked.set(this.initialChecked());
            this.fieldInitialChecked = this.checkedState();
        });
        afterRenderEffect({
            read: (onCleanup) => {
                const ref = this.inputRef();
                const input = this.nativeInput();
                if (!ref || !input) return;
                untracked(() => ref(input));
                onCleanup(() => ref(null));
            }
        });
        const field = this.field;
        if (field) {
            effect(() => field.setControlId(this.id()));
            const focusTarget = () => (this.disabledState() ? null : this.element);
            const unregister = field.registerControlState({
                filled: this.checkedState,
                blurred: this.touchedState,
                changed: this.dirtyState,
                ...useFieldValueMissing(() => {
                    const element = this.nativeInput();
                    return element ? [{ element, focusTarget, participates: () => true }] : [];
                }, focusTarget)
            });
            afterNextRender(() => {
                const owner = this.element.getRootNode() as Document | ShadowRoot;
                if (owner.activeElement === this.element) this.onFocus();
            });
            watch([this.disabledState], ([disabled]) => {
                if (disabled) field.setFocused(false, this.element);
            });
            watch(
                [this.checkedState],
                ([checked]) => {
                    field.setDirty(checked !== this.fieldInitialChecked);
                    field.notifyEdited();
                },
                { defer: true }
            );
            inject(DestroyRef).onDestroy(() => {
                field.setFocused(false, this.element);
                if (field.controlId() === this.id()) field.setControlId('');
                unregister();
            });
        }
    }

    /** @ignore */
    // eslint-disable-next-line no-restricted-syntax -- Observe initial model input presence, including false (ADR 0071).
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['checked']?.currentValue !== undefined) this.hasCheckedInput = true;
    }

    private initialChecked(): boolean {
        if (this.hasCheckedInput || this.hasCvaValue || this.checked()) return this.checked();
        return this.defaultChecked() ?? false;
    }

    /** @ignore Angular Forms writes the editable value without publishing a user request. */
    writeValue(value: unknown): void {
        this.hasCvaValue = true;
        this.checked.set(value === true);
    }

    /** @ignore */
    registerOnChange(fn: (value: boolean) => void): void {
        this.onChange = fn;
    }

    /** @ignore */
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    /** @ignore */
    setDisabledState(disabled: boolean): void {
        this.disabledByCva.set(disabled);
    }

    /** @ignore Bridge the CVA into `markAsTouched` (dual). */
    protected override formUiTouchTarget(): RdxFormUiTouchTarget {
        return { markAsTouched: () => this.onTouched?.() };
    }

    /**
     * Mark the switch touched — CVA for Reactive forms, plus the `touched` model + `touch` output for
     * Signal Forms. Called when focus leaves the visible switch.
     */
    markAsTouched(): void {
        this.field?.setTouched(true);
        this.formUi.markAsTouched();
    }

    protected onFocus(): void {
        if (!this.disabledState()) this.field?.setFocused(true, this.element);
    }

    protected onBlur(): void {
        this.field?.setFocused(false, this.element);
        if (!this.disabledState()) this.markAsTouched();
    }

    override reset(): void {
        super.reset();
        this.fieldInitialChecked = this.checkedState();
        this.field?.setDirty(false);
        this.field?.setTouched(false);
        this.field?.setFocused(false, this.element);
    }

    /** @ignore Forward native invalid focus to the visible switch. */
    focus(): void {
        this.element.focus();
    }

    protected activate(event: MouseEvent): void {
        if (event.defaultPrevented || this.disabledState() || this.readonly()) return;
        this.browserForm.sync();
        const input = this.nativeInput();
        const owner = input?.ownerDocument.defaultView;
        if (!input || !owner) {
            this.requestChecked(!this.checkedState(), event);
            return;
        }

        input.dispatchEvent(
            new owner.MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                composed: true,
                altKey: event.altKey,
                ctrlKey: event.ctrlKey,
                metaKey: event.metaKey,
                shiftKey: event.shiftKey
            })
        );
    }

    /** @ignore Accept the browser's activation once, including clicks on the native input. */
    onNativeInputClick(input: HTMLInputElement, event: MouseEvent): void {
        event.stopPropagation();
        if (!this.requestChecked(input.checked, event)) event.preventDefault();
        queueMicrotask(() => {
            input.checked = this.checkedState();
        });
    }

    private requestChecked(next: boolean, event: Event): boolean {
        if (event.defaultPrevented || this.disabledState() || this.readonly()) return false;
        const { eventDetails } = createCancelableChangeEventDetails('none', event, this.element);
        this.onCheckedChange.emit({ checked: next, eventDetails });
        if (eventDetails.isCanceled() || event.defaultPrevented) return false;
        if (this.controlledChecked() === undefined) {
            this.checked.set(next);
            this.onChange?.(next);
            this.formUi.markDirty();
        }
        return true;
    }

    /** @ignore Register the optional native checkbox so it owns checked-value serialization. */
    registerNativeInput(input: HTMLInputElement): () => void {
        this.authoredInput.set(input);
        return () => {
            if (this.authoredInput() === input) this.authoredInput.set(null);
        };
    }
}
