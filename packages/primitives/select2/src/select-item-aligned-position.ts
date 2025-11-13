import { afterNextRender, contentChild, Directive, ElementRef, inject, Injector, signal } from '@angular/core';
import { useCollection } from '@radix-ng/primitives/collection';
import { clamp, resizeEffect } from '@radix-ng/primitives/core';
import { injectSelectContentContext } from './select-content';
import { RdxSelectItemAlignedPositionContent } from './select-item-aligned-position-content';
import { injectSelectRootContext } from './select-root';
import { CONTENT_MARGIN } from './utils';

@Directive({
    selector: '[rdxSelectItemAlignedPosition]',
    host: {
        '[style]': `{
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            zIndex: contentZIndex(),
        }`
    }
})
export class RdxSelectItemAlignedPosition {
    private readonly currentElement = inject(ElementRef);
    private readonly rootContext = injectSelectRootContext()!;
    readonly contentContext = injectSelectContentContext()!;

    readonly contentZIndex = signal('');

    readonly shouldExpandOnScrollRef = signal(false);

    readonly contentWrapperElement = signal<HTMLElement | undefined>(this.currentElement.nativeElement);

    readonly contentElement = contentChild.required(RdxSelectItemAlignedPositionContent);

    readonly getItems: ReturnType<typeof useCollection>['getItems'];

    constructor() {
        const { getItems } = useCollection();
        this.getItems = getItems;

        afterNextRender(() => {
            this.position();
            if (this.contentElement().currentElementRef.nativeElement) {
                this.contentZIndex.set(
                    window.getComputedStyle(this.contentElement().currentElementRef.nativeElement).zIndex
                );
            }
        });

        const injector = inject(Injector);

        // Resize and position when trigger element changes
        resizeEffect({
            injector,
            element: this.rootContext.triggerElement,
            onResize: () => this.position()
        });
    }

