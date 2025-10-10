import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { computed, DestroyRef, Directive, ElementRef, inject, input, linkedSignal, PLATFORM_ID } from '@angular/core';

@Directive({
    selector: '[rdxPortal]'
})
export class RdxPortal {
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly platformId = inject(PLATFORM_ID);
    private readonly document = inject(DOCUMENT, { optional: true }) as Document | null;

    /**
     * Specify a container element to portal the content into.
     */
    readonly container = input<ElementRef<HTMLElement>>();

    private _computedContainer = linkedSignal(this.container);
    readonly computedContainer = this._computedContainer;

    private readonly elementContainer = computed<HTMLElement | null>(() => {
        const provided = this.computedContainer()?.nativeElement ?? null;
        const body = this.document?.body ?? null;
        return provided ?? body;
    });

    constructor() {
        const isBrowser = isPlatformBrowser(this.platformId);
        if (!isBrowser || !this.document) {
            return;
        }

        const node = this.document.createComment('rdx-portal');

        this.elementRef.nativeElement.parentNode?.insertBefore(node, this.elementRef.nativeElement);
        this.elementContainer()?.appendChild(this.elementRef.nativeElement);

        inject(DestroyRef).onDestroy(() => {
            node.parentNode?.replaceChild(this.elementRef.nativeElement, node);
        });
    }

    setContainer(container: ElementRef<HTMLElement>) {
        this._computedContainer.set(container);
    }
}
