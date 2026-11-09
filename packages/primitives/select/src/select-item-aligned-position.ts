import {
    afterNextRender,
    afterRenderEffect,
    computed,
    contentChild,
    DestroyRef,
    Directive,
    ElementRef,
    inject,
    Injector,
    linkedSignal,
    signal,
    untracked
} from '@angular/core';
import { platform } from '@floating-ui/dom';
import {
    clamp,
    provideExistingToken,
    rdxPlatform,
    resizeEffect,
    setupInternalBackdrop
} from '@radix-ng/primitives/core';
import {
    DROPDOWN_COLLISION_AVOIDANCE,
    provideRdxPopperContentConfig,
    provideRdxPopperContentWrapper,
    RdxPopperContentWrapper,
    SideOrLogical
} from '@radix-ng/primitives/popper';
import {
    expandedItemAlignedLayout,
    finishItemAlignedLayout,
    initialItemAlignedLayout
} from './select-item-aligned-layout';
import { RdxSelectItemAlignedPositionContent } from './select-item-aligned-position-content';
import { RDX_SELECT_POSITIONER_TOKEN, RdxSelectPopup } from './select-popup';
import { injectSelectRootContext } from './select-root';

interface ItemLayout {
    left: number;
    height: number;
    top?: number;
    bottom?: number;
    marginTop: number;
    marginBottom: number;
    maxHeight: number;
}

@Directive({
    selector: '[rdxSelectItemAlignedPosition]',
    providers: [
        ...provideRdxPopperContentWrapper(RdxSelectItemAlignedPosition),
        provideRdxPopperContentConfig({
            align: 'center',
            collisionPadding: 5,
            collisionAvoidance: DROPDOWN_COLLISION_AVOIDANCE,
            updatePositionStrategy: 'always'
        }),
        provideExistingToken(RDX_SELECT_POSITIONER_TOKEN, RdxSelectItemAlignedPosition)
    ],
    host: {
        '[attr.inert]': 'rootContext.open() ? undefined : ""',
        '[hidden]': '!visible()'
    }
})
export class RdxSelectItemAlignedPosition extends RdxPopperContentWrapper {
    private readonly alignedElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    private readonly alignedInjector = inject(Injector);
    private readonly alignedDestroyRef = inject(DestroyRef);
    protected readonly rootContext = injectSelectRootContext();
    protected readonly visible = computed(
        () => this.rootContext.open() || this.rootContext.transitionStatus() === 'ending'
    );
    readonly popup = contentChild.required(RdxSelectPopup);
    readonly contentElement = contentChild.required(RdxSelectItemAlignedPositionContent);
    readonly contentWrapperElement = signal<HTMLElement | undefined>(this.alignedElement);
    readonly shouldExpandOnScrollRef = signal(false);
    readonly readyToFocus = linkedSignal<boolean, boolean>({
        source: () => this.rootContext.open(),
        computation: (open, previous) => (open ? false : (previous?.value ?? false))
    });

    // Keep geometry through an exit, and start each open with a fresh common positioning pass.
    protected readonly itemLayout = linkedSignal<boolean, ItemLayout | null>({
        source: () => this.rootContext.open(),
        computation: (open, previous) => (open ? null : (previous?.value ?? null))
    });
    private readonly anchoredFallback = linkedSignal<boolean, boolean>({
        source: () => this.rootContext.open(),
        computation: (open, previous) => (open ? false : (previous?.value ?? false))
    });
    readonly alignItemWithTriggerActive = computed(() => !this.anchoredFallback() && !this.rootContext.openedByTouch());
    private request = 0;
    private expansionFrame = 0;
    private reachedMaxHeight = false;

    constructor() {
        super();
        this.positioningActive = computed(
            () => this.visible() && (!this.itemLayout() || !this.isAnchorTrackingDisabled())
        );
        afterRenderEffect(() => {
            const open = this.rootContext.open();
            if (!open) {
                untracked(() => this.cancelPlacement());
                return;
            }
            this.rootContext.openedByTouch();
            this.rootContext.value();
            this.rootContext.dir();
            this.popup().selectedItem();
            this.popup().selectedItemText();
            this.popup().viewport();
            this.popup().items();
            untracked(() => this.invalidatePlacement());
        });
        afterNextRender(() => {
            // Initial geometry may be unavailable in a hidden Angular view. Observe only until a
            // valid manual placement exists; ongoing anchor tracking belongs to the common engine.
            resizeEffect({
                injector: this.alignedInjector,
                element: computed(() =>
                    this.rootContext.open() && !this.itemLayout() && !this.anchoredFallback()
                        ? this.rootContext.triggerElement()
                        : null
                ),
                onResize: () => this.invalidatePlacement()
            });
            setupInternalBackdrop(this.alignedElement, this.alignedInjector, {
                isOpen: () => this.rootContext.open(),
                shouldRender: () => this.rootContext.modal(),
                cutout: () => this.rootContext.triggerElement()
            });
        });
        this.alignedDestroyRef.onDestroy(() => this.cancelPlacement());
    }

