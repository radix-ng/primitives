import { afterRenderEffect, computed, Directive, signal, untracked } from '@angular/core';
import { injectTabsRootContext } from './tabs-root-context';

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
        role: 'presentation',
        '[hidden]': 'hidden()',
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

    /** @ignore */
    protected readonly geometry = signal<TabGeometry | null>(null, { debugName: 'RdxTabsIndicator.geometry' });
    protected readonly hidden = computed(() => {
        const geometry = this.geometry();
        return !geometry || geometry.width <= 0 || geometry.height <= 0;
    });

    constructor() {
        afterRenderEffect({
            read: () => {
                this.rootContext.value();
                this.rootContext.orientation();
                this.rootContext.tabListElement();
                this.rootContext.tabMap();
                this.measure();
            }
        });

        afterRenderEffect({
            read: (onCleanup) => {
                const list = this.rootContext.tabListElement();
                const tabs = this.rootContext.tabMap();
                const view = list?.ownerDocument.defaultView;
                if (!list || !view?.ResizeObserver) return;

                const observer = new view.ResizeObserver(() => this.measure());
                observer.observe(list);
                // A preceding tab can move the active tab without resizing the List.
                for (const tab of tabs.keys()) observer.observe(tab);
                onCleanup(() => observer.disconnect());
            }
        });
    }

    private measure(): void {
        const list = untracked(this.rootContext.tabListElement);
        const value = untracked(this.rootContext.value);
        const view = list?.ownerDocument.defaultView;

        if (!list || value == null || !view) {
            this.geometry.set(null);
            return;
        }

        const tab = [...untracked(this.rootContext.tabMap)].find(([, metadata]) => metadata.value === value)?.[0];
        if (!tab) {
            this.geometry.set(null);
            return;
        }

        const listRect = list.getBoundingClientRect();
        const tabRect = tab.getBoundingClientRect();
        const style = view.getComputedStyle(tab);
        let width = Number.parseFloat(style.width) || 0;
        let height = Number.parseFloat(style.height) || 0;
        // Preserve computed CSS precision; offset sizes cover non-border-box and hidden hosts.
        if (Math.round(width) !== tab.offsetWidth || Math.round(height) !== tab.offsetHeight) {
            width = tab.offsetWidth;
            height = tab.offsetHeight;
        }

        // Measure `left` / `top` relative to the list's scrollable content origin rather than its
        // visible edge. When the list is a scroll container (e.g. its tabs overflow inside a Scroll
        // Area), the indicator is an absolutely positioned child of that container and scrolls along
        // with the content, so these offsets must be content-relative to stay aligned with the tab.
        // Opposite-edge distances use the same scrollable content coordinates.
        const left = tabRect.left - listRect.left + list.scrollLeft;
        const top = tabRect.top - listRect.top + list.scrollTop;

        this.geometry.set({
            top,
            right: list.scrollWidth - left - width,
            bottom: list.scrollHeight - top - height,
            left,
            width,
            height
        });
    }
}
