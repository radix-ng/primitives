import { afterNextRender, DestroyRef, ElementRef, Injector, signal } from '@angular/core';

export function elementSize({ elementRef, injector }: { elementRef: ElementRef<HTMLElement>; injector: Injector }) {
    const destroyRef = injector.get(DestroyRef);
    const result = signal({
        width: elementRef.nativeElement.offsetWidth,
        height: elementRef.nativeElement.offsetHeight
    });

    afterNextRender(
        () => {
            const resizeObserver = new ResizeObserver((entries) => {
                const entry = entries[0];
                let width: number;
                let height: number;

                if ('borderBoxSize' in entry) {
                    const borderSizeEntry = entry['borderBoxSize'];
                    const borderSize = Array.isArray(borderSizeEntry) ? borderSizeEntry[0] : borderSizeEntry;

                    width = borderSize['inlineSize'];
                    height = borderSize['blockSize'];
                } else {
                    width = elementRef.nativeElement.offsetWidth;
                    height = elementRef.nativeElement.offsetHeight;
                }

                result.set({ width, height });
            });

            destroyRef.onDestroy(() => resizeObserver.disconnect());
        },
        { injector: injector }
    );

    return result.asReadonly();
}
