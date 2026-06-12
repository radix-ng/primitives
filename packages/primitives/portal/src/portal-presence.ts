import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
    computed,
    DestroyRef,
    Directive,
    effect,
    EmbeddedViewRef,
    inject,
    Injector,
    input,
    linkedSignal,
    PLATFORM_ID,
    signal,
    TemplateRef,
    ViewContainerRef
} from '@angular/core';
import { PresenceMachine, RDX_PRESENCE_CONTEXT } from '@radix-ng/primitives/presence';
import { RdxPortalContainer, resolvePortalContainer } from './resolve-container';

/**
 * Structural directive merging what `RdxPortal` + `RdxPresenceDirective` did as a pair: it mounts its
 * template while `present()` (from {@link RDX_PRESENCE_CONTEXT}) is `true`, **relocates every root
 * node into a portal container** (default `document.body`), and on close runs the presence exit state
 * machine — keeping the content mounted until every running CSS exit `@keyframes` on any root node
 * finishes.
 *
 * Unlike `RdxPortal`, it adds **no wrapper element**: the template's root nodes become direct children
 * of the container. Use the `*` microsyntax for the common single-root case
 * (`<div *rdxXxxPortal rdxXxxPositioner>`) or the explicit `<ng-template rdxXxxPortal>` form for a
 * custom container or multiple root nodes (e.g. a dialog backdrop + popup).
 *
 * SSR: on the server the view renders in place and is never relocated; after hydration the relocation
 * effect moves the nodes into the container (same browser-guarded split `RdxPortal` uses).
 */
@Directive({
    standalone: true
})
export class RdxPortalPresence {
    private readonly viewContainerRef = inject(ViewContainerRef);
    private readonly templateRef = inject(TemplateRef<void>);
    private readonly document = inject(DOCUMENT, { optional: true });
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    /**
     * Container to portal the content into. Can be an `ElementRef`, a native element, or a CSS
     * selector. Defaults to `document.body` (or when a selector matches nothing).
     */
    readonly container = input<RdxPortalContainer>();

    private readonly _computedContainer = linkedSignal(this.container);

    private readonly elementContainer = computed<HTMLElement | null>(() => {
        const provided = resolvePortalContainer(this._computedContainer(), this.document);
        return provided ?? this.document?.body ?? null;
    });

    /** The live view's root nodes, exposed as a signal so the relocation effect re-runs on (re)mount. */
    private readonly mountedNodes = signal<Node[]>([]);
    private viewRef: EmbeddedViewRef<void> | null = null;

    constructor() {
        const machine = new PresenceMachine({
            present: inject(RDX_PRESENCE_CONTEXT).present,
            isBrowser: this.isBrowser,
            injector: inject(Injector),
            mountView: () => this.mountView(),
            destroyView: () => this.destroyView()
        });

        // Relocate reactively: re-runs whenever the resolved container changes or the view is
        // (re)mounted. On the server we never relocate — the nodes render in place.
        effect(() => {
            const container = this.elementContainer();
            const nodes = this.mountedNodes();
            if (!this.isBrowser || !container) {
                return;
            }
            for (const node of nodes) {
                container.appendChild(node);
            }
        });

        inject(DestroyRef).onDestroy(() => machine.dispose());
    }

    /** Imperatively override the portal container (parity with `RdxPortal.setContainer`). */
    setContainer(container: RdxPortalContainer): void {
        this._computedContainer.set(container);
    }

    private mountView(): HTMLElement[] {
        this.viewRef = this.viewContainerRef.createEmbeddedView(this.templateRef);
        const rootNodes = this.viewRef.rootNodes as Node[];
        this.mountedNodes.set(rootNodes);
        // Watch every element root for exit animations (dialog returns backdrop + popup).
        return rootNodes.filter((node): node is HTMLElement => node instanceof HTMLElement);
    }

    private destroyView(): void {
        // Destroying the view removes the nodes from wherever they currently live (the container) —
        // no anchor-comment juggling, unlike `RdxPortal` which restores its host element.
        this.viewRef?.destroy();
        this.viewRef = null;
        this.mountedNodes.set([]);
    }
}
