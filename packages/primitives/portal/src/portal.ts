import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
    afterRenderEffect,
    computed,
    DestroyRef,
    Directive,
    ElementRef,
    inject,
    input,
    linkedSignal,
    PLATFORM_ID,
    untracked
} from '@angular/core';
import { movePortalNodes } from './move-nodes';
import { RDX_PORTAL_RELOCATION } from './portal-context';
import { RdxPortalContainer, RdxPortalTarget, resolvePortalContainer } from './resolve-container';

@Directive({
    selector: '[rdxPortal]',
    exportAs: 'rdxPortal',
    providers: [{ provide: RDX_PORTAL_RELOCATION, useFactory: () => inject(RdxPortal) }]
})
export class RdxPortal {
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly platformId = inject(PLATFORM_ID);
    private readonly isBrowser = isPlatformBrowser(this.platformId);
    private readonly parentPortal = inject(RDX_PORTAL_RELOCATION, { skipSelf: true, optional: true });
    private readonly document = inject(DOCUMENT, { optional: true });
    private readonly destroyRef = inject(DestroyRef);

    /**
     * Specify a container to portal the content into. Can be a ShadowRoot, an HTML element (including
     * one from another window), an ElementRef of either, or a
     * CSS selector. Defaults to `document.body` when not set (or when a selector matches nothing).
     * Explicit null detaches the host until a target is provided, retaining its Angular view.
     */
    readonly container = input<RdxPortalContainer>();

    private readonly _computedContainer = linkedSignal(this.container);
    readonly computedContainer = this._computedContainer.asReadonly();

    private readonly elementContainer = computed<RdxPortalTarget | null>(() => {
        const container = this.computedContainer();
        if (container === null) return null;
        const provided = resolvePortalContainer(container, this.document);
        const body = this.document?.body ?? null;
        return provided ?? body;
    });

    constructor() {
        if (!this.isBrowser || !this.document) {
            return;
        }

        const element = this.elementRef.nativeElement;
        // Record the declaration before any relocation, so Angular can remove the restored element
        // while destroying its view. Creating a late anchor can place it after Angular's removal pass.
        const anchor = this.document.createComment('rdx-portal');
        element.parentNode?.insertBefore(anchor, element);

        // Move reactively: the effect runs after inputs are bound (so `container` is respected on
        // first render) and re-runs whenever the target container changes. `appendChild` relocates
        // the element, it does not clone it.
        afterRenderEffect({
            write: () => this.relocate()
        });

        this.destroyRef.onDestroy(() => {
            if (anchor.parentNode) anchor.parentNode.replaceChild(element, anchor);
            // A CSR @if root may have no declaration parent while its constructors run.
            else element.remove();
        });
    }

    /** @internal Keep declaring portals before their nested destinations in DOM stacking order. */
    relocate(): void {
        if (!this.isBrowser) return;
        untracked(() => this.parentPortal?.relocate());
        const container = this.elementContainer();
        const element = this.elementRef.nativeElement;
        if (container) movePortalNodes([element], container);
        else element.remove();
    }

    setContainer(container: RdxPortalContainer | undefined) {
        this._computedContainer.set(container);
    }
}