    protected override getPositionerStyles(): Record<string, string | number | undefined> {
        const common = super.getPositionerStyles();
        const layout = this.itemLayout();
        return {
            ...common,
            position: this.anchoredFallback() ? common['position'] : 'fixed',
            display:
                !this.visible() || (this.rootContext.autofillProbe() && !this.rootContext.open()) ? 'none' : 'flex',
            flexDirection: 'column',
            ...(layout
                ? {
                      transform: '',
                      visibility: 'visible',
                      pointerEvents: 'auto',
                      left: `${layout.left}px`,
                      right: '',
                      top: layout.top === undefined ? '' : `${layout.top}px`,
                      bottom: layout.bottom === undefined ? '' : `${layout.bottom}px`,
                      height: `${layout.height}px`,
                      maxHeight: 'none',
                      marginTop: `${layout.marginTop}px`,
                      marginBottom: `${layout.marginBottom}px`
                  }
                : this.anchoredFallback()
                  ? { maxHeight: 'var(--available-height)' }
                  : this.readyToFocus()
                    ? {}
                    : { visibility: 'hidden', pointerEvents: 'none' })
        };
    }

    protected override hasPosition(): boolean {
        return this.readyToFocus() && (this.anchoredFallback() ? super.hasPosition() : !!this.itemLayout());
    }

    protected override getContentSide(): SideOrLogical | 'none' | undefined {
        return this.alignItemWithTriggerActive() ? 'none' : super.getContentSide();
    }

    protected override isAnchorTrackingDisabled(): boolean {
        return this.disableAnchorTracking() ?? this.alignItemWithTriggerActive();
    }

    protected override onPlaced() {
        if (!this.rootContext.open()) return;
        if (this.anchoredFallback()) {
            this.readyToFocus.set(true);
            this.placed.emit();
        } else if (!this.itemLayout()) void this.position();
    }

    private cancelPlacement() {
        this.request++;
        this.shouldExpandOnScrollRef.set(false);
        const view = this.alignedElement.ownerDocument.defaultView;
        view?.cancelAnimationFrame?.(this.expansionFrame);
    }
    private valid(request: number) {
        return request === this.request && this.rootContext.open() && !this.alignedDestroyRef.destroyed;
    }
    private invalidatePlacement() {
        if (!this.rootContext.open()) return;
        this.cancelPlacement();
        this.reachedMaxHeight = false;
        if (this.anchoredFallback()) return;
        const hadLayout = !!this.itemLayout();
        this.itemLayout.set(null);
        if (!hadLayout && super.hasPosition()) void this.position();
    }
    private useAnchoredFallback() {
        this.anchoredFallback.set(true);
        this.itemLayout.set(null);
        const request = this.request;
        afterNextRender(
            () => {
                if (this.valid(request) && super.hasPosition()) {
                    this.readyToFocus.set(true);
                    this.placed.emit();
                }
            },
            { injector: this.alignedInjector }
        );
    }
    private maxPopupHeight() {
        const style = this.alignedElement.ownerDocument.defaultView!.getComputedStyle(
            this.contentElement().currentElementRef.nativeElement
        );
        return style.maxHeight.endsWith('px') ? parseFloat(style.maxHeight) || Infinity : Infinity;
    }

