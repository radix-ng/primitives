import { isPlatformBrowser } from '@angular/common';
import {
    afterEveryRender,
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
import { createViewAnchor, RdxRenderLifecycle, useRenderLifecycle } from '@radix-ng/primitives/core';
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
    const effectivePresent = () => context.present() && !(options.suspended?.() ?? false);
    const lifecycle: RdxRenderLifecycle =
        context.renderLifecycle ??
        useRenderLifecycle(undefined, {
            open: effectivePresent,
            holdUnmount: options.holdUnmount,
            debugName: 'RdxPresence'
        });
    const nodes = signal<Node[]>([]);
    const mounted = signal(false);
    let view: EmbeddedViewRef<void> | undefined;
    let start: ReturnType<typeof createViewAnchor> | undefined;
    let end: ReturnType<typeof createViewAnchor> | undefined;
    const rootRegistrations = new Map<HTMLElement, () => void>();
    let previous: boolean | undefined;

    // Angular's live rootNodes can omit dehydrated @defer roots. Managed inert boundaries delimit
    // the physical view as well, including nodes that Angular has not instantiated on the client.
    const currentNodes = (): Node[] => {
        if (!start || !end || start.element.parentNode !== end.element.parentNode) return [];
        const roots: Node[] = [];
        let node: Node | null = start.element;
        while (node) {
            roots.push(node);
            if (node === end.element) return roots;
            node = node.nextSibling;
        }
        return [];
    };
    const refreshNodes = () => {
        if (!view) return;
        const roots = currentNodes();
        if (ownLifetime) {
            // A live root can own an attribute Portal and sit outside this physical range. Keep
            // its animation ownership too; rootNodes alone is insufficient for dehydrated roots.
            const elements = new Set(
                [...roots, ...view.rootNodes].filter(
                    (node): node is HTMLElement =>
                        node.nodeType === 1 && !(node as Element).hasAttribute('data-rdx-view-anchor')
                )
            );
            for (const [element, unregister] of rootRegistrations)
                if (!elements.has(element)) {
                    unregister();
                    rootRegistrations.delete(element);
                }
            for (const element of elements)
                if (!rootRegistrations.has(element)) rootRegistrations.set(element, lifecycle.registerElement(element));
        }
        const previous = nodes();
        if (roots.length !== previous.length || roots.some((node, index) => node !== previous[index])) nodes.set(roots);
    };

    if (ownLifetime) {
        effect(
            () => {
                const suspended = options.suspended?.() ?? false;
                const present = context.present() && !suspended;
                const skip = context.skipExitAnimation?.() ?? false;
                untracked(() => {
                    if (!present && (suspended || skip || !isBrowser)) {
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

    const keepMounted = context.keepMounted ?? options.keepMounted ?? (() => false);
    const destroyView = () => {
        // Angular can destroy attached boundary views before this declaring directive's DestroyRef
        // runs. Retain the last observed roots for that path, including unclaimed dehydrated DOM.
        const roots = new Set([...nodes(), ...currentNodes()]);
        for (const unregister of rootRegistrations.values()) unregister();
        rootRegistrations.clear();
        view?.destroy();
        view = undefined;
        start?.destroy();
        end?.destroy();
        start = end = undefined;
        // A dehydrated root may not belong to a live child view yet. Its physical ownership still
        // ends with this Presence; Angular's view destruction handles the corresponding registrations.
        roots.forEach((node) => node.parentNode?.removeChild(node));
        nodes.set([]);
        mounted.set(false);
    };
    effect(
        () => {
            const suspended = options.suspended?.() ?? false;
            const present = context.present();
            const shouldRender = !suspended && (present || lifecycle.mounted() || keepMounted());
            untracked(() => {
                if (shouldRender && !view) {
                    start = createViewAnchor(container);
                    view = container.createEmbeddedView(template);
                    end = createViewAnchor(container);
                    refreshNodes();
                    mounted.set(true);
                } else if (!shouldRender && view) {
                    destroyView();
                }
            });
        },
        { debugName: 'RdxPresence.view' }
    );
    // @defer/@if/@for can change the physical roots without changing presence. Compare identities
    // before publishing so an unchanged view never schedules another Angular render.
    afterEveryRender(() => untracked(refreshNodes));
    const unregister = context.registerPresence?.({
        mounted: mounted.asReadonly(),
        keepMounted,
        suspended: options.suspended,
        pendingExit: () => lifecycle.isExitPending
    });
    inject(DestroyRef).onDestroy(() => {
        destroyView();
        unregister?.();
    });
    return { lifecycle, nodes: nodes.asReadonly(), currentNodes, mounted: mounted.asReadonly() };
}
