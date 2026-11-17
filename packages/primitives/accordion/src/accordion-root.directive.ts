import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    output,
    Signal,
    signal,
    untracked
} from '@angular/core';
import { RdxCompositeList } from '@radix-ng/primitives/composite';
import {
    BooleanInput,
    createContext,
    DataOrientation,
    RdxCancelableChangeEventDetails
} from '@radix-ng/primitives/core';

/** The reason an accordion value change was requested. */
export type RdxAccordionValueChangeReason = 'trigger-press' | 'none';
export type RdxAccordionValueChangeEventDetails = RdxCancelableChangeEventDetails<RdxAccordionValueChangeReason>;

/** Payload of {@link RdxAccordionRootDirective.onValueChange}, mirroring Base UI's `(value, eventDetails)`. */
export interface RdxAccordionValueChangeEvent {
    value: unknown[];
    eventDetails: RdxAccordionValueChangeEventDetails;
}

export type AccordionRootContext = {
    disabled: InputSignalWithTransform<boolean, BooleanInput>;
    orientation: InputSignal<DataOrientation>;
    value: Signal<unknown[]>;
    keepMounted: InputSignalWithTransform<boolean, BooleanInput>;
    hiddenUntilFound: InputSignalWithTransform<boolean, BooleanInput>;
    requestValue: (value: unknown, open: boolean, details: RdxAccordionValueChangeEventDetails) => void;
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
        keepMounted: instance.keepMounted,
        hiddenUntilFound: instance.hiddenUntilFound,
        requestValue: instance.requestValue
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
    readonly defaultValue = input<unknown[]>();

    /**
     * The controlled expanded values, in both single and multiple modes.
     * A defined array owns selection until the parent updates it. Use `[(value)]` for two-way binding.
     *
     * @group Props
     */
    readonly valueInput = input<unknown[] | undefined>(undefined, { alias: 'value' });

    private readonly uncontrolledValue = signal<unknown[]>([]);

    /** Effective expanded values. Uses reference/value membership, including array-valued items. */
    readonly value = computed(() => this.valueInput() ?? this.uncontrolledValue());

    /** Accepted selection requests; supports `[(value)]`. */
    readonly valueChange = output<unknown[]>();

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

    constructor() {
        let initialized = false;
        effect(() => {
            if (initialized) return;
            initialized = true;
            const initialValue = this.defaultValue() ?? [];
            untracked(() => this.uncontrolledValue.set(initialValue));
        });
    }

    /** @internal Item has already emitted its cancelable request with these same details. */
    requestValue = (itemValue: unknown, open: boolean, eventDetails: RdxAccordionValueChangeEventDetails) => {
        const current = this.value();
        const next = !this.multiple()
            ? current[0] === itemValue
                ? []
                : [itemValue]
            : open
              ? [...current, itemValue]
              : current.filter((value) => value !== itemValue);

        this.onValueChange.emit({ value: next, eventDetails });
        if (eventDetails.isCanceled()) return;

        if (this.valueInput() === undefined) this.uncontrolledValue.set(next);
        this.valueChange.emit(next);
    };
}
