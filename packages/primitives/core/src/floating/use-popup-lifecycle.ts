import { computed, DestroyRef, effect, inject, signal, Signal, untracked } from '@angular/core';
import { RdxTransitionStatus, useTransitionStatus } from '../composables/use-transition-status';

/** A presence host reports its live view separately from the popup's logical open state. */
export interface RdxPopupPresenceRegistration {
    readonly mounted: Signal<boolean>;
    readonly keepMounted: () => boolean;
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
    readonly present: Signal<boolean>;
    readonly status: Signal<RdxTransitionStatus>;
    readonly skipExitAnimation: Signal<boolean>;
    registerElement: (element: HTMLElement) => () => void;
    registerPresence: (presence: RdxPopupPresenceRegistration) => () => void;
    prepareOpenChange: (open: boolean) => RdxPopupOpenChangeTransaction;
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
    const skipExitAnimation = signal(false);
    const presences = signal<readonly RdxPopupPresenceRegistration[]>([]);
    const exitingPresence = computed(() =>
        presences().some((presence) => presence.mounted() && !presence.keepMounted())
    );
    const disposablePresence = computed(() => presences().some((presence) => !presence.keepMounted()));

    let previousOpen = untracked(open);
    let enteredOpen = previousOpen;
    let pendingClose: object | undefined;
    let closingTransition: object | undefined;

    const finalizeClose = () => {
        pendingClose = undefined;
        closing.set(false);
        enteredOpen = false;
        onComplete(false);
    };
    const completeClose = () => {
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
        // Explicit completion is a lifecycle boundary even if unmount() ran before the render effect.
        finalizeClose();
    };

    const transition = useTransitionStatus((nextOpen) => {
        syncOpen();
        if (nextOpen) {
            if (open() && !destroyRef.destroyed) onComplete(true);
        } else if (pendingClose && !open()) {
            transitionComplete.set(true);
            completeClose();
        }
    });

    const syncOpen = () => {
        const nextOpen = open();
        if (destroyRef.destroyed || nextOpen === previousOpen) return;
        previousOpen = nextOpen;
        deferred.set(false);
        transitionComplete.set(false);
        skipExitAnimation.set(false);
        closingTransition = undefined;
        if (nextOpen) {
            pendingClose = undefined;
            closing.set(false);
        } else {
            pendingClose = {};
            closing.set(true);
        }
    };

    effect(
        () => {
            const isClosing = closing();
            const held = deferred();
            const disposedByPresence = disposablePresence();
            const forced = skipExitAnimation();
            untracked(() => {
                if (!isClosing || !pendingClose || open()) return;
                if (held) {
                    transition.cancel();
                    closingTransition = undefined;
                    transitionComplete.set(false);
                } else if (disposedByPresence || forced) {
                    // Presence alone waits for a disposable Angular view's CSS exit. A retained
                    // view has no removal lifecycle, so only that case needs a separate CSS wait.
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
            untracked(() => {
                syncOpen();
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
        pendingClose = undefined;
    });

    return {
        present: computed(() => open() || deferred()),
        status: computed(() => (closing() ? 'ending' : transition.status())),
        skipExitAnimation: skipExitAnimation.asReadonly(),
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
        prepareOpenChange: (nextOpen) => {
            syncOpen();
            let requested = false;
            let committedClose: object | undefined;
            const preventUnmountOnClose = () => {
                requested = true;
                if (committedClose && committedClose === pendingClose && !open() && !skipExitAnimation()) {
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
            skipExitAnimation.set(true);
            deferred.set(false);
            transition.cancel();
            transitionComplete.set(true);
            completeClose();
        }
    };
}
