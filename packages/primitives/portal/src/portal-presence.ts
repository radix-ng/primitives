import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
    afterRenderEffect,
    booleanAttribute,
    computed,
    Directive,
    inject,
    InjectionToken,
    input,
    linkedSignal,
    PLATFORM_ID,
    untracked,
    ViewContainerRef
} from '@angular/core';
import { providePresenceTargetContext, RDX_PRESENCE_CONTEXT, usePresence } from '@radix-ng/primitives/presence';
import { movePortalNodes } from './move-nodes';
import { RDX_PORTAL_RELOCATION } from './portal-context';
import { RdxPortalContainer, RdxPortalTarget, resolvePortalContainer } from './resolve-container';

/** @internal Logical declaration position, independent of the portal's mount/destruction lifetime. */
export const RDX_PORTAL_ANCHOR = new InjectionToken<Node>('RdxPortalAnchor');

/**
 * Structural directive merging what `RdxPortal` + `RdxPresenceDirective` did as a pair: it mounts its
 * template while `present()` (from {@link RDX_PRESENCE_CONTEXT}) is `true`, **relocates every root
 * node into a portal container** (default `document.body`), and retains the live view until its signal-owned render lifetime ends. Popup Roots supply their
 * existing lifetime; standalone portals observe finite animations on their roots and explicit targets.
 *
 * Unlike `RdxPortal`, it adds **no wrapper element**: the template's root nodes become direct children
 * of the container. Use the `*` microsyntax for the common single-root case
 * (`<div *rdxXxxPortal rdxXxxPositioner>`) or the explicit `<ng-template rdxXxxPortal>` form for a
 * custom container or multiple root nodes (e.g. a dialog backdrop + popup).
 *
 * SSR: the view renders in place. Browser render hooks move its managed physical range, including
 * still-dehydrated @defer roots and roots materialized later. Inert template boundaries participate
 * in Angular hydration; authored content remains a direct child of the destination.
 */
@Directive({
    standalone: true,
    providers: [
        { provide: RDX_PORTAL_RELOCATION, useFactory: () => inject(RdxPortalPresence) },
        { provide: RDX_PORTAL_ANCHOR, useFactory: () => inject(ViewContainerRef).element.nativeElement as Node },
        providePresenceTargetContext(() => inject(RdxPortalPresence).presence.lifecycle)
    ]
})
export class RdxPortalPresence {
    private readonly document = inject(DOCUMENT, { optional: true });
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    private readonly parentPortal = inject(RDX_PORTAL_RELOCATION, { skipSelf: true, optional: true });

    /**
     * Container to portal the content into. Can be a ShadowRoot, an HTML element from any window,
     * an ElementRef of either, or a CSS
     * selector. Defaults to `document.body` (or when a selector matches nothing).
     * Explicit null prevents mounting until a target is provided, even with keepMounted.
     */
    readonly container = input<RdxPortalContainer>();

    /**
     * Keep the portal mounted (in the container) while the layer is closed. When `true` the content
     * stays in the DOM regardless of the {@link RDX_PRESENCE_CONTEXT} `present` flag — the consumer is
     * responsible for hiding it while closed (typically via the `data-closed` / `data-open` state on the
     * positioner). Any `*rdxXxxPortal` wrapper opts in by mapping this input in its `hostDirectives`.
     */
    readonly keepMounted = input(false, { transform: booleanAttribute });

    /** The layer's own open/present flag, OR'd with {@link keepMounted} to gate mount/unmount. */
    private readonly presenceContext = inject(RDX_PRESENCE_CONTEXT);
    private readonly _computedContainer = linkedSignal(this.container);
    private readonly pendingContainer = computed(() => this._computedContainer() === null);
    private readonly elementContainer = computed<RdxPortalTarget | null>(() => {
        const container = this._computedContainer();
        if (container === null) return null;
        const provided = resolvePortalContainer(container, this.document);
        return provided ?? this.document?.body ?? null;
    });

    /** @internal Shared with explicit Presence animation targets. */
    readonly presence = usePresence(this.presenceContext, {
        keepMounted: this.keepMounted,
        suspended: this.pendingContainer
    });

    constructor() {
        // Relocate reactively: re-runs whenever the resolved container changes or the view is
        // (re)mounted. On the server we never relocate — the nodes render in place.
        afterRenderEffect({
            // Finish relocation before mixedReadWrite focus/isolation hooks inspect ancestry.
            write: () => this.relocate()
        });
    }

    /** @internal Keep declaring portals before their nested destinations in DOM stacking order. */
    relocate(): void {
        if (!this.isBrowser) return;
        untracked(() => this.parentPortal?.relocate());
        const container = this.elementContainer();
        this.presence.nodes();
        if (container) movePortalNodes(this.presence.currentNodes(), container);
    }

    /** Imperatively override the portal container (parity with `RdxPortal.setContainer`). */
    setContainer(container: RdxPortalContainer | undefined): void {
        this._computedContainer.set(container);
    }
}
