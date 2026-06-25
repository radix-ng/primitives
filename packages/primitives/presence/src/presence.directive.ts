import { isPlatformBrowser } from '@angular/common';
import {
    DestroyRef,
    Directive,
    EmbeddedViewRef,
    inject,
    InjectionToken,
    Injector,
    PLATFORM_ID,
    Provider,
    Signal,
    TemplateRef,
    ViewContainerRef
} from '@angular/core';
import { PresenceMachine } from './presence-machine';

/**
 * Context interface for RdxPresence directive
 * Contains a Signal that indicates whether the content should be present in the DOM
 */
export type RdxPresenceContext = {
    present: Signal<boolean>;
};

export const RDX_PRESENCE_CONTEXT = new InjectionToken<RdxPresenceContext>('RdxPresenceContext');

/**
 * Factory provider helper.
 * In your parent component/directive you can write:
 *
 *   providers: [
 *     provideRdxPresenceContext(() => ({ present: myBooleanSignal }))
 *   ]
 */
export function provideRdxPresenceContext(contextFactory: () => RdxPresenceContext): Provider {
    return { provide: RDX_PRESENCE_CONTEXT, useFactory: contextFactory };
}

/**
 * Headless structural directive that conditionally renders its template based on a reactive
 * `present` signal supplied through {@link RDX_PRESENCE_CONTEXT}.
 *
 * Unlike a plain `*ngIf`, it keeps the content mounted while a CSS exit animation
 * (`@keyframes` applied for the closed state) is running, and unmounts it only once that
 * animation finishes. If the content has no exit animation, it unmounts immediately.
 *
 * The mount/unmount-with-exit logic lives in the shared {@link PresenceMachine}; this directive just
 * creates the embedded view in place (`RdxPortalPresence` reuses the same machine and additionally
 * relocates the view into a portal container).
 */
@Directive({
    standalone: true
})
export class RdxPresenceDirective {
    private readonly viewContainerRef = inject(ViewContainerRef);
    private readonly templateRef = inject(TemplateRef<void>);

    private viewRef: EmbeddedViewRef<void> | null = null;

    constructor() {
        const machine = new PresenceMachine({
            present: inject(RDX_PRESENCE_CONTEXT).present,
            isBrowser: isPlatformBrowser(inject(PLATFORM_ID)),
            injector: inject(Injector),
            mountView: () => this.mountView(),
            destroyView: () => this.destroyView()
        });

        inject(DestroyRef).onDestroy(() => machine.dispose());
    }

    private mountView(): HTMLElement[] {
        this.viewRef = this.viewContainerRef.createEmbeddedView(this.templateRef);
        // Return *all* root elements (not just the first) so a multi-root template — e.g. a backdrop
        // plus content — has the exit animation on any root suspend the unmount. Mirrors
        // `RdxPortalPresence.mountView`, which already watches every relocated root node.
        return (this.viewRef.rootNodes as Node[]).filter((node): node is HTMLElement => node instanceof HTMLElement);
    }

    private destroyView(): void {
        this.viewRef?.destroy();
        this.viewRef = null;
    }
}
