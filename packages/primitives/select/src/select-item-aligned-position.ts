import {
    afterNextRender,
    computed,
    contentChild,
    Directive,
    ElementRef,
    forwardRef,
    inject,
    Injector,
    output,
    signal
} from '@angular/core';
import { clamp, resizeEffect } from '@radix-ng/primitives/core';
import { RdxSelectItemAlignedPositionContent } from './select-item-aligned-position-content';
import { RDX_SELECT_POSITIONER_TOKEN, RdxPositionerImpl, RdxSelectPopup } from './select-popup';
import { injectSelectRootContext } from './select-root';
import { CONTENT_MARGIN } from './utils';

@Directive({
    selector: '[rdxSelectItemAlignedPosition]',
    providers: [
        {
            provide: RDX_SELECT_POSITIONER_TOKEN,
            useExisting: forwardRef(() => RdxSelectItemAlignedPosition)
        }
    ],
    host: {
        '[style]': `{
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            zIndex: contentZIndex(),
        }`
    }
})
export class RdxSelectItemAlignedPosition implements RdxPositionerImpl {
    private readonly currentElement = inject(ElementRef);
    private readonly rootContext = injectSelectRootContext();

    /**
     * The popup is now a **descendant** (item-aligned-position is the outer positioner), so read the
     * viewport / selected-item measurements off the popup instance instead of injecting its context.
     */
    readonly popup = contentChild.required(RdxSelectPopup);

    readonly placed = output();

    /**
     * Whether item-aligned positioning is active (Base UI `alignItemWithTriggerActive`): open **and not**
     * touch-opened. A touch open falls back to a plain anchored dropdown ({@link positionBelowTrigger}).
     * Read by the popup's scroll-lock policy — an active item-aligned popup locks even when `modal=false`.
     */
    readonly alignItemWithTriggerActive = computed(() => this.rootContext.open() && !this.rootContext.openedByTouch());

    readonly contentZIndex = signal('');

    readonly shouldExpandOnScrollRef = signal(false);

    readonly contentWrapperElement = signal<HTMLElement | undefined>(this.currentElement.nativeElement);

    readonly contentElement = contentChild.required(RdxSelectItemAlignedPositionContent);

    constructor() {
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
        // Base UI parity: a touch-opened select does NOT align the item with the trigger (the macOS-style
        // overlay is awkward on mobile). Fall back to a plain anchored dropdown below the trigger.
        if (!this.alignItemWithTriggerActive()) {
            this.positionBelowTrigger();
            return;
        }

        if (
            this.rootContext.triggerElement() &&
            this.rootContext.valueElement() &&
            this.contentWrapperElement() &&
            this.contentElement().currentElementRef.nativeElement &&
            this.popup().viewport() &&
            this.popup().selectedItem() &&
            this.popup().selectedItemText()
        ) {
            const triggerRect = this.rootContext.triggerElement()!.getBoundingClientRect();

            // -----------------------------------------------------------------------------------------
            //  Horizontal positioning
            // -----------------------------------------------------------------------------------------
            const contentRect = this.currentElement.nativeElement.getBoundingClientRect();
            const valueNodeRect = this.rootContext.valueElement()!.getBoundingClientRect();
            const itemTextRect = this.popup().selectedItemText()!.getBoundingClientRect();

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
            const items = this.popup()
                .items()
                .map((i) => i.element);
            const availableHeight = window.innerHeight - CONTENT_MARGIN * 2;
            const itemsHeight = this.popup().viewport()!.scrollHeight;

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
            const minContentHeight = Math.min(this.popup().selectedItem()!.offsetHeight * 5, fullContentHeight);

            const viewportStyles = window.getComputedStyle(this.popup().viewport()!);
            const viewportPaddingTop = Number.parseInt(viewportStyles.paddingTop, 10);
            const viewportPaddingBottom = Number.parseInt(viewportStyles.paddingBottom, 10);

            const topEdgeToTriggerMiddle = triggerRect.top + triggerRect.height / 2 - CONTENT_MARGIN;
            const triggerMiddleToBottomEdge = availableHeight - topEdgeToTriggerMiddle;

            const selectedItemHalfHeight = this.popup().selectedItem()!.offsetHeight / 2;
            const itemOffsetMiddle = this.popup().selectedItem()!.offsetTop + selectedItemHalfHeight;
            const contentTopToItemMiddle = contentBorderTopWidth + contentPaddingTop + itemOffsetMiddle;
            const itemMiddleToContentBottom = fullContentHeight - contentTopToItemMiddle;

            const willAlignWithoutTopOverflow = contentTopToItemMiddle <= topEdgeToTriggerMiddle;

            if (willAlignWithoutTopOverflow) {
                const isLastItem = this.popup().selectedItem()! === items[items.length - 1];
                this.contentWrapperElement()!.style.bottom = `${0}px`;
                const viewportOffsetBottom =
                    this.currentElement.nativeElement.clientHeight -
                    this.popup().viewport()!.offsetTop -
                    this.popup().viewport()!.offsetHeight;
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
                const isFirstItem = this.popup().selectedItem()! === items[0];
                this.contentWrapperElement()!.style.top = `${0}px`;
                const clampedTopEdgeToTriggerMiddle = Math.max(
                    topEdgeToTriggerMiddle,
                    contentBorderTopWidth +
                        this.popup().viewport()!.offsetTop +
                        // viewport might have padding top, include it to avoid a scrollable viewport
                        (isFirstItem ? viewportPaddingTop : 0) +
                        selectedItemHalfHeight
                );
                const height = clampedTopEdgeToTriggerMiddle + itemMiddleToContentBottom;
                this.contentWrapperElement()!.style.height = `${height}px`;
                this.popup().viewport()!.scrollTop =
                    contentTopToItemMiddle - topEdgeToTriggerMiddle + this.popup().viewport()!.offsetTop;
            }

            this.contentWrapperElement()!.style.margin = `${CONTENT_MARGIN}px 0`;
            this.contentWrapperElement()!.style.minHeight = `${minContentHeight}px`;
            this.contentWrapperElement()!.style.maxHeight = `${availableHeight}px`;
            // -----------------------------------------------------------------------------------------

            this.placed.emit();

            // we don't want the initial scroll position adjustment to trigger "expand on scroll"
            // so we explicitly turn it on only after they've registered.
            requestAnimationFrame(() => this.shouldExpandOnScrollRef.set(true));
        }
    }

    /**
     * Touch fallback (Base UI disables item-alignment on touch): position the popup as a plain anchored
     * dropdown just below the trigger, clamped to the viewport, with no item alignment or pre-scroll.
     */
    private positionBelowTrigger() {
        const trigger = this.rootContext.triggerElement();
        const wrapper = this.contentWrapperElement();
        if (!trigger || !wrapper) {
            return;
        }
        const triggerRect = trigger.getBoundingClientRect();
        const availableHeight = window.innerHeight - CONTENT_MARGIN * 2;
        const maxLeft = Math.max(CONTENT_MARGIN, window.innerWidth - CONTENT_MARGIN - triggerRect.width);

        wrapper.style.left = `${clamp(triggerRect.left, CONTENT_MARGIN, maxLeft)}px`;
        wrapper.style.top = `${triggerRect.bottom}px`;
        wrapper.style.bottom = '';
        wrapper.style.height = '';
        wrapper.style.margin = `${CONTENT_MARGIN}px 0`;
        wrapper.style.minWidth = `${triggerRect.width}px`;
        wrapper.style.maxHeight = `${availableHeight}px`;

        this.placed.emit();
    }
}
