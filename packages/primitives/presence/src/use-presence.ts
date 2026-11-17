import { isPlatformBrowser } from '@angular/common';
import {
    DestroyRef,
    effect,
    EmbeddedViewRef,
    inject,
    PLATFORM_ID,
    signal,
    TemplateRef,
    untracked,
    ViewContainerRef
} from '@angular/core';
import { RdxRenderLifecycle, useRenderLifecycle } from '@radix-ng/primitives/core';
import type { RdxPresenceContext } from './presence.directive';

/** Angular view adapter. Shared Root lifetimes never acquire a second animation observer here. */
export function usePresence(
    context: RdxPresenceContext,
    options: { keepMounted?: () => boolean; suspended?: () => boolean; holdUnmount?: () => boolean } = {}
) {
    const template = inject(TemplateRef<void>);
    const container = inject(ViewContainerRef);
    const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    const ownLifetime = !context.renderLifecycle;
    const lifecycle: RdxRenderLifecycle =
        context.renderLifecycle ??
        useRenderLifecycle(undefined, {
            open: context.present,
            holdUnmount: options.holdUnmount,
            debugName: 'RdxPresence'
        });
    const nodes = signal<Node[]>([]);
    const mounted = signal(false);
    let view: EmbeddedViewRef<void> | undefined;
    let unregisterRoots: (() => void)[] = [];
    let previous: boolean | undefined;

    if (ownLifetime) {
        effect(
            () => {
                const present = context.present() && !options.suspended?.();
                const skip = context.skipExitAnimation?.() ?? false;
                untracked(() => {
                    if (!present && (skip || !isBrowser)) {
                        lifecycle.unmount();
                    } else if (present !== previous && (present || previous !== undefined)) {
                        lifecycle.start(present);
                    }
                    previous = present;
                });
            },
            { debugName: 'RdxPresence.intent' }
        );
    }

    const destroyView = () => {
        unregisterRoots.forEach((unregister) => unregister());
        unregisterRoots = [];
        view?.destroy();
        view = undefined;
        nodes.set([]);
        mounted.set(false);
    };
    effect(
        () => {
            const suspended = options.suspended?.() ?? false;
            const present = context.present();
            const shouldRender = !suspended && (present || lifecycle.mounted() || (options.keepMounted?.() ?? false));
            untracked(() => {
                if (shouldRender && !view) {
                    view = container.createEmbeddedView(template);
                    const roots = view.rootNodes as Node[];
                    // A standalone utility observes its template roots. Popup lifetimes use the
                    // semantic Popup/Backdrop registrations instead of arbitrary portal descendants.
                    if (ownLifetime)
                        unregisterRoots = roots
                            .filter((node) => node.nodeType === 1)
                            .map((node) => lifecycle.registerElement(node as HTMLElement));
                    nodes.set(roots);
                    mounted.set(true);
                } else if (!shouldRender && view) {
                    destroyView();
                }
            });
        },
        { debugName: 'RdxPresence.view' }
    );
    const unregister = context.registerPresence?.({
        mounted: mounted.asReadonly(),
        keepMounted: options.keepMounted ?? (() => false),
        suspended: options.suspended,
        pendingExit: () => lifecycle.isExitPending
    });
    inject(DestroyRef).onDestroy(() => {
        destroyView();
        unregister?.();
    });
    return { lifecycle, nodes: nodes.asReadonly(), mounted: mounted.asReadonly() };
}
