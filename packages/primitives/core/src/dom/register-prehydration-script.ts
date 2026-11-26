import { isPlatformBrowser } from '@angular/common';
import {
    afterNextRender,
    CSP_NONCE,
    DOCUMENT,
    inject,
    PLATFORM_ID,
    RendererFactory2,
    TransferState,
    type StateKey
} from '@angular/core';

/** @internal Emit a static parser script outside the application tree from an app-scoped service. */
export function registerPrehydrationScript(key: StateKey<boolean>, selector: string, source: string): void {
    const state = inject(TransferState);
    if (isPlatformBrowser(inject(PLATFORM_ID))) {
        afterNextRender(() => state.remove(key));
        return;
    }

    const document = inject(DOCUMENT);
    const renderer = inject(RendererFactory2).createRenderer(null, null);
    const nonce = inject(CSP_NONCE, { optional: true });
    state.onSerialize(key, () => {
        if (!document.querySelector(selector)) return false;
        const script = renderer.createElement('script');
        renderer.setProperty(script, 'textContent', source);
        if (nonce) renderer.setAttribute(script, 'nonce', nonce);
        renderer.appendChild(document.body, script);
        return true;
    });
}
