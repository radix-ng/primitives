import { BooleanInput } from '@angular/cdk/coercion';
import {
    afterNextRender,
    booleanAttribute,
    computed,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    model,
    output,
    signal
} from '@angular/core';
import { RdxFormValueControl } from '@radix-ng/primitives/core';
import { injectFieldRootContext } from '@radix-ng/primitives/field';

let inputId = 0;

const attr = (value: boolean) => (value ? '' : undefined);

export type RdxInputValue = string | number | readonly string[];

export interface RdxInputValueChangeEventDetails {
    event: Event;
    cancel: () => void;
    isCanceled: () => boolean;
}

export interface RdxInputValueChangeEvent {
    value: string;
    eventDetails: RdxInputValueChangeEventDetails;
}

/**
 * A headless text input that can integrate with Field for accessible labeling,
 * descriptions, validation state, and data attributes.
 *
 * @group Components
 */
@Directive({
    selector: 'input[rdxInput]',
    exportAs: 'rdxInput',
    host: {
        '[attr.id]': 'id()',
        '[attr.aria-describedby]': 'describedBy()',
        '[attr.aria-invalid]': 'invalidState() ? "true" : undefined',
        '[attr.aria-required]': 'requiredState() ? "true" : undefined',
        '[attr.aria-disabled]': 'disabledState() ? "true" : undefined',
        '[attr.disabled]': 'disabledState() ? "" : undefined',
        '[attr.required]': 'requiredState() ? "" : undefined',
        '[attr.data-invalid]': 'dataAttr(invalidState())',
        '[attr.data-valid]': 'dataAttr(!invalidState())',
        '[attr.data-disabled]': 'dataAttr(disabledState())',
        '[attr.data-required]': 'dataAttr(requiredState())',
        '[attr.data-filled]': 'dataAttr(filledState())',
        '[attr.data-focused]': 'dataAttr(focusedState())',
        '(focus)': 'onFocus()',
        '(blur)': 'onBlur()',
        '(input)': 'onInput($event)',
        '(change)': 'syncFieldState()'
    }
})
export class RdxInputDirective implements RdxFormValueControl<RdxInputValue | undefined> {
    private readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;
    private readonly fieldRootContext = injectFieldRootContext(true);
    private initialValue = '';
    private defaultValueApplied = false;
    private readonly filledValue = signal(false);
    private readonly focusedValue = signal(false);

    /**
     * The input id. Field labels and descriptions use this value for accessible relationships.
     *
     * @group Props
     */
    readonly id = input(`rdx-input-${inputId++}`);

    /**
     * The controlled input value.
     *
     * @group Props
     */
    readonly value = model<RdxInputValue | undefined>(undefined);

    /**
     * The initial value when the input is uncontrolled.
     *
     * @group Props
     */
    readonly defaultValue = input<RdxInputValue | undefined>(undefined);

    /**
     * Whether the input is disabled.
     *
     * @group Props
     */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Whether the input is required.
     *
     * @group Props
     */
    readonly required = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Whether the input is invalid.
     *
     * @group Props
     */
    readonly invalid = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Emits when the input value changes.
     *
     * @group Emits
     */
    readonly onValueChange = output<RdxInputValueChangeEvent>();

    protected readonly invalidState = computed(() => this.invalid() || Boolean(this.fieldRootContext?.invalidState()));
    protected readonly disabledState = computed(
        () => this.disabled() || Boolean(this.fieldRootContext?.disabledState())
    );
    protected readonly requiredState = computed(
        () => this.required() || Boolean(this.fieldRootContext?.requiredState())
    );
    protected readonly filledState = computed(
        () => this.filledValue() || Boolean(this.fieldRootContext?.filledState())
    );
    protected readonly focusedState = computed(
        () => this.focusedValue() || Boolean(this.fieldRootContext?.focusedState())
    );

    protected readonly describedBy = computed(() => {
        if (!this.fieldRootContext) {
            return undefined;
        }

        const ids = [
            ...this.fieldRootContext.descriptionIds(),
            ...(this.fieldRootContext.invalidState() ? this.fieldRootContext.errorIds() : [])
        ];

        return ids.length ? ids.join(' ') : undefined;
    });

    constructor() {
        effect(() => {
            const value = this.value();

            if (value !== undefined) {
                this.writeValue(value);
            }
        });

        effect(() => {
            const defaultValue = this.defaultValue();

            if (this.value() === undefined && defaultValue !== undefined && !this.defaultValueApplied) {
                this.defaultValueApplied = true;
                this.writeValue(defaultValue);
            }
        });

        effect(() => {
            this.fieldRootContext?.setControlId(this.id());
        });

        afterNextRender(() => {
            this.initialValue = this.element.value;
            this.syncFieldState();
        });
    }

    onFocus(): void {
        this.focusedValue.set(true);
        this.fieldRootContext?.setFocused(true);
    }

    onBlur(): void {
        this.focusedValue.set(false);
        this.fieldRootContext?.setFocused(false);
        this.fieldRootContext?.setTouched(true);
    }

    onInput(event: Event): void {
        const nextValue = this.element.value;
        let canceled = false;

        const eventDetails: RdxInputValueChangeEventDetails = {
            event,
            cancel: () => {
                canceled = true;
            },
            isCanceled: () => canceled
        };

        this.onValueChange.emit({ value: nextValue, eventDetails });

        if (canceled) {
            this.writeValue(this.value() ?? this.defaultValue() ?? '');
            return;
        }

        this.value.set(nextValue);
        this.syncFieldState();
    }

    syncFieldState(): void {
        const value = this.element.value;

        this.filledValue.set(value !== '');
        this.fieldRootContext?.setFilled(value !== '');
        this.fieldRootContext?.setDirty(value !== this.initialValue);
    }

    private writeValue(value: RdxInputValue): void {
        this.element.value = Array.isArray(value) ? value.join(',') : String(value);
        this.syncFieldState();
    }

    protected readonly dataAttr = attr;
}
