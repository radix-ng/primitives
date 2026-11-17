import {
    afterNextRender,
    afterRenderEffect,
    booleanAttribute,
    computed,
    Directive,
    inject,
    input,
    signal,
    untracked
} from '@angular/core';
import { measureTabGeometry, type TabGeometry } from './tabs-indicator-geometry';
import { readPrehydratedTabGeometry, TabsIndicatorPrehydration } from './tabs-indicator-prehydration';
import { injectTabsRootContext } from './tabs-root-context';

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
        '[attr.data-rdx-tabs-prehydration]':
            'renderBeforeHydration() && prehydrationPending() && rootContext.value() != null ? "" : undefined',
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

    /**
     * Position the server-rendered Indicator before Angular hydrates, using a CSP-aware inline script.
     * @default false
     */
    readonly renderBeforeHydration = input(false, { transform: booleanAttribute });

    /** @ignore */
    protected readonly geometry = signal<TabGeometry | null>(readPrehydratedTabGeometry(), {
        debugName: 'RdxTabsIndicator.geometry'
    });
    protected readonly hidden = computed(() => {
        const geometry = this.geometry();
        return !geometry || geometry.width <= 0 || geometry.height <= 0;
    });

    protected readonly prehydrationPending = signal(true);

    constructor() {
        inject(TabsIndicatorPrehydration);
        afterNextRender(() => this.prehydrationPending.set(false));
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

        this.geometry.set(measureTabGeometry(tab, list));
    }
}
