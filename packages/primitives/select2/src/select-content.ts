import { afterNextRender, Directive, effect, ElementRef, inject, signal } from '@angular/core';
import { outputFromObservable, outputToObservable } from '@angular/core/rxjs-interop';
import { RdxCollectionProvider, useCollection } from '@radix-ng/primitives/collection';
import { createContext } from '@radix-ng/primitives/core';
import { provideRdxDismissableLayerConfig, RdxDismissableLayer } from '@radix-ng/primitives/dismissable-layer';
import { RdxFocusScope } from '@radix-ng/primitives/focus-scope';
import { injectSelectRootContext } from './select-root';
import { focusFirst, valueComparator } from './utils';

const context = () => {
    const context = inject(RdxSelectContent);

    return {
        content: context.content,
        viewport: context.viewport,
        selectedItem: context.selectedItem,
        selectedItemText: context.selectedItemText,
        onViewportChange: (node: any) => {
            context.viewport.set(node);
        },
        onItemLeave: () => {
            context.content()?.focus();
        },
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
    hostDirectives: [RdxFocusScope, RdxDismissableLayer, RdxCollectionProvider],
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

        '(keydown)': 'handleKeyDown($event)',

        '[style]': `{
            display: 'flex',
            flexDirection: 'column',
            outline: 'none'
        }`
    }
})
export class RdxSelectContent {
    private readonly dismissableLayer = inject(RdxDismissableLayer);
    private readonly currentElement = inject(ElementRef);

    readonly rootContext = injectSelectRootContext()!;

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

    readonly content = signal<HTMLElement | null>(null);

    constructor() {
        const { getItems } = useCollection();
        this.getItems = getItems;

        this.dismissableLayer.focusOutside.subscribe((e) => e.preventDefault());

        this.dismissableLayer.dismiss.subscribe(() => this.rootContext.onOpenChange(false));

        const focusScope = inject(RdxFocusScope);

        afterNextRender(() => {
            focusScope.unmountAutoFocus.subscribe((event) => {
                if (event.defaultPrevented) return;

                this.rootContext.triggerElement()?.focus({ preventScroll: true });

                event.preventDefault();
            });

            focusScope.mountAutoFocus.subscribe((event) => {
                event.preventDefault();
            });

            this.content.set(this.currentElement.nativeElement.firstElementChild);

            this.focusSelectedItem();
        });

        effect((onCleanup) => {
            if (!this.content()) return;

            let pointerMoveDelta = { x: 0, y: 0 };

            const handlePointerMove = (event: PointerEvent) => {
                pointerMoveDelta = {
                    x: Math.abs(Math.round(event.pageX) - (this.rootContext.triggerPointerDownPosRef()?.x ?? 0)),
                    y: Math.abs(Math.round(event.pageY) - (this.rootContext.triggerPointerDownPosRef()?.y ?? 0))
                };
            };

            const handlePointerUp = (event: PointerEvent) => {
                // Prevent options from being untappable on touch devices
                if (event.pointerType === 'touch') return;

                // If the pointer hasn't moved by a certain threshold then we prevent selecting item on `pointerup`.
                if (pointerMoveDelta.x <= 10 && pointerMoveDelta.y <= 10) {
                    event.preventDefault();
                } else {
                    // otherwise, if the event was outside the content, close.
                    if (!this.content()?.contains(event.target as HTMLElement)) this.rootContext.onOpenChange(false);
                }
                document.removeEventListener('pointermove', handlePointerMove);
                this.rootContext.triggerPointerDownPosRef.set(null);
            };

            if (this.rootContext.triggerPointerDownPosRef() !== null) {
                document.addEventListener('pointermove', handlePointerMove);
                document.addEventListener('pointerup', handlePointerUp, {
                    capture: true,
                    once: true
                });
            }

            onCleanup(() => {
                document.removeEventListener('pointermove', handlePointerMove);
                document.removeEventListener('pointerup', handlePointerUp, {
                    capture: true
                });
            });
        });
    }

    focusSelectedItem() {
        if (this.selectedItem() && this.content()) {
            setTimeout(() => focusFirst([this.selectedItem()!, this.content()!]));
        }
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
