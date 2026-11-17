import { computed, DestroyRef, effect, inject, signal, Signal, untracked } from '@angular/core';
import { RdxRenderLifecycle, RdxTransitionStatus, useRenderLifecycle } from '../composables/use-render-lifecycle';

/** A presence host reports its live view separately from the popup's logical open state. */
export interface RdxPopupPresenceRegistration {
    readonly mounted: Signal<boolean>;
    readonly keepMounted: () => boolean;
    /** A missing explicit Portal destination prevents mounting and enter completion. */
    readonly suspended?: () => boolean;
    /** Read only during owner disposal; Presence keeps the actual animation phase. */
    readonly pendingExit?: () => boolean;
}

export interface RdxPopupOpenChangeTransaction {
    /** May be called during the event or later, while this accepted close is still pending. */
    preventUnmountOnClose: () => void;
    /** Call only after an accepted open change has been written to the open model. */
    commit: () => void;
}

export interface RdxPopupLifecycle {
    readonly renderLifecycle: RdxRenderLifecycle;
    readonly present: Signal<boolean>;
    readonly status: Signal<RdxTransitionStatus>;
    registerElement: (element: HTMLElement) => () => void;
    registerPresence: (presence: RdxPopupPresenceRegistration) => () => void;
    prepareOpenChange: (open: boolean, event?: Event) => RdxPopupOpenChangeTransaction;
    /** @internal Call from the owner's ngOnDestroy, before Angular disconnects its outputs. */
    finishPendingCloseOnDestroy: () => void;
    /** Complete a pending close. A stale call while open, or after completion, does nothing. */
    unmount: () => void;
}

/**
 * Coordinates logical open state, automatic CSS completion and a per-close manual unmount opt-out.
 * Presence still owns the Angular view; its registration prevents completion before the view exits.
 * Opening again invalidates the previous close transaction and its late callbacks.
 */
