import { DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { createContext } from '@radix-ng/primitives/core';

export interface RdxPresenceTargetContext {
    registerElement: (element: HTMLElement) => () => void;
}

/** The structural view supplies its actual lifetime, including a shared popup Root lifetime. */
export const [injectPresenceTargetContext, providePresenceTargetContext] = createContext<RdxPresenceTargetContext>(
    'PresenceTargetContext',
    'utils/presence'
);

/** Explicitly includes this element's finite exit animations in its structural Presence lifetime. */
@Directive({ selector: '[rdxPresenceTarget]' })
export class RdxPresenceTarget {
    constructor() {
        const unregister = injectPresenceTargetContext().registerElement(
            inject<ElementRef<HTMLElement>>(ElementRef).nativeElement
        );
        inject(DestroyRef).onDestroy(unregister);
    }
}
