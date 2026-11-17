import {
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    output,
    signal,
    Signal,
    WritableSignal
} from '@angular/core';
import { injectCollapsibleRootContext, RdxCollapsibleRootDirective } from '@radix-ng/primitives/collapsible';
import { RdxCompositeListItem } from '@radix-ng/primitives/composite';
import { BooleanInput, createCancelableChangeEventDetails, createContext, injectId } from '@radix-ng/primitives/core';
import { injectAccordionRootContext, RdxAccordionValueChangeEventDetails } from './accordion-root.directive';

/** Payload of {@link RdxAccordionItemDirective.onOpenChange}, mirroring Base UI's `(open, eventDetails)`. */
export interface RdxAccordionItemOpenChangeEvent {
    open: boolean;
    eventDetails: RdxAccordionValueChangeEventDetails;
}

export type AccordionItemContext = {
    open: Signal<boolean>;
    disabled: Signal<boolean>;
    triggerId: WritableSignal<string | undefined>;
    dataDisabled: Signal<boolean>;
    currentElement: ElementRef<HTMLElement>;
    value: Signal<unknown>;
    hidden: Signal<boolean>;
    requestOpen: (
        open: boolean,
        reason: RdxAccordionValueChangeEventDetails['reason'],
        event: Event,
        trigger?: HTMLElement
    ) => boolean;
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
        value: instance.resolvedValue,
        hidden: instance.hidden,
        requestOpen: instance.requestOpen,
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
    hostDirectives: [RdxCollapsibleRootDirective, RdxCompositeListItem],
    host: {
        '[attr.data-disabled]': 'isDisabled() ? "" : undefined',
        '[attr.data-open]': 'open() ? "" : undefined',
        '[attr.data-index]': 'index()',
        '[attr.data-orientation]': 'rootContext.orientation()',
        '[attr.data-hidden]': 'hidden() ? "" : undefined'
    }
})
export class RdxAccordionItemDirective {
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    private readonly collapsibleContext = injectCollapsibleRootContext();
    private readonly listItem = inject(RdxCompositeListItem, { self: true });

    protected readonly rootContext = injectAccordionRootContext();

    /**
     * A unique value for this item. Values use reference/value identity.
     * Omitted or nullish values receive a stable generated identity.
     * @group Props
     */
    readonly value = input<unknown>();

    private readonly fallbackValue = injectId('rdx-accordion-item-');
    readonly resolvedValue = computed(() => this.value() ?? this.fallbackValue);

    /**
     * Whether or not an accordion item is disabled from user interaction.
     * When `true`, prevents the user from interacting with the item.
     * @group Props
     */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Cancelable request emitted before Root onValueChange and before commit.
     * External value changes and sibling closure do not emit a request.
     * @group Emits
     */
    readonly onOpenChange = output<RdxAccordionItemOpenChangeEvent>();

    readonly isDisabled = computed(() => {
        return this.rootContext.disabled() || this.disabled();
    });

    readonly open = computed(() => this.rootContext.value().includes(this.resolvedValue()));
    readonly hidden = computed(() => !this.open() && !this.collapsibleContext.mounted());

    /** Registered Trigger identity; cleared when the part is destroyed. */
    readonly triggerId = signal<string | undefined>(undefined);

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

        const unregister = this.collapsibleContext.registerOpenRequestHandler(this.requestOpen);
        inject(DestroyRef).onDestroy(unregister);
    }

    requestOpen = (
        open: boolean,
        reason: RdxAccordionValueChangeEventDetails['reason'],
        event: Event,
        trigger?: HTMLElement
    ): boolean => {
        if (open === this.open()) return true;
        const { eventDetails } = createCancelableChangeEventDetails(reason, event, trigger);
        this.onOpenChange.emit({ open, eventDetails });
        if (eventDetails.isCanceled()) return false;
        this.rootContext.requestValue(this.resolvedValue(), open, eventDetails);
        return !eventDetails.isCanceled() && this.open() === open;
    };

    updateOpen = () => {
        this.collapsibleContext.open.set(this.open());
    };
}
