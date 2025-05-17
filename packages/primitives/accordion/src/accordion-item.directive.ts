import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, effect, ElementRef, inject, input, Signal } from '@angular/core';
import { injectCollapsibleRootContext, RdxCollapsibleRootDirective } from '@radix-ng/primitives/collapsible';
import { createContext, useArrowNavigation } from '@radix-ng/primitives/core';
import { injectAccordionRootContext } from './accordion-root.directive';

export type RdxAccordionItemState = 'open' | 'closed';

export type AccordionItemContext = {
    open: Signal<boolean>;
    disabled: Signal<boolean>;
    triggerId: string;
    dataState: Signal<RdxAccordionItemState>;
    dataDisabled: Signal<boolean>;
    currentElement: ElementRef<HTMLElement>;
    value: Signal<string | undefined>;
    updateOpen: () => void;
};

export const [injectAccordionItemContext, provideAccordionItemContext] =
    createContext<AccordionItemContext>('AccordionItemContext');

const itemContext = (): AccordionItemContext => {
    const instance = inject(RdxAccordionItemDirective);

    return {
        open: instance.open,
        dataState: instance.dataState,
        disabled: instance.disabled,
        dataDisabled: instance.isDisabled,
        triggerId: '',
        currentElement: instance.elementRef,
        value: computed(() => instance.value()),
        updateOpen: instance.updateOpen
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
        '[attr.data-disabled]': 'disabled() ? "" : undefined',
        '[attr.data-state]': 'dataState()',

        '(keydown.arrowDown)': 'handleArrowKey($event)',
        '(keydown.arrowUp)': 'handleArrowKey($event)',
        '(keydown.arrowLeft)': 'handleArrowKey($event)',
        '(keydown.arrowRight)': 'handleArrowKey($event)',
        '(keydown.home)': 'handleArrowKey($event)',
        '(keydown.end)': 'handleArrowKey($event)'
    }
})
export class RdxAccordionItemDirective {
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    private readonly collapsibleContext = injectCollapsibleRootContext()!;

    protected readonly rootContext = injectAccordionRootContext()!;

    readonly value = input<string>();

    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly isDisabled = computed(() => {
        return this.rootContext.disabled() || this.disabled();
    });

    readonly open = computed(() =>
        this.rootContext.isSingle()
            ? this.value() === this.rootContext.value()
            : Array.isArray(this.rootContext.value()) && this.rootContext.value()!.includes(this.value()!)
    );

    readonly dataState = computed((): RdxAccordionItemState => (this.open() ? 'open' : 'closed'));

    constructor() {
        effect(() => {
            this.updateOpen();
        });
    }

    updateOpen = () => {
        this.collapsibleContext.open.set(this.open());
    };

    handleArrowKey(event: KeyboardEvent) {
        const target = event.target as HTMLElement;
        const allCollectionItems: HTMLElement[] = Array.from(
            this.rootContext.elementRef.nativeElement?.querySelectorAll('[data-rdx-collection-item]') ?? []
        );

        const collectionItemIndex = allCollectionItems.findIndex((item) => item === target);
        if (collectionItemIndex === -1) return;

        useArrowNavigation(
            event,
            this.elementRef.nativeElement.querySelector('[data-rdx-collection-item]')!,
            this.rootContext.elementRef.nativeElement!,
            {
                arrowKeyOptions: this.rootContext.orientation(),
                dir: this.rootContext.direction(),
                focus: true
            }
        );
    }
}
