import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
    computed,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    linkedSignal,
    PLATFORM_ID
} from '@angular/core';
import { RdxPortalContainer, resolvePortalContainer } from './resolve-container';

@Directive({
    selector: '[rdxPortal]',
    exportAs: 'rdxPortal'
})
export class RdxPortal {
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly platformId = inject(PLATFORM_ID);
    private readonly document = inject(DOCUMENT, { optional: true });
    private readonly destroyRef = inject(DestroyRef);

    /**
     * Specify a container to portal the content into. Can be an `ElementRef`, a native element, or a
     * CSS selector. Defaults to `document.body` when not set (or when a selector matches nothing).
     */
    readonly container = input<RdxPortalContainer>();

    private readonly _computedContainer = linkedSignal(this.container);
    readonly computedContainer = this._computedContainer.asReadonly();

    private readonly elementContainer = computed<HTMLElement | null>(() => {
        const provided = resolvePortalContainer(this.computedContainer(), this.document);
        const body = this.document?.body ?? null;
        return provided ?? body;
    });

    constructor() {
        const isBrowser = isPlatformBrowser(this.platformId);
        if (!isBrowser || !this.document) {
            return;
        }

        const element = this.elementRef.nativeElement;
        // Anchor the original DOM position with a comment node, so the element can be restored
        // exactly where it was when the directive is destroyed.
        const anchor = this.document.createComment('rdx-portal');
        element.parentNode?.insertBefore(anchor, element);

        // Move reactively: the effect runs after inputs are bound (so `container` is respected on
        // first render) and re-runs whenever the target container changes. `appendChild` relocates
        // the element, it does not clone it.
        effect(() => {
            this.elementContainer()?.appendChild(element);
        });

        this.destroyRef.onDestroy(() => {
            anchor.parentNode?.replaceChild(element, anchor);
        });
    }

    setContainer(container: RdxPortalContainer) {
        this._computedContainer.set(container);
    }
}
