import { booleanAttribute, Directive, effect, inject, input, model, output, signal, Signal } from '@angular/core';
import {
    BooleanInput,
    createCancelableChangeEventDetails,
    createContext,
    RdxCancelableChangeEventDetails
} from '@radix-ng/primitives/core';
import { provideRdxMenuGroupContext, RdxMenuGroupContext } from './menu-group-context';

export interface RdxMenuRadioGroupContext<T = unknown> {
    value: Signal<T | undefined>;
    disabled: Signal<boolean>;
    selectValue: (value: T, event?: Event) => void;
}

/** Payload of {@link RdxMenuRadioGroup.onValueChange} — cancelable via `eventDetails.cancel()`. */
export interface RdxMenuRadioGroupValueChangeEvent<T = unknown> {
    value: T;
    eventDetails: RdxCancelableChangeEventDetails<'none'>;
}

export const [injectRdxMenuRadioGroupContext, provideRdxMenuRadioGroupContext] =
    createContext<RdxMenuRadioGroupContext>('RdxMenuRadioGroupContext', 'components/menu');

const radioGroupContextFactory = (): RdxMenuRadioGroupContext => {
    const instance = inject(RdxMenuRadioGroup);
    return {
        value: instance.value,
        disabled: instance.disabled,
        selectValue: (v) => instance.selectValue(v)
    };
};

const groupContextFactory = (): RdxMenuGroupContext => {
    const instance = inject(RdxMenuRadioGroup);
    return { labelId: instance.labelId };
};

/**
 * Groups radio items in a menu.
 */
@Directive({
    selector: '[rdxMenuRadioGroup]',
    exportAs: 'rdxMenuRadioGroup',
    providers: [
        provideRdxMenuRadioGroupContext(radioGroupContextFactory),
        provideRdxMenuGroupContext(groupContextFactory)
    ],
    host: {
        role: 'group',
        '[attr.aria-labelledby]': 'labelId()',
        '[attr.data-disabled]': 'disabled() ? "" : undefined'
    }
})
export class RdxMenuRadioGroup<T = unknown> {
    private hasAppliedDefaultValue = false;

    /**
     * The currently selected value.
     */
    readonly value = model<T | undefined>(undefined);

    /** The initially selected value for uncontrolled usage. */
    readonly defaultValue = input<T | undefined>(undefined);

    /** Whether all radio items in the group are disabled. */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Emits before the selected value changes; call `eventDetails.cancel()` to veto it.
     */
    readonly onValueChange = output<RdxMenuRadioGroupValueChangeEvent<T>>();

    readonly labelId = signal<string | undefined>(undefined);

    constructor() {
        effect(() => {
            const defaultValue = this.defaultValue();
            if (!this.hasAppliedDefaultValue && defaultValue !== undefined) {
                this.hasAppliedDefaultValue = true;
                this.value.set(defaultValue);
            }
        });
    }

    selectValue(newValue: T, event?: Event): void {
        if (this.disabled()) {
            return;
        }
        const { eventDetails } = createCancelableChangeEventDetails('none', event ?? new Event('menu.value-change'));
        this.onValueChange.emit({ value: newValue, eventDetails });

        if (eventDetails.isCanceled()) {
            return;
        }

        this.value.set(newValue);
    }
}
