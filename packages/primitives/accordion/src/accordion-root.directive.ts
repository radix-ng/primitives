import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    model,
    ModelSignal,
    output,
    Signal
} from '@angular/core';
import { RdxCompositeList } from '@radix-ng/primitives/composite';
import {
    AcceptableValue,
    BooleanInput,
    createCancelableChangeEventDetails,
    createContext,
    DataOrientation,
    RdxCancelableChangeEventDetails
} from '@radix-ng/primitives/core';

/** The reason an accordion value change was requested. */
export type RdxAccordionValueChangeReason = 'trigger-press' | 'none';
export type RdxAccordionValueChangeEventDetails = RdxCancelableChangeEventDetails<RdxAccordionValueChangeReason>;

/** Payload of {@link RdxAccordionRootDirective.onValueChange}, mirroring Base UI's `(value, eventDetails)`. */
export interface RdxAccordionValueChangeEvent {
    value: AcceptableValue | AcceptableValue[] | undefined;
    eventDetails: RdxAccordionValueChangeEventDetails;
}

export type AccordionRootContext = {
    disabled: InputSignalWithTransform<boolean, BooleanInput>;
    orientation: InputSignal<DataOrientation>;
    value: ModelSignal<AcceptableValue | AcceptableValue[] | undefined>;
    isSingle: Signal<boolean>;
    keepMounted: InputSignalWithTransform<boolean, BooleanInput>;
    hiddenUntilFound: InputSignalWithTransform<boolean, BooleanInput>;
    changeModelValue: (value: string, event?: Event) => void;
};

export const [injectAccordionRootContext, provideAccordionRootContext] = createContext<AccordionRootContext>(
    'AccordionRootContext',
    'components/accordion'
);

const rootContext = (): AccordionRootContext => {
    const instance = inject(RdxAccordionRootDirective);

    return {
        disabled: instance.disabled,
        orientation: instance.orientation,
        value: instance.value,
        isSingle: instance.isSingle,
        keepMounted: instance.keepMounted,
        hiddenUntilFound: instance.hiddenUntilFound,
        changeModelValue: instance.changeModelValue
    };
};

/**
 * @group Components
 */
@Directive({
    selector: '[rdxAccordionRoot]',
    exportAs: 'rdxAccordionRoot',
    providers: [provideAccordionRootContext(rootContext)],
    hostDirectives: [RdxCompositeList],
    host: {
        '[attr.data-orientation]': 'orientation()',
        '[attr.data-disabled]': 'disabled() ? "" : undefined'
    }
})
export class RdxAccordionRootDirective {
    /** Whether the Accordion is disabled.
     * @defaultValue false
     * @group Props
     */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * The orientation of the accordion.
     *
     * Deprecated following the APG guidance update to remove roving focus.
     * This prop no longer affects keyboard focus behavior.
     *
     * @defaultValue 'vertical'
     * @group Props
     * @deprecated
     */
    readonly orientation = input<DataOrientation>('vertical');

    /**
     * The default active value of the item(s).
     *
     * Use when you do not need to control the state of the item(s).
     * @group Props
     */
    readonly defaultValue = input<string | string[]>();

    /**
     * The controlled value of the item to expand.
     *
     * @group Props
     */
    readonly value = model<AcceptableValue | AcceptableValue[]>();

    /**
     * Allow multiple panels to be open simultaneously. In single mode an open item can always be
     * closed by clicking its trigger again (Base UI parity — there is no separate `collapsible`).
     *
     * @defaultValue false
     * @group Props
     */
    readonly multiple = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Deprecated following the APG guidance update to remove roving focus.
     * This prop no longer affects keyboard focus behavior.
     *
     * @defaultValue true
     * @group Props
     * @deprecated
     */
    readonly loopFocus = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

    /**
     * Whether to keep the content of collapsed items mounted in the DOM.
     * When `true`, closed panels keep their element in the DOM while hidden.
     *
     * @defaultValue false
     * @group Props
     */
    readonly keepMounted = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Allow collapsed panels to remain mounted (but hidden) so the browser's in-page search
     * can find and reveal them. Mirrors Base UI's `hiddenUntilFound`.
     *
     * @defaultValue false
     * @group Props
     */
    readonly hiddenUntilFound = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Event handler called when the expanded value changes. Emits the next value plus a cancelable
     * `eventDetails` (Base UI parity); call `eventDetails.cancel()` to reject the change.
     * @group Emits
     */
    readonly onValueChange = output<RdxAccordionValueChangeEvent>();

    readonly isSingle = computed(() => !this.multiple());

    constructor() {
        effect(() => {
            if (this.defaultValue() !== undefined) {
                this.value.set(this.defaultValue());
            }
        });
    }

    changeModelValue = (newValue: string, event?: Event) => {
        let nextValue: AcceptableValue | AcceptableValue[] | undefined;

        if (this.isSingle()) {
            nextValue = this.isEqual(newValue, this.value()) ? undefined : newValue;
        } else {
            const currentValue = this.value();
            let modelValueArray: AcceptableValue[] = [];

            if (Array.isArray(currentValue)) {
                modelValueArray = [...currentValue];
            } else if (currentValue !== undefined && currentValue !== null) {
                modelValueArray = [currentValue];
            }

            if (this.isValueEqualOrExist(modelValueArray, newValue)) {
                const index = modelValueArray.findIndex((item) => this.isEqual(item, newValue));
                if (index !== -1) {
                    modelValueArray.splice(index, 1);
                }
            } else {
                modelValueArray.push(newValue);
            }

            nextValue = modelValueArray;
        }

        const { eventDetails } = createCancelableChangeEventDetails<RdxAccordionValueChangeReason>(
            event ? 'trigger-press' : 'none',
            event ?? new Event('change')
        );

        this.onValueChange.emit({ value: nextValue, eventDetails });

        if (eventDetails.isCanceled()) {
            return;
        }

        this.value.set(nextValue);
    };

    private isValueEqualOrExist(arr: AcceptableValue[], value: AcceptableValue): boolean {
        return arr.some((item) => this.isEqual(item, value));
    }

    private isEqual(a: unknown, b: unknown): boolean {
        return JSON.stringify(a) === JSON.stringify(b);
    }
}