    async position() {
        if (!this.rootContext.open() || this.anchoredFallback()) return;
        if (this.itemLayout()) {
            this.invalidatePlacement();
            return;
        }
        if (!super.hasPosition()) return;
        const request = ++this.request;
        const trigger = this.rootContext.triggerElement();
        const viewport = this.popup().viewport();
        if (!trigger || !viewport) return;
        const triggerRect = trigger.getBoundingClientRect();
        // A hidden/unmeasured anchor has no geometry to align. Keep measuring rather than
        // interpreting a zero jsdom/hidden rect as a real viewport-edge collision.
        if (!triggerRect.width || !triggerRect.height) {
            // There is no item geometry yet (hidden anchor or layout-free renderer). The common
            // pass is still complete; ResizeObserver will retry alignment when size is available.
            this.readyToFocus.set(true);
            this.placed.emit();
            return;
        }
        const view = this.alignedElement.ownerDocument.defaultView!;
        if (
            this.rootContext.openedByTouch() ||
            (rdxPlatform.engine.webkit && (view.visualViewport?.scale ?? 1) !== 1)
        ) {
            this.useAnchoredFallback();
            return;
        }
        const offsetParent = await platform.getOffsetParent(this.alignedElement);
        if (!this.valid(request)) return;
        // Fixed positioning inside a transformed containing block needs a different coordinate
        // space. Let the common Floating UI engine handle it instead of offsetting viewport math.
        if (offsetParent !== view) {
            this.useAnchoredFallback();
            return;
        }
        const panel = this.contentElement().currentElementRef.nativeElement;
        const style = view.getComputedStyle(this.alignedElement);
        const panelStyle = view.getComputedStyle(panel);
        const marginTop = parseFloat(style.marginTop) || 10;
        const marginBottom = parseFloat(style.marginBottom) || 10;
        const input = initialItemAlignedLayout({
            trigger: triggerRect,
            positioner: this.alignedElement.getBoundingClientRect(),
            value: this.rootContext.valueElement()?.getBoundingClientRect(),
            text: (() => {
                const text = this.popup().selectedItemText()?.getBoundingClientRect();
                // Focus/initial highlight may already have scrolled this list while the common
                // positioner was measuring. Item alignment needs its intrinsic text offset.
                return (
                    text && {
                        ...text.toJSON(),
                        top: text.top + viewport.scrollTop,
                        bottom: text.bottom + viewport.scrollTop
                    }
                );
            })(),
            rtl: this.rootContext.dir() === 'rtl',
            viewportWidth: this.alignedElement.ownerDocument.documentElement.clientWidth,
            viewportHeight: this.alignedElement.ownerDocument.documentElement.clientHeight,
            marginTop,
            marginBottom,
            minHeight: parseFloat(style.minHeight) || 100,
            borderBottom: parseFloat(panelStyle.borderBottomWidth) || 0,
            scrollHeight: viewport.scrollHeight
        });
        const layout: ItemLayout = {
            left: input.left,
            height: input.height,
            bottom: 0,
            marginTop,
            marginBottom,
            maxHeight: Math.min(input.availableHeight, this.maxPopupHeight())
        };
        this.itemLayout.set(layout);
        afterNextRender(
            () => {
                if (!this.valid(request)) return;
                const finished = finishItemAlignedLayout(
                    input,
                    Math.max(0, viewport.scrollHeight - viewport.clientHeight)
                );
                if (finished.fallback) {
                    this.useAnchoredFallback();
                    return;
                }
                this.itemLayout.set({ ...layout, height: finished.height, top: finished.top, bottom: finished.bottom });
                this.reachedMaxHeight = finished.height >= layout.maxHeight - 1;
                afterNextRender(
                    () => {
                        if (!this.valid(request)) return;
                        viewport.scrollTop = clamp(
                            finished.scrollTop,
                            0,
                            Math.max(0, viewport.scrollHeight - viewport.clientHeight)
                        );
                        this.popup().updateScrollEdges();
                        this.placed.emit();
                        // In-flow scroll buttons can appear after the first placement notification.
                        // Let Angular render that chrome before settling scroll and enabling focus.
                        afterNextRender(
                            () => {
                                if (!this.valid(request)) return;
                                const text = this.popup().selectedItemText()?.getBoundingClientRect();
                                const value = this.rootContext.valueElement()?.getBoundingClientRect();
                                if (
                                    text &&
                                    value &&
                                    this.popup().highlight.highlightedItem()?.element === this.popup().selectedItem()
                                ) {
                                    const delta = text.top + text.height / 2 - value.top - value.height / 2;
                                    viewport.scrollTop = clamp(
                                        viewport.scrollTop + delta,
                                        0,
                                        Math.max(0, viewport.scrollHeight - viewport.clientHeight)
                                    );
                                }
                                this.popup().updateScrollEdges();
                                this.readyToFocus.set(true);
                                this.placed.emit();
                                this.expansionFrame = view.requestAnimationFrame(() => {
                                    if (this.valid(request)) this.shouldExpandOnScrollRef.set(true);
                                });
                            },
                            { injector: this.alignedInjector }
                        );
                    },
                    { injector: this.alignedInjector }
                );
            },
            { injector: this.alignedInjector }
        );
    }

    onScroll(viewport: HTMLElement): boolean {
        const layout = this.itemLayout();
        if (
            !this.rootContext.open() ||
            !layout ||
            !this.shouldExpandOnScrollRef() ||
            this.reachedMaxHeight ||
            (layout.top !== 0 && layout.bottom !== 0)
        )
            return false;
        const next = expandedItemAlignedLayout(
            layout.height,
            layout.maxHeight,
            viewport.scrollTop,
            Math.max(0, viewport.scrollHeight - viewport.clientHeight),
            layout.top === 0
        );
        if (Math.abs(next.height - layout.height) < 0.01) return false;
        this.itemLayout.set({ ...layout, height: next.height });
        this.reachedMaxHeight = next.height >= layout.maxHeight - 1;
        // Height and offset change in one native scroll turn. Intermediate arrow visibility must
        // not alter list chrome before the new height is applied; the signal retains render ownership.
        this.alignedElement.style.height = `${next.height}px`;
        if (next.scrollTop !== undefined)
            viewport.scrollTop = clamp(next.scrollTop, 0, Math.max(0, viewport.scrollHeight - viewport.clientHeight));
        this.popup().updateScrollEdges();
        return true;
    }
}
