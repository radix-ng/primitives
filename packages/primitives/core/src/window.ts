import { inject, InjectionToken } from '@angular/core';
import { injectDocument } from './document';

export const WINDOW = new InjectionToken<Window & typeof globalThis>('An abstraction over global window object', {
    factory: () => {
        const { defaultView } = injectDocument();
        if (!defaultView) {
            throw new Error('Window is not available');
        }
        return defaultView;
    }
});

export function injectWindow(): Window & typeof globalThis {
    return inject(WINDOW);
}
