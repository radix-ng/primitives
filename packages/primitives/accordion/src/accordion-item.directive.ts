import {
    booleanAttribute,
    computed,
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
import { BooleanInput, createContext } from '@radix-ng/primitives/core';
import { injectAccordionRootContext } from './accordion-root.directive';

export type RdxAccordionItemState = 'open' | 'closed';

export type AccordionItemContext = {
    open: Signal<boolean>;
    disabled: Signal<boolean>;
    triggerId: WritableSignal<string>;
    dataState: Signal<RdxAccordionItemState>;
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
        dataState: instance.dataState,
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
        }
    ],
    host: {
        '[attr.data-orientation]': 'rootContext.orientation()',
        '[attr.data-disabled]': 'isDisabled() ? "" : undefined',
        '[attr.data-state]': 'dataState()',
        '[attr.data-index]': 'index()'
    }
})
export class RdxAccordionItemDirective {
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    private readonly collapsibleContext = injectCollapsibleRootContext();

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
     * Event handler called when the panel open state changes.
     * @group Emits
     */
    readonly onOpenChange = output<boolean>();

    readonly isDisabled = computed(() => {
        return this.rootContext.disabled() || this.disabled();
    });

    readonly open = computed(() => {
        const rootValue = this.rootContext.value();

        return this.rootContext.isSingle()
            ? this.value() === rootValue
            : Array.isArray(rootValue) && rootValue.includes(this.value()!);
    });

    readonly dataState = computed((): RdxAccordionItemState => (this.open() ? 'open' : 'closed'));

    /** Set by the trigger; links the content's `aria-labelledby` to the trigger `id`. */
    readonly triggerId = signal('');

    readonly index = computed(() => {
        const allItems = Array.from(this.rootContext.elementRef.nativeElement.querySelectorAll('[rdxAccordionItem]'));
        return allItems.indexOf(this.elementRef.nativeElement);
    });

    constructor() {
        // Collapsed accordion panels stay findable by the browser's in-page search; opening one
        // via find-in-page expands the item. (The standalone Collapsible defaults to plain `hidden`.)
        this.collapsibleContext.hiddenUntilFound.set(true);

        effect(() => {
            this.updateOpen();
        });

        effect(() => {
            this.collapsibleContext.keepMounted.set(this.rootContext.keepMounted());
        });

        let initialized = false;
        effect(() => {
            const isOpen = this.open();
            if (!initialized) {
                initialized = true;
                return;
            }
            this.onOpenChange.emit(isOpen);
        });
    }

    updateOpen = () => {
        this.collapsibleContext.open.set(this.open());
    };
}
