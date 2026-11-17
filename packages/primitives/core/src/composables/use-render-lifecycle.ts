import { isPlatformBrowser } from '@angular/common';
import {
    afterNextRender,
    AfterRenderRef,
    DestroyRef,
    effect,
    inject,
    Injector,
    PLATFORM_ID,
    signal,
    Signal,
    untracked
} from '@angular/core';
import { waitForAnimations } from '../dom/wait-for-animations';

export type RdxTransitionStatus = 'starting' | 'ending' | undefined;

export interface RdxRenderLifecycle {
    /** Logical render lifetime; a Portal may retain its physical view with keepMounted. */
    readonly mounted: Signal<boolean>;
    readonly status: Signal<RdxTransitionStatus>;
    /** Actual CSS motion is pending, independent of a minimum frame or manual hold. */
    readonly isExitPending: boolean;
    registerElement: (element: HTMLElement) => () => void;
    start: (open: boolean) => void;
    /** Cancels observation and clears the phase while preserving the live view. */
    cancel: () => void;
    /** Ends the render lifetime immediately, without a completion notification. */
    unmount: () => void;
}

export interface RdxRenderLifecycleOptions {
    /** Reads current intent in an animation callback, before the next render effect can run. */
    open?: () => boolean;
    /** An owner boundary, such as the first outgoing Tabs frame, can postpone removal. */
    holdUnmount?: () => boolean;
    debugName?: string;
}

/**
 * Signal-owned render lifetime shared by popups, panels, indicators and structural Presence.
 * The owner drives committed open changes; DOM adapters consume mounted and register animation
 * elements. Reopening invalidates pending work and preserves the same Angular view.
 */
export function useRenderLifecycle(
    onComplete: (open: boolean) => void = () => {},
    options: RdxRenderLifecycleOptions = {}
): RdxRenderLifecycle {
    const injector = inject(Injector);
    const destroyRef = inject(DestroyRef);
    const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    const name = options.debugName ?? 'RdxRenderLifecycle';
    const mounted = signal(false, { debugName: `${name}.mounted` });
    const status = signal<RdxTransitionStatus>(undefined, { debugName: `${name}.status` });
    const exitReady = signal(false);
    const elements = new Map<HTMLElement, number>();
    let controller: AbortController | undefined;
    let render: AfterRenderRef | undefined;
    let frame: number | undefined;
    let version = 0;
    let active = false;
    let pendingMotion = false;

    const clearWork = () => {
        controller?.abort();
        controller = undefined;
        render?.destroy();
        render = undefined;
        if (frame !== undefined) cancelAnimationFrame(frame);
        frame = undefined;
        pendingMotion = false;
    };
    const cancel = () => {
        version++;
        active = false;
        clearWork();
        exitReady.set(false);
        status.set(undefined);
    };
    const finish = (open: boolean, currentVersion: number) => {
        if (!active || currentVersion !== version || destroyRef.destroyed) return;
        if (options.open && options.open() !== open) {
            // Current signals are authoritative even when their render effect has not run yet.
            cancel();
            return;
        }
        if (!open && options.holdUnmount?.()) {
            exitReady.set(true);
            return;
        }
        active = false;
        clearWork();
        exitReady.set(false);
        if (!open) mounted.set(false);
        status.set(undefined);
        onComplete(open);
    };
    effect(
        () => {
            const ready = exitReady();
            const held = options.holdUnmount?.() ?? false;
            if (ready && !held) untracked(() => finish(false, version));
        },
        { debugName: `${name}.unmountBoundary` }
    );
    destroyRef.onDestroy(() => {
        version++;
        active = false;
        clearWork();
        elements.clear();
    });

    return {
        mounted: mounted.asReadonly(),
        status: status.asReadonly(),
        get isExitPending() {
            return status() === 'ending' && pendingMotion;
        },
        registerElement: (element) => {
            elements.set(element, (elements.get(element) ?? 0) + 1);
            let registered = true;
            return () => {
                if (!registered) return;
                registered = false;
                const count = elements.get(element) ?? 0;
                if (count <= 1) elements.delete(element);
                else elements.set(element, count - 1);
            };
        },
        start: (open) => {
            if (destroyRef.destroyed) return;
            const currentVersion = ++version;
            clearWork();
            active = true;
            exitReady.set(false);
            mounted.set(true);
            status.set(open ? 'starting' : 'ending');
            if (!isBrowser) {
                finish(open, currentVersion);
                return;
            }
            const wait = () => {
                if (destroyRef.destroyed || currentVersion !== version) return;
                controller = new AbortController();
                waitForAnimations(
                    [...elements.keys()],
                    () => finish(open, currentVersion),
                    controller.signal,
                    (pending) => {
                        pendingMotion = pending;
                    }
                );
            };
            render = afterNextRender(
                () => {
                    render = undefined;
                    if (destroyRef.destroyed || currentVersion !== version) return;
                    if (open) {
                        frame = requestAnimationFrame(() => {
                            frame = undefined;
                            if (destroyRef.destroyed || currentVersion !== version) return;
                            status.set(undefined);
                            // Read after host bindings have removed data-starting-style.
                            render = afterNextRender(wait, { injector });
                        });
                    } else {
                        wait();
                    }
                },
                { injector }
            );
        },
        cancel,
        unmount: () => {
            cancel();
            mounted.set(false);
        }
    };
}
