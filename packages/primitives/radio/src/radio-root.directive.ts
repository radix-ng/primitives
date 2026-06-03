import { RdxRadioValueChangeReason } from './radio-tokens';
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
import { ControlValueAccessor } from '@angular/forms';
import { RdxCompositeMetadata, RdxCompositeRoot } from '@radix-ng/primitives/composite';
import {
    BooleanInput,
    createCancelableChangeEventDetails,
    createContext,
    provideValueAccessor,
    RdxCancelableChangeEventDetails,
    RdxFormUiControlBase,
    RdxFormUiTouchTarget,
    RdxFormValueControl
} from '@radix-ng/primitives/core';

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
    select(value: string | null, event?: Event, reason?: RdxRadioValueChangeReason): void;
    setArrowNavigation(value: boolean): void;
    isArrowNavigation(): boolean;
}

const rootContext = (): RadioRootContext => {
    const root = inject(RdxRadioGroupDirective);

    return {
        value: root.value,
        disabledState: root.disabledState,
        readonly: root.readonly,
        required: root.required,
        name: root.name,
        form: root.form,
        select: (value, event, reason) => root.select(value, event, reason),
        setArrowNavigation: (value) => root.setArrowNavigation(value),
        isArrowNavigation: () => root.isArrowNavigation()
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
        '[attr.aria-invalid]': 'invalidState() ? "true" : undefined',
        '[attr.data-disabled]': 'disabledState() ? "" : undefined',
        '[attr.data-invalid]': 'invalidState() ? "" : undefined',
        '[attr.data-valid]': 'invalidState() ? undefined : ""',
        '[attr.data-touched]': 'touchedState() ? "" : undefined',
        '[attr.data-dirty]': 'dirtyState() ? "" : undefined',
        '(focusout)': 'onFocusOut($event)'
    }
})
export class RdxRadioGroupDirective
    extends RdxFormUiControlBase
    implements ControlValueAccessor, RdxFormValueControl<string | null>
{
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly compositeRoot = inject(RdxCompositeRoot, { self: true });

    /**
     * The selected value. Deliberately typed as `string` (not Base UI's generic `Value`):
     * a radio group maps onto native radio inputs whose form value is a string, so values are
     * the option identifiers. Use the string key of your option as the value.
     */
    readonly value = model<string | null>(null);

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
    private readonly arrowNavigation = signal(false);
    private readonly itemMetadata = computed(() =>
        Array.from(this.compositeRoot.itemMap().values()).filter(isRadioItemMetadata)
    );
    private readonly disabledIndices = computed(() =>
        this.itemMetadata()
            .filter((metadata) => metadata.disabled)
            .map((metadata) => metadata.index)
    );
    private readonly activeIndex = computed(() => {
        const value = this.value();
        if (value === null) {
            return -1;
        }

        return this.itemMetadata().find((metadata) => metadata.value === value)?.index ?? -1;
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

        let hasAppliedDefault = false;
        effect(() => {
            const defaultValue = this.defaultValue();
            if (hasAppliedDefault || defaultValue === undefined) {
                return;
            }

            hasAppliedDefault = true;
            if (untracked(this.value) === null) {
                this.value.set(defaultValue);
            }
        });

        effect(() => {
            this.compositeRoot.setEnableHomeAndEndKeys(false);
            this.compositeRoot.setModifierKeys(['Shift']);
        });

        effect(() => {
            this.compositeRoot.setDisabledIndices(this.disabledIndices());
        });

        effect(() => {
            const activeIndex = this.activeIndex();

            if (activeIndex === -1 || this.disabledIndices().includes(activeIndex)) {
                return;
            }

            const activeElement = this.elementRef.nativeElement.ownerDocument.activeElement;
            if (activeElement && this.elementRef.nativeElement.contains(activeElement)) {
                return;
            }

            this.compositeRoot.setHighlightedIndex(activeIndex);
        });
    }

    /**
     * Select a radio item.
     * @param value The value of the radio item to select.
     * @ignore
     */
    select(value: string | null, event?: Event, reason: RdxRadioValueChangeReason = 'none'): void {
        if (this.disabledState() || this.readonly() || this.value() === value) {
            return;
        }

        if (value !== null) {
            const trigger = event?.currentTarget instanceof HTMLElement ? event.currentTarget : undefined;
            const { eventDetails } = createCancelableChangeEventDetails(
                reason,
                event ?? new Event('radio.value-change'),
                trigger
            );
            this.onValueChange.emit({ value, eventDetails });
            if (eventDetails.isCanceled()) {
                return;
            }
        }

        this.value.set(value);
        this.formUi.markDirty();
        this.onChange?.(value);
        this.onTouched();
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
        this.value.set(value);
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

    setArrowNavigation(value: boolean): void {
        this.arrowNavigation.set(value);
    }

    isArrowNavigation(): boolean {
        return this.arrowNavigation();
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

interface RdxRadioItemMetadata {
    [key: string]: unknown;
    disabled: boolean;
    value: string;
}

function isRadioItemMetadata(metadata: RdxCompositeMetadata): metadata is RdxCompositeMetadata<RdxRadioItemMetadata> {
    return typeof metadata['disabled'] === 'boolean' && typeof metadata['value'] === 'string';
}
