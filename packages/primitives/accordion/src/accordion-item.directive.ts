import { injectAccordionRootContext, RdxAccordionValueChangeEventDetails } from './accordion-root.directive';
import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    output,
    Signal,
    signal,
    WritableSignal
} from '@angular/core';
import { injectCollapsibleRootContext, RdxCollapsibleRootDirective } from '@radix-ng/primitives/collapsible';
import { RdxCompositeListItem } from '@radix-ng/primitives/composite';
import { BooleanInput, createCancelableChangeEventDetails, createContext } from '@radix-ng/primitives/core';

/** Payload of {@link RdxAccordionItemDirective.onOpenChange}, mirroring Base UI's `(open, eventDetails)`. */
export interface RdxAccordionItemOpenChangeEvent {
    open: boolean;
    eventDetails: RdxAccordionValueChangeEventDetails;
}

export type AccordionItemContext = {
    open: Signal<boolean>;
    disabled: Signal<boolean>;
    triggerId: WritableSignal<string>;
    dataDisabled: Signal<boolean>;
    currentElement: ElementRef<HTMLElement>;
    value: Signal<string | undefined>;
    updateOpen: () => void;
    index: Signal<number>;
};

export const [injectAccordionItemContext, provideAccordionItemContext] = createContext<AccordionItemContext>(
    'AccordionItemContext',
    'components/accordion'
);

const itemContext = (): AccordionItemContext => {
    const instance = inject(RdxAccordionItemDirective);

    return {
        open: instance.open,
        disabled: instance.disabled,
        dataDisabled: instance.isDisabled,
        triggerId: instance.triggerId,
        currentElement: instance.elementRef,
        value: computed(() => instance.value()),
        updateOpen: instance.updateOpen,
        index: instance.index
    };
};

/**
 * @group Components
 */
@Directive({
    selector: '[rdxAccordionItem]',
    exportAs: 'rdxAccordionItem',
    providers: [provideAccordionItemContext(itemContext)],
    hostDirectives: [
        {
            directive: RdxCollapsibleRootDirective,
            inputs: ['disabled: disabled', 'open: open']
        },
        RdxCompositeListItem
    ],
    host: {
        '[attr.data-disabled]': 'isDisabled() ? "" : undefined',
        '[attr.data-open]': 'open() ? "" : undefined',
        '[attr.data-index]': 'index()'
    }
})
export class RdxAccordionItemDirective {
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    private readonly collapsibleContext = injectCollapsibleRootContext();
    private readonly listItem = inject(RdxCompositeListItem, { self: true });

    protected readonly rootContext = injectAccordionRootContext();

    /**
     * A string value for the accordion item. All items within an accordion should use a unique value.
     * @group Props
     */
    readonly value = input<string>();

    /**
     * Whether or not an accordion item is disabled from user interaction.
     * When `true`, prevents the user from interacting with the item.
     * @group Props
     */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Event handler called when the panel open state changes. Emits `{ open, eventDetails }`
     * (Base UI parity).
     * @group Emits
     */
    readonly onOpenChange = output<RdxAccordionItemOpenChangeEvent>();

    readonly isDisabled = computed(() => {
        return this.rootContext.disabled() || this.disabled();
    });

    readonly open = computed(() => {
        const rootValue = this.rootContext.value();

        return this.rootContext.isSingle()
            ? this.value() === rootValue
            : Array.isArray(rootValue) && rootValue.includes(this.value()!);
    });

    /** Set by the trigger; links the content's `aria-labelledby` to the trigger `id`. */
    readonly triggerId = signal('');

    readonly index = this.listItem.index;

    constructor() {
        effect(() => {
            this.updateOpen();
        });

        // Forward the accordion-level mount controls onto the composed collapsible panel.
        effect(() => {
            this.collapsibleContext.keepMounted.set(this.rootContext.keepMounted());
        });
        effect(() => {
            this.collapsibleContext.hiddenUntilFound.set(this.rootContext.hiddenUntilFound());
        });

        let initialized = false;
        effect(() => {
            const isOpen = this.open();
            if (!initialized) {
                initialized = true;
                return;
            }
            const { eventDetails } = createCancelableChangeEventDetails('none', new Event('change'));
            this.onOpenChange.emit({ open: isOpen, eventDetails });
        });
    }

    updateOpen = () => {
        this.collapsibleContext.open.set(this.open());
    };
}
