import { effect, EffectRef, ElementRef, Injector, Signal } from '@angular/core';

/**
 * Creates a resize observer effect for element
 *
 * @param options Configuration options
 * @param options.injector Angular injector
 * @param options.element Signal returning the element to observe
 * @param options.onResize Callback when element is resized
 * @returns EffectRef that can be destroyed when needed
 */
export function resizeEffect(options: {
    injector: Injector;
    element: Signal<ElementRef | HTMLElement | null | undefined>;
    onResize: ResizeObserverCallback;
}): EffectRef {
    return effect(
        (onCleanup) => {
            const elementOrRef = options.element();
            if (!elementOrRef) return;

            // Extract native element from ElementRef or use directly if it's HTMLElement
            const element = elementOrRef instanceof ElementRef ? elementOrRef.nativeElement : elementOrRef;

            const resizeObserver = new ResizeObserver(options.onResize);
            resizeObserver.observe(element);

            onCleanup(() => resizeObserver.disconnect());
        },
        { injector: options.injector }
    );
}
