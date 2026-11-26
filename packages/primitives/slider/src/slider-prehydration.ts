import { Injectable, makeStateKey } from '@angular/core';
import { registerPrehydrationScript } from '@radix-ng/primitives/core';

// Keep the script self-contained so it can run as the parser reaches it.
const SCRIPT = String.raw`(function positionSlidersBeforeHydration() {
    const rootSelector = '[data-rdx-slider-prehydration]';
    for (const root of document.querySelectorAll(rootSelector)) {
        const parts = (selector) => Array.from(root.querySelectorAll(selector))
            .filter((part) => part.closest(rootSelector) === root);
        const control = parts('[data-rdx-slider-control]')[0];
        if (!control) continue;
        const side = root.getAttribute('data-orientation') === 'vertical' ? 'height' : 'width';
        const rail = parts('[data-rdx-slider-track]')[0] ?? control;
        const size = rail.getBoundingClientRect()[side];
        if (!size) continue;
        const positions = new Map();
        for (const thumb of parts('[data-rdx-slider-percent]')) {
            const fraction = Number(thumb.getAttribute('data-rdx-slider-percent')) / 100;
            const thumbSize = thumb.getBoundingClientRect()[side];
            const travel = size - thumbSize;
            const position = ((thumbSize / 2 + travel * fraction) / size) * 100;
            if (!Number.isFinite(position)) continue;
            positions.set(Number(thumb.getAttribute('data-index')), position);
            thumb.style.setProperty('--rdx-slider-ssr-position', position + '%');
            thumb.style.setProperty('--rdx-slider-ssr-visibility', 'visible');
        }
        const count = Number(root.getAttribute('data-rdx-slider-prehydration'));
        const first = positions.get(0);
        const last = positions.get(count - 1);
        if (first === undefined || last === undefined) continue;
        for (const indicator of parts('[data-rdx-slider-indicator]')) {
            indicator.style.setProperty('--rdx-slider-ssr-position', (count > 1 ? first : 0) + '%');
            indicator.style.setProperty('--rdx-slider-ssr-size', (count > 1 ? last - first : first) + '%');
            indicator.style.setProperty('--rdx-slider-ssr-visibility', 'visible');
        }
    }
    document.currentScript?.remove();
})();`;

@Injectable({ providedIn: 'root' })
export class SliderPrehydration {
    constructor() {
        registerPrehydrationScript(
            makeStateKey<boolean>('rdx-slider-prehydration'),
            '[data-rdx-slider-prehydration]',
            SCRIPT
        );
    }
}
