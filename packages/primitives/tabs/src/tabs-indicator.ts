import { injectTabsRootContext } from './tabs-root-context';
import { makeTabId } from './utils';
import { afterNextRender, DestroyRef, Directive, effect, inject, signal, untracked } from '@angular/core';

interface TabGeometry {
    top: number;
    right: number;
    bottom: number;
    left: number;
    width: number;
    height: number;
}

/**
 * A visual element that tracks the position and size of the active tab. Exposes the active tab
 * geometry as CSS variables (`--active-tab-{top,right,bottom,left,width,height}`) so it can be
 * animated with CSS.
 *
 * @see https://base-ui.com/react/components/tabs
 */
@Directive({
    selector: '[rdxTabsIndicator]',
    exportAs: 'rdxTabsIndicator',
    host: {
        '[attr.data-orientation]': 'rootContext.orientation()',
        '[attr.data-activation-direction]': 'rootContext.activationDirection()',
        '[style.--active-tab-top.px]': 'geometry()?.top',
        '[style.--active-tab-right.px]': 'geometry()?.right',
        '[style.--active-tab-bottom.px]': 'geometry()?.bottom',
        '[style.--active-tab-left.px]': 'geometry()?.left',
        '[style.--active-tab-width.px]': 'geometry()?.width',
        '[style.--active-tab-height.px]': 'geometry()?.height'
    }
})
export class RdxTabsIndicator {
    protected readonly rootContext = injectTabsRootContext();
    private readonly destroyRef = inject(DestroyRef);

    /** @ignore */
    protected readonly geometry = signal<TabGeometry | null>(null);

    constructor() {
        // Re-measure whenever the selection, orientation or the list element changes.
        effect(() => {
            this.rootContext.value();
            this.rootContext.orientation();
            this.rootContext.tabListElement();
            this.scheduleMeasure();
        });

        afterNextRender(() => {
            const list = untracked(this.rootContext.tabListElement);
            if (!list || typeof ResizeObserver === 'undefined') {
                this.measure();
                return;
            }

            const observer = new ResizeObserver(() => this.measure());
            observer.observe(list);
            this.destroyRef.onDestroy(() => observer.disconnect());
            this.measure();
        });
    }

    private scheduleMeasure(): void {
        if (typeof requestAnimationFrame === 'undefined') {
            this.measure();
            return;
        }
        requestAnimationFrame(() => this.measure());
    }

    private measure(): void {
        const list = untracked(this.rootContext.tabListElement);
        const value = untracked(this.rootContext.value);

        if (!list || value == null || typeof document === 'undefined') {
            this.geometry.set(null);
            return;
        }

        const tab = document.getElementById(makeTabId(this.rootContext.baseId, value));
        if (!tab) {
            this.geometry.set(null);
            return;
        }

        const listRect = list.getBoundingClientRect();
        const tabRect = tab.getBoundingClientRect();

        // Measure `left` / `top` relative to the list's scrollable content origin rather than its
        // visible edge. When the list is a scroll container (e.g. its tabs overflow inside a Scroll
        // Area), the indicator is an absolutely positioned child of that container and scrolls along
        // with the content, so these offsets must be content-relative to stay aligned with the tab.
        // For non-scrolling lists `scrollLeft` / `scrollTop` are `0`, leaving the geometry unchanged.
        // `right` / `bottom` stay visible-edge relative — there is no unambiguous content-relative
        // meaning for them inside a scroll container, and the moving indicator uses `left`/`top`.
        const scrollLeft = list.scrollLeft;
        const scrollTop = list.scrollTop;

        this.geometry.set({
            top: tabRect.top - listRect.top + scrollTop,
            right: listRect.right - tabRect.right,
            bottom: listRect.bottom - tabRect.bottom,
            left: tabRect.left - listRect.left + scrollLeft,
            width: tabRect.width,
            height: tabRect.height
        });
    }
}
