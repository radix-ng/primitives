import { _IdGenerator } from '@angular/cdk/a11y';
import { Direction } from '@angular/cdk/bidi';
import { BooleanInput } from '@angular/cdk/coercion';
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
import { createContext, DataOrientation } from '@radix-ng/primitives/core';

export type AccordionRootContext = {
    disabled: InputSignalWithTransform<boolean, BooleanInput>;
    direction: InputSignal<Direction>;
    orientation: InputSignal<DataOrientation>;
    value: ModelSignal<string | string[] | undefined>;
    collapsible: Signal<boolean>;
    isSingle: Signal<boolean>;
    elementRef: ElementRef<HTMLElement>;
    changeModelValue: (value: string, isOpen: boolean) => void;
    isItemOpen: (value: string) => boolean;
};

export const [injectAccordionRootContext, provideAccordionRootContext] =
    createContext<AccordionRootContext>('AccordionRootContext');

const rootContext = (): AccordionRootContext => {
    const instance = inject(RdxAccordionRootDirective);

    return {
        disabled: instance.disabled,
        direction: instance.dir,
        collapsible: instance.isCollapsible,
        orientation: instance.orientation,
        elementRef: instance.elementRef,
        value: instance.value,
        isSingle: instance.isSingle,
        changeModelValue: instance.changeModelValue,
        isItemOpen: instance.isItemOpen
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
        '[attr.data-orientation]': 'orientation()'
    }
})
export class RdxAccordionRootDirective {
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    readonly id = input<string>(inject(_IdGenerator).getId('rdx-accordion-'));

    readonly dir = input<Direction>('ltr');

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

    readonly defaultValue = input<string | string[]>();

    /**
     * The controlled value of the item to expand.
     *
     * @group Props
     */
    readonly value = model<string | string[]>();

    readonly collapsible = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly type = input<'multiple' | 'single'>('single');

    /**
     * Event handler called when the expanded state of an item changes and type is "multiple".
     * @group Emits
     */
    readonly onValueChange = output();

    readonly isCollapsible = computed(() => {
        return this.collapsible();
    });

    readonly isSingle = computed(() => this.type() === 'single');

    constructor() {
        effect(() => {
            if (this.defaultValue() !== undefined) {
                this.value.set(this.defaultValue());
            }
        });
    }

    changeModelValue = (value: string, isOpen: boolean) => {
        if (!isOpen && !this.isCollapsible()) {
            return;
        }

        if (this.type() === 'multiple') {
            this.value.update((v) => {
                if (Array.isArray(v)) {
                    return isOpen ? [...v, value] : v.filter((i) => i !== value);
                }
                return isOpen ? [value] : [];
            });
        } else {
            if (isOpen) {
                this.value.set(value);
            }
        }
    };

    isItemOpen = (value: string) => {
        if (this.type() == 'multiple') {
            return !!this.value()?.includes(value);
        }

        return this.value() === value;
    };
}