    position() {
        if (
            this.rootContext.triggerElement() &&
            this.rootContext.valueElement() &&
            this.contentWrapperElement() &&
            this.contentElement().currentElementRef.nativeElement &&
            this.contentContext.viewport() &&
            this.contentContext.selectedItem() &&
            this.contentContext.selectedItemText()
        ) {
            const triggerRect = this.rootContext.triggerElement()!.getBoundingClientRect();

            // -----------------------------------------------------------------------------------------
            //  Horizontal positioning
            // -----------------------------------------------------------------------------------------
            const contentRect = this.currentElement.nativeElement.getBoundingClientRect();
            const valueNodeRect = this.rootContext.valueElement()!.getBoundingClientRect();
            const itemTextRect = this.contentContext.selectedItemText()!.getBoundingClientRect();

            if (this.rootContext.dir() !== 'rtl') {
                const itemTextOffset = itemTextRect.left - contentRect.left;
                const left = valueNodeRect.left - itemTextOffset;
                const leftDelta = triggerRect.left - left;
                const minContentWidth = triggerRect.width + leftDelta;
                const contentWidth = Math.max(minContentWidth, contentRect.width);
                const rightEdge = window.innerWidth - CONTENT_MARGIN;
                const clampedLeft = clamp(left, CONTENT_MARGIN, Math.max(CONTENT_MARGIN, rightEdge - contentWidth));

                this.contentWrapperElement()!.style.minWidth = `${minContentWidth}px`;
                this.contentWrapperElement()!.style.left = `${clampedLeft}px`;
            } else {
                const itemTextOffset = contentRect.right - itemTextRect.right;
                const right = window.innerWidth - valueNodeRect.right - itemTextOffset;
                const rightDelta = window.innerWidth - triggerRect.right - right;
                const minContentWidth = triggerRect.width + rightDelta;
                const contentWidth = Math.max(minContentWidth, contentRect.width);
                const leftEdge = window.innerWidth - CONTENT_MARGIN;
                const clampedRight = clamp(right, CONTENT_MARGIN, Math.max(CONTENT_MARGIN, leftEdge - contentWidth));

                this.contentWrapperElement()!.style.minWidth = `${minContentWidth}px`;
                this.contentWrapperElement()!.style.right = `${clampedRight}px`;
            }

            // -----------------------------------------------------------------------------------------
            // Vertical positioning
            // -----------------------------------------------------------------------------------------
            const items = this.getItems().map((i) => i.ref);
            const availableHeight = window.innerHeight - CONTENT_MARGIN * 2;
            const itemsHeight = this.contentContext.viewport()!.scrollHeight;

            const contentStyles = window.getComputedStyle(this.currentElement.nativeElement);
            const contentBorderTopWidth = Number.parseInt(contentStyles.borderTopWidth, 10);
            const contentPaddingTop = Number.parseInt(contentStyles.paddingTop, 10);
            const contentBorderBottomWidth = Number.parseInt(contentStyles.borderBottomWidth, 10);
            const contentPaddingBottom = Number.parseInt(contentStyles.paddingBottom, 10);

            const fullContentHeight =
                contentBorderTopWidth +
                contentPaddingTop +
                itemsHeight +
                contentPaddingBottom +
                contentBorderBottomWidth;
            const minContentHeight = Math.min(this.contentContext.selectedItem()!.offsetHeight * 5, fullContentHeight);

            const viewportStyles = window.getComputedStyle(this.contentContext.viewport()!);
            const viewportPaddingTop = Number.parseInt(viewportStyles.paddingTop, 10);
            const viewportPaddingBottom = Number.parseInt(viewportStyles.paddingBottom, 10);

            const topEdgeToTriggerMiddle = triggerRect.top + triggerRect.height / 2 - CONTENT_MARGIN;
            const triggerMiddleToBottomEdge = availableHeight - topEdgeToTriggerMiddle;

            const selectedItemHalfHeight = this.contentContext.selectedItem()!.offsetHeight / 2;
            const itemOffsetMiddle = this.contentContext.selectedItem()!.offsetTop + selectedItemHalfHeight;
            const contentTopToItemMiddle = contentBorderTopWidth + contentPaddingTop + itemOffsetMiddle;
            const itemMiddleToContentBottom = fullContentHeight - contentTopToItemMiddle;

            const willAlignWithoutTopOverflow = contentTopToItemMiddle <= topEdgeToTriggerMiddle;

            if (willAlignWithoutTopOverflow) {
                const isLastItem = this.contentContext.selectedItem()! === items[items.length - 1];
                this.contentWrapperElement()!.style.bottom = `${0}px`;
                const viewportOffsetBottom =
                    this.currentElement.nativeElement.clientHeight -
                    this.contentContext.viewport()!.offsetTop -
                    this.contentContext.viewport()!.offsetHeight;
                const clampedTriggerMiddleToBottomEdge = Math.max(
                    triggerMiddleToBottomEdge,
                    selectedItemHalfHeight +
                        // viewport might have padding bottom, include it to avoid a scrollable viewport
                        (isLastItem ? viewportPaddingBottom : 0) +
                        viewportOffsetBottom +
                        contentBorderBottomWidth
                );
                const height = contentTopToItemMiddle + clampedTriggerMiddleToBottomEdge;
                this.contentWrapperElement()!.style.height = `${height}px`;
            } else {
                const isFirstItem = this.contentContext.selectedItem()! === items[0];
                this.contentWrapperElement()!.style.top = `${0}px`;
                const clampedTopEdgeToTriggerMiddle = Math.max(
                    topEdgeToTriggerMiddle,
                    contentBorderTopWidth +
                        this.contentContext.viewport()!.offsetTop +
                        // viewport might have padding top, include it to avoid a scrollable viewport
                        (isFirstItem ? viewportPaddingTop : 0) +
                        selectedItemHalfHeight
                );
                const height = clampedTopEdgeToTriggerMiddle + itemMiddleToContentBottom;
                this.contentWrapperElement()!.style.height = `${height}px`;
                this.contentContext.viewport()!.scrollTop =
                    contentTopToItemMiddle - topEdgeToTriggerMiddle + this.contentContext.viewport()!.offsetTop;
            }

            this.contentWrapperElement()!.style.margin = `${CONTENT_MARGIN}px 0`;
            this.contentWrapperElement()!.style.minHeight = `${minContentHeight}px`;
            this.contentWrapperElement()!.style.maxHeight = `${availableHeight}px`;
            // -----------------------------------------------------------------------------------------

            //emits('placed');

            // we don't want the initial scroll position adjustment to trigger "expand on scroll"
            // so we explicitly turn it on only after they've registered.
            requestAnimationFrame(() => this.shouldExpandOnScrollRef.set(true));
        }
    }
}
