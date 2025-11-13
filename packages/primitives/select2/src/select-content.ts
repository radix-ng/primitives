import { afterNextRender, Directive, inject, signal } from '@angular/core';
import { outputFromObservable, outputToObservable } from '@angular/core/rxjs-interop';
import { RdxCollectionProvider, useCollection } from '@radix-ng/primitives/collection';
import { createContext } from '@radix-ng/primitives/core';
import { provideRdxDismissableLayerConfig, RdxDismissableLayer } from '@radix-ng/primitives/dismissable-layer';
import { RdxFocusScope } from '@radix-ng/primitives/focus-scope';
import { focusFirst } from '@radix-ng/primitives/roving-focus';
import { injectSelectRootContext } from './select-root';
import { valueComparator } from './utils';

const context = () => {
    const context = inject(RdxSelectContent);

    return {
        viewport: context.viewport,
        selectedItem: context.selectedItem,
        selectedItemText: context.selectedItemText,
        onViewportChange: (node: any) => {
            context.viewport.set(node);
        },
        onItemLeave: () => {},
        itemRefCallback: (node: any, value: any, disabled: boolean) => {
            const isFirstValidItem = !context.firstValidItemFoundRef() && !disabled;
            const isSelectedItem = valueComparator(context.rootContext.value(), value, context.rootContext.by());

            if (isSelectedItem || isFirstValidItem) {
                context.selectedItem.set(node);
            }

            if (isFirstValidItem) {
                context.firstValidItemFoundRef.set(true);
            }
        },
        itemTextRefCallback: (node: any, value: any, disabled: any) => {
            const isFirstValidItem = !context.firstValidItemFoundRef() && !disabled;
            const isSelectedItem = valueComparator(context.rootContext.value(), value, context.rootContext.by());

            if (isSelectedItem || isFirstValidItem) {
                context.selectedItemText.set(node);
            }
        }
    };
};

export type RdxSelectContentContext = ReturnType<typeof context>;

export const [injectSelectContentContext, provideSelectContentContext] =
    createContext<RdxSelectContentContext>('RdxSelectContent');

@Directive({
    selector: '[rdxSelectContent]',
    hostDirectives: [RdxDismissableLayer, RdxFocusScope, RdxCollectionProvider],
    providers: [
        provideSelectContentContext(context),
        provideRdxDismissableLayerConfig(() => {
            return {
                disableOutsidePointerEvents: signal(true)
            };
        })
    ],
    host: {
        role: 'listbox',
        '[attr.data-state]': 'rootContext.open() ? "open" : "closed"',
        '[dir]': 'rootContext.dir()',

        '(keydown)': 'handleKeyDown($event)'
    }
})
export class RdxSelectContent {
    readonly rootContext = injectSelectRootContext()!;
    private readonly dismissableLayer = inject(RdxDismissableLayer);

    readonly selectedItem = signal<HTMLElement | undefined>(undefined);

    readonly selectedItemText = signal<HTMLElement | undefined>(undefined);

    readonly firstValidItemFoundRef = signal(false);

    readonly viewport = signal<HTMLElement | undefined>(undefined);

    /**
     * Event handler called when the escape key is down.
     * Can be prevented.
     */
    readonly escapeKeyDown = outputFromObservable(outputToObservable(this.dismissableLayer.escapeKeyDown));

    /**
     * Event handler called when a `pointerdown` event happens outside of the `DismissableLayer`.
     * Can be prevented.
     */
    readonly pointerDownOutside = outputFromObservable(outputToObservable(this.dismissableLayer.pointerDownOutside));

    readonly getItems: ReturnType<typeof useCollection>['getItems'];

    constructor() {
        const { getItems } = useCollection();
        this.getItems = getItems;

        this.dismissableLayer.focusOutside.subscribe((e) => e.preventDefault());

        this.dismissableLayer.dismiss.subscribe(() => this.rootContext.onOpenChange(false));

        const focusScope = inject(RdxFocusScope);

        afterNextRender(() => {
            focusScope.unmountAutoFocus.subscribe((event) => {
                if (event.defaultPrevented) return;

                this.rootContext.triggerElement()!.focus({ preventScroll: true });

                event.preventDefault();
            });

            focusScope.mountAutoFocus.subscribe((event) => {
                event.preventDefault();
            });
        });
    }

    handleKeyDown(event: KeyboardEvent) {
        // select should not be navigated using tab key so we prevent it
        if (event.key === 'Tab') event.preventDefault();

        if (['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
            const collectionItems = this.getItems().map((i) => i.ref);
            let candidateNodes = [...collectionItems];

            if (['ArrowUp', 'End'].includes(event.key)) candidateNodes = candidateNodes.slice().reverse();

            if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
                const currentElement = event.target as HTMLElement;
                const currentIndex = candidateNodes.indexOf(currentElement);
                candidateNodes = candidateNodes.slice(currentIndex + 1);
            }
            setTimeout(() => focusFirst(candidateNodes));
            event.preventDefault();
        }
    }
}
