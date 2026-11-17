import { isPlatformBrowser } from '@angular/common';
import {
    afterNextRender,
    CSP_NONCE,
    DOCUMENT,
    ElementRef,
    inject,
    Injectable,
    makeStateKey,
    PLATFORM_ID,
    RendererFactory2,
    TransferState
} from '@angular/core';
import type { TabGeometry } from './tabs-indicator-geometry';

// Emitted verbatim so application minification cannot introduce captured helpers into the script.
const PREHYDRATION_SCRIPT = String.raw`(function positionIndicatorBeforeHydration() {
    const indicators = document.querySelectorAll('[data-rdx-tabs-prehydration]');
    for (const indicator of indicators)
        position(indicator);
    document.currentScript?.remove();
    function position(indicator) {
        const list = indicator.closest('[role="tablist"]');
        const tab = list?.querySelector('[data-active]');
        if (!list || !tab)
            return;
        const style = getComputedStyle(tab);
        if ([style.transform, style.translate, style.rotate, style.scale].some((value) => value && value !== 'none'))
            return;
        const dimensions = (element) => {
            const computed = getComputedStyle(element);
            let width = Number.parseFloat(computed.width) || 0;
            let height = Number.parseFloat(computed.height) || 0;
            if (Math.round(width) !== element.offsetWidth || Math.round(height) !== element.offsetHeight) {
                width = element.offsetWidth;
                height = element.offsetHeight;
            }
            return { width, height };
        };
        const offset = (element) => {
            let left = 0;
            let top = 0;
            let current = element;
            while (current) {
                left += current.offsetLeft;
                top += current.offsetTop;
                current = current.offsetParent;
                if (current) {
                    left += current.clientLeft;
                    top += current.clientTop;
                }
            }
            return { left, top };
        };
        const update = () => {
            const { width, height } = dimensions(tab);
            const tabOffset = offset(tab);
            const listOffset = offset(list);
            let left = tabOffset.left - listOffset.left - list.clientLeft;
            let top = tabOffset.top - listOffset.top - list.clientTop;
            let parent = tab.parentElement;
            while (parent && parent !== list) {
                left -= parent.scrollLeft;
                top -= parent.scrollTop;
                parent = parent.parentElement;
            }
            left = Math.min(left, list.scrollWidth - width);
            top = Math.min(top, list.scrollHeight - height);
            const geometry = {
                left,
                right: list.scrollWidth - left - width,
                top,
                bottom: list.scrollHeight - top - height,
                width,
                height
            };
            for (const [key, value] of Object.entries(geometry))
                indicator.style.setProperty('--active-tab-' + key, value + 'px');
            if (width > 0 && height > 0) {
                indicator.removeAttribute('hidden');
                return true;
            }
            return false;
        };
        if (update() || typeof ResizeObserver === 'undefined')
            return;
        let timer;
        const stop = () => {
            observer.disconnect();
            clearTimeout(timer);
        };
        const observer = new ResizeObserver(() => {
            if (!indicator.isConnected ||
                !indicator.hasAttribute('data-rdx-tabs-prehydration') ||
                !indicator.hidden ||
                !tab.hasAttribute('data-active') ||
                update())
                stop();
        });
        observer.observe(tab);
        timer = setTimeout(stop, 10_000);
    }
})();`;

const PREHYDRATION = makeStateKey<boolean>('rdx-tabs-indicator-prehydration');

/** Emits outside the application's annotated DOM; no hydration-owned nodes are inserted or removed. */
@Injectable({ providedIn: 'root' })
export class TabsIndicatorPrehydration {
    constructor() {
        const state = inject(TransferState);
        if (isPlatformBrowser(inject(PLATFORM_ID))) {
            afterNextRender(() => state.remove(PREHYDRATION));
            return;
        }
        const document = inject(DOCUMENT);
        const renderer = inject(RendererFactory2).createRenderer(null, null);
        const nonce = inject(CSP_NONCE, { optional: true });
        state.onSerialize(PREHYDRATION, () => {
            if (!document.querySelector('[data-rdx-tabs-prehydration]')) return false;
            const script = renderer.createElement('script');
            renderer.setProperty(script, 'textContent', PREHYDRATION_SCRIPT);
            if (nonce) renderer.setAttribute(script, 'nonce', nonce);
            renderer.appendChild(document.body, script);
            return true;
        });
    }
}

/** Preserve the parser script's visible geometry through Angular's initial host bindings. */
export function readPrehydratedTabGeometry(): TabGeometry | null {
    const state = inject(TransferState);
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    if (!state.get(PREHYDRATION, false) || element.hidden || !element.hasAttribute('data-rdx-tabs-prehydration'))
        return null;
    const read = (key: string) => Number.parseFloat(element.style.getPropertyValue('--active-tab-' + key));
    const geometry = {
        left: read('left'),
        right: read('right'),
        top: read('top'),
        bottom: read('bottom'),
        width: read('width'),
        height: read('height')
    };
    return Object.values(geometry).every(Number.isFinite) && geometry.width > 0 && geometry.height > 0
        ? geometry
        : null;
}
