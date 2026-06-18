import { booleanAttribute, computed, Directive, effect, inject, input, model, output, signal } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { RdxCompositeMetadata, RdxCompositeRoot } from '@radix-ng/primitives/composite';
import {
    BooleanInput,
    createCancelableChangeEventDetails,
    provideValueAccessor,
    RdxCancelableChangeEventDetails,
    RdxFormValueControl
} from '@radix-ng/primitives/core';
import { RadioGroupDirective, RadioGroupProps, RDX_RADIO_GROUP, RdxRadioValueChangeReason } from './radio-tokens';

export type { RdxRadioValueChangeReason } from './radio-tokens';

export type RdxRadioValueChangeEventDetails = RdxCancelableChangeEventDetails<RdxRadioValueChangeReason>;

export interface RdxRadioValueChangeEvent {
    value: string;
    eventDetails: RdxRadioValueChangeEventDetails;
}

@Directive({
    selector: '[rdxRadioRoot]',
    exportAs: 'rdxRadioRoot',
    providers: [
        provideValueAccessor(RdxRadioGroupDirective),
        { provide: RDX_RADIO_GROUP, useExisting: RdxRadioGroupDirective }
    ],
    hostDirectives: [RdxCompositeRoot],
    host: {
        role: 'radiogroup',
        '[attr.aria-required]': 'required() ? "true" : undefined',
        '[attr.aria-disabled]': 'disabledState() ? "true" : undefined',
        '[attr.aria-readonly]': 'readonly() ? "true" : undefined',
        '[attr.data-disabled]': 'disabledState() ? "" : undefined',
        '[attr.data-readonly]': 'readonly() ? "" : undefined',
        '[attr.data-required]': 'required() ? "" : undefined',
        '(keydown)': 'onKeydown()'
    }
})
export class RdxRadioGroupDirective
    implements RadioGroupProps, RadioGroupDirective, ControlValueAccessor, RdxFormValueControl<string | null>
{
    private readonly compositeRoot = inject(RdxCompositeRoot, { self: true });

    readonly value = model<string | null>(null);

    readonly defaultValue = input<string>();

    readonly name = input<string>();

    readonly form = input<string>();

    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly readonly = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly required = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Event handler called when the value changes.
     */
    readonly onValueChange = output<RdxRadioValueChangeEvent>();

    private readonly disable = signal<boolean>(this.disabled());
    readonly disabledState = computed(() => this.disable() || this.disabled());
    private readonly arrowNavigation = signal(false);
    private readonly itemMetadata = computed(() =>
        Array.from(this.compositeRoot.itemMap().values()).filter(isRadioItemMetadata)
    );
    private readonly disabledIndices = computed(() =>
        this.itemMetadata()
            .filter((metadata) => metadata.disabled)
            .map((metadata) => metadata.index)
    );

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
        effect(() => {
            if (this.value() === null && this.defaultValue() !== undefined) {
                this.value.set(this.defaultValue()!);
            }
        });

        effect(() => {
            this.compositeRoot.setEnableHomeAndEndKeys(false);
            this.compositeRoot.setModifierKeys(['Shift']);
        });

        effect(() => {
            this.compositeRoot.setDisabledIndices(this.disabledIndices());
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
        this.onChange?.(value);
        this.onTouched();
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

    protected onKeydown(): void {
        if (this.disabledState()) return;
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