export function usePopupLifecycle(
    open: Signal<boolean>,
    onComplete: (open: boolean) => void,
    debugName = 'RdxPopupLifecycle'
): RdxPopupLifecycle {
    const destroyRef = inject(DestroyRef);
    const closing = signal(false, { debugName: `${debugName}.closing` });
    const deferred = signal(false, { debugName: `${debugName}.deferredUnmount` });
    const transitionComplete = signal(false);
    const forcedUnmount = signal(false);
    const presences = signal<readonly RdxPopupPresenceRegistration[]>([]);
    const exitingPresence = computed(() =>
        presences().some((presence) => presence.mounted() && !presence.keepMounted())
    );

    let previousOpen = untracked(open);
    let enteredOpen = previousOpen;
    let pendingClose: { notify: boolean; framePassed: boolean; immediate?: boolean } | undefined;
    let closingTransition: object | undefined;
    let completionFrame: number | undefined;

    const cancelCompletionFrame = () => {
        if (completionFrame !== undefined) {
            cancelAnimationFrame(completionFrame);
            completionFrame = undefined;
        }
    };

    const finalizeClose = () => {
        cancelCompletionFrame();
        const notify = pendingClose?.notify;
        pendingClose = undefined;
        closing.set(false);
        enteredOpen = false;
        if (notify) onComplete(false);
    };
    const completeClose = (immediate = false) => {
        if (
            destroyRef.destroyed ||
            open() ||
            !pendingClose ||
            deferred() ||
            !transitionComplete() ||
            exitingPresence()
        ) {
            return;
        }
        // Explicit unmount is its own lifecycle boundary. Automatic completion waits for a frame,
        // as Base UI does even without CSS motion, so a native contextmenu can interrupt a close.
        if (immediate || pendingClose.immediate || !pendingClose.notify || pendingClose.framePassed) {
            finalizeClose();
        }
    };

    const transition = useRenderLifecycle(
        (nextOpen) => {
            syncOpen();
            if (nextOpen) {
                if (open() && !destroyRef.destroyed) onComplete(true);
            } else if (pendingClose && !open()) {
                transitionComplete.set(true);
                completeClose();
            }
        },
        { open, debugName }
    );

    const syncOpen = () => {
        const nextOpen = open();
        if (destroyRef.destroyed || nextOpen === previousOpen) return;
        cancelCompletionFrame();
        previousOpen = nextOpen;
        deferred.set(false);
        transitionComplete.set(false);
        forcedUnmount.set(false);
        closingTransition = undefined;
        if (nextOpen) {
            pendingClose = undefined;
            closing.set(false);
        } else {
            // A close before a pending destination ever mounts has no popup transition to finish.
            pendingClose = {
                notify: !presences().some((presence) => presence.suspended?.()),
                framePassed: false
            };
            if (pendingClose.notify) {
                const close = pendingClose;
                completionFrame = requestAnimationFrame(() => {
                    if (pendingClose !== close) return;
                    completionFrame = undefined;
                    close.framePassed = true;
                    completeClose();
                });
            }
            closing.set(true);
        }
    };

    effect(
        () => {
            const isClosing = closing();
            const held = deferred();
            const forced = forcedUnmount();
            untracked(() => {
                if (!isClosing || !pendingClose || open()) return;
                if (held) {
                    transition.cancel();
                    closingTransition = undefined;
                    transitionComplete.set(false);
                } else if (forced) {
                    transition.cancel();
                    transitionComplete.set(true);
                } else if (closingTransition !== pendingClose) {
                    closingTransition = pendingClose;
                    transition.start(false);
                }
            });
        },
        { debugName: `${debugName}.closeOwner` }
    );
    effect(
        () => {
            const nextOpen = open();
            const suspended = presences().some((presence) => presence.suspended?.());
            untracked(() => {
                syncOpen();
                if (nextOpen && suspended) {
                    transition.cancel();
                    enteredOpen = false;
                    return;
                }
                // Native focus can close/reopen in one event before Angular renders. Keep the
                // existing enter transition (or its completed state) when no exit was rendered.
                if (nextOpen === enteredOpen) return;
                enteredOpen = nextOpen;
                if (nextOpen) transition.start(true);
            });
        },
        { debugName: `${debugName}.open` }
    );
    effect(
        () => {
            closing();
            deferred();
            transitionComplete();
            exitingPresence();
            untracked(completeClose);
        },
        { debugName: `${debugName}.closeComplete` }
    );

    destroyRef.onDestroy(() => {
        cancelCompletionFrame();
        pendingClose = undefined;
    });

    return {
        renderLifecycle: transition,
        present: computed(() => open() || deferred()),
        // Visual exit and focus-scope ownership end when CSS/Presence finish. The callback's
        // interruption frame can still be pending after that physical lifetime has ended.
        status: computed(() =>
            closing() && (!transitionComplete() || exitingPresence() || deferred()) ? 'ending' : transition.status()
        ),
        finishPendingCloseOnDestroy: () => {
            // Angular marks the view destroyed before directive hooks, then disconnects outputs.
            // Only this hook window can notify an accepted close; a DestroyRef callback is too late.
            if (
                destroyRef.destroyed &&
                pendingClose &&
                !open() &&
                !deferred() &&
                !transition.isExitPending &&
                !presences().some((presence) => presence.pendingExit?.())
            ) {
                finalizeClose();
            }
        },
        registerElement: transition.registerElement,
        registerPresence: (presence) => {
            presences.update((current) => [...current, presence]);
            return () => presences.update((current) => current.filter((entry) => entry !== presence));
        },
        prepareOpenChange: (nextOpen, event) => {
            syncOpen();
            // Focus can return after a completed rendered exit, before its notification frame.
            // That focus starts a new enter; report the finished exit before it can be discarded.
            if (nextOpen && event?.type === 'focusin') completeClose(true);
            let requested = false;
            let committedClose: object | undefined;
            const preventUnmountOnClose = () => {
                requested = true;
                if (committedClose && committedClose === pendingClose && !open() && !forcedUnmount()) {
                    deferred.set(true);
                }
            };
            return {
                preventUnmountOnClose,
                commit: () => {
                    syncOpen();
                    if (!nextOpen && pendingClose) {
                        committedClose = pendingClose;
                        if (requested) deferred.set(true);
                        // Distinct native events can close and reopen before Angular's next render.
                        // Preserve an atomic close/focus/reopen in one call stack, but start a new
                        // enter completion when the accepted close survives the microtask boundary.
                        const close = pendingClose;
                        queueMicrotask(() => {
                            if (!destroyRef.destroyed && !open() && pendingClose === close) enteredOpen = false;
                        });
                    }
                }
            };
        },
        unmount: () => {
            syncOpen();
            if (open() || !pendingClose || destroyRef.destroyed) return;
            forcedUnmount.set(true);
            deferred.set(false);
            transition.unmount();
            transitionComplete.set(true);
            pendingClose.immediate = true;
            completeClose(true);
        }
    };
}
