import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    forwardRef,
    inject,
    InjectionToken,
    input,
    InputSignalWithTransform,
    model,
    ModelSignal,
    output,
    OutputEmitterRef,
    signal
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export const RdxSwitchToken = new InjectionToken<RdxSwitchRootDirective>('RdxSwitchToken');

export function injectSwitch(): RdxSwitchRootDirective {
    return inject(RdxSwitchToken);
}

export const SWITCH_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => RdxSwitchRootDirective),
    multi: true
};

export interface SwitchProps {
    checked?: ModelSignal<boolean>;
    defaultChecked?: InputSignalWithTransform<boolean, BooleanInput>;
    required?: InputSignalWithTransform<boolean, BooleanInput>;
    onCheckedChange?: OutputEmitterRef<boolean>;
}

let idIterator = 0;

@Directive({
    selector: 'button[rdxSwitchRoot]',
    exportAs: 'rdxSwitchRoot',
    standalone: true,
    providers: [
        { provide: RdxSwitchToken, useExisting: RdxSwitchRootDirective },
        SWITCH_VALUE_ACCESSOR
    ],
    host: {
        type: 'button',
        '[id]': 'elementId()',
        '[attr.aria-checked]': 'checkedState()',
        '[attr.aria-required]': 'required()',
        '[attr.data-state]': 'checkedState() ? "checked" : "unchecked"',
        '[attr.data-disabled]': 'disabledState() ? "true" : null',
        '[attr.disabled]': 'disabledState() ? disabledState() : null',

        '(click)': 'toggle()'
    }
})
export class RdxSwitchRootDirective implements SwitchProps, ControlValueAccessor {
    readonly id = input<string | null>(`rdx-switch-${idIterator++}`);

    protected readonly elementId = computed(() => (this.id() ? this.id() : null));

    readonly inputId = input<string | null>(null);

    /**
     * When true, indicates that the user must check the switch before the owning form can be submitted.
     */
    readonly required = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute
    });

    readonly ariaLabelledBy = input<string | null>(null, {
        alias: 'aria-labelledby'
    });

    readonly ariaLabel = input<string | null>(null, {
        alias: 'aria-label'
    });

    /**
     * The controlled state of the switch. Must be used in conjunction with onCheckedChange.
     */
    readonly checked = model<boolean>(false);

    readonly defaultChecked = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * The state of the switch.
     * If `defaultChecked` is provided, it takes precedence over the `checked` state.
     * @ignore
     */
    readonly checkedState = computed(() => this.checked());

    /**
     * When true, prevents the user from interacting with the switch.
     */
    readonly disabled = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute
    });

    /** @ignore */
    readonly disabledState = computed(() => this.disabled() || this.accessorDisabled());

    /**
     * Event handler called when the state of the switch changes.
     */
    readonly onCheckedChange = output<boolean>();

    private readonly defaultCheckedUsed = computed(() => this.defaultChecked());

    constructor() {
        effect(
            () => {
                if (this.defaultCheckedUsed()) {
                    this.checked.set(this.defaultChecked());
                }
            },
            { allowSignalWrites: true }
        );
    }

    /**
     * Toggles the checked state of the switch.
     * If the switch is disabled, the function returns early.
     * @ignore
     */
    toggle(): void {
        if (this.disabledState()) {
            return;
        }

        this.checked.set(!this.checked());

        this.onChange(this.checked());
        this.onCheckedChange.emit(this.checked());
    }

    private readonly accessorDisabled = signal(false);

    private onChange: (value: any) => void = () => {};
    /** @ignore */
    onTouched: (() => void) | undefined;

    /** @ignore */
    writeValue(value: any): void {
        this.checked.set(value);
    }

    /** @ignore */
    registerOnChange(fn: (value: any) => void): void {
        this.onChange = fn;
    }

    /** @ignore */
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    /** @ignore */
    setDisabledState(isDisabled: boolean): void {
        this.accessorDisabled.set(isDisabled);
    }
}
