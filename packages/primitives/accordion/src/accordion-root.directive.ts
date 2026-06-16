import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    model,
    ModelSignal,
    output,
    Signal
} from '@angular/core';
import {
    AcceptableValue,
    BooleanInput,
    createContext,
    DataOrientation,
    Direction,
    injectId
} from '@radix-ng/primitives/core';
import { injectDirection } from '@radix-ng/primitives/direction-provider';

export type AccordionRootContext = {
    disabled: InputSignalWithTransform<boolean, BooleanInput>;
    direction: Signal<Direction>;
    orientation: InputSignal<DataOrientation>;
    value: ModelSignal<AcceptableValue | AcceptableValue[] | undefined>;
    collapsible: Signal<boolean>;
    isSingle: Signal<boolean>;
    loopFocus: InputSignalWithTransform<boolean, BooleanInput>;
    keepMounted: InputSignalWithTransform<boolean, BooleanInput>;
    elementRef: ElementRef<HTMLElement>;
    changeModelValue: (value: string) => void;
};

export const [injectAccordionRootContext, provideAccordionRootContext] = createContext<AccordionRootContext>(
    'AccordionRootContext',
    'components/accordion'
);

const rootContext = (): AccordionRootContext => {
    const instance = inject(RdxAccordionRootDirective);

    return {
        disabled: instance.disabled,
        direction: instance.dir,
        collapsible: instance.collapsible,
        orientation: instance.orientation,
        elementRef: instance.elementRef,
        value: instance.value,
        isSingle: instance.isSingle,
        loopFocus: instance.loopFocus,
        keepMounted: instance.keepMounted,
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
    host: {
        '[attr.data-orientation]': 'orientation()',
        '[attr.data-disabled]': 'disabled() ? "" : undefined'
    }
})
export class RdxAccordionRootDirective {
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    readonly id = input<string>(injectId('rdx-accordion-'));

    /**
     * The reading direction of the accordion when applicable. If omitted, assumes LTR (left-to-right) reading mode.
     *
     * @group Props
     */
    readonly dirInput = input<Direction | undefined>(undefined, { alias: 'dir' });
    readonly dir: Signal<Direction> = injectDirection(this.dirInput);

    /** Whether the Accordion is disabled.
     * @defaultValue false
     * @group Props
     */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * The orientation of the accordion.
     *
     * @defaultValue 'vertical'
     * @group Props
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
     * When type is "single", allows closing content when clicking trigger for an open item.
     * When type is "multiple", this prop has no effect.
     *
     * @defaultValue false
     * @group Props
     */
    readonly collapsible = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Determines whether a "single" or "multiple" items can be selected at a time.
     *
     * @defaultValue 'single'
     * @group Props
     */
    readonly type = input<'multiple' | 'single'>('single');

    /**
     * Allow multiple panels to be open simultaneously.
     * Takes precedence over `type` when `true`.
     *
     * @defaultValue false
     * @group Props
     */
    readonly multiple = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Whether keyboard focus wraps from the last item to the first and vice versa.
     *
     * @defaultValue true
     * @group Props
     */
    readonly loopFocus = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

    /**
     * Whether to keep the content of collapsed items mounted in the DOM.
     * When `true`, closed panels keep their element in the DOM instead of
     * receiving a `hidden` attribute. Applies to the always-mounted
     * `rdxAccordionContent`; the `rdxAccordionContentPresence` variant always
     * unmounts.
     *
     * @defaultValue false
     * @group Props
     */
    readonly keepMounted = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Event handler called when the expanded state of an item changes.
     * @group Emits
     */
    readonly onValueChange = output<AcceptableValue | AcceptableValue[] | undefined>();

    readonly isSingle = computed(() => !this.multiple() && this.type() !== 'multiple');

    constructor() {
        effect(() => {
            if (this.defaultValue() !== undefined) {
                this.value.set(this.defaultValue());
            }
        });
    }

    changeModelValue = (newValue: string) => {
        if (this.isSingle()) {
            this.value.set(this.isEqual(newValue, this.value()) ? undefined : newValue);
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

            this.value.set(modelValueArray);
        }

        this.onValueChange.emit(this.value());
    };

    private isValueEqualOrExist(arr: AcceptableValue[], value: AcceptableValue): boolean {
        return arr.some((item) => this.isEqual(item, value));
    }

    private isEqual(a: any, b: any): boolean {
        return JSON.stringify(a) === JSON.stringify(b);
    }
}
