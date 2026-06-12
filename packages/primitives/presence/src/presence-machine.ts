import { afterNextRender, effect, Injector, Signal } from '@angular/core';

type PresenceState = 'mounted' | 'unmountSuspended' | 'unmounted';
type PresenceEvent = 'MOUNT' | 'UNMOUNT' | 'ANIMATION_OUT' | 'ANIMATION_END';

/**
 * State machine mirroring `@radix-ui/react-presence`.
 *
 * - `mounted`           — content rendered, `present` is `true`.
 * - `unmountSuspended`  — `present` flipped to `false` but an exit animation is running;
 *                         the content stays in the DOM until the animation ends.
 * - `unmounted`         — content removed.
 */
const MACHINE: Record<PresenceState, Partial<Record<PresenceEvent, PresenceState>>> = {
    mounted: { UNMOUNT: 'unmounted', ANIMATION_OUT: 'unmountSuspended' },
    unmountSuspended: { MOUNT: 'mounted', ANIMATION_END: 'unmounted' },
    unmounted: { MOUNT: 'mounted' }
};

/**
 * Operations the host directive supplies to {@link PresenceMachine}. The machine owns *when* the
 * view is mounted/unmounted (the state transitions and exit-animation suspension); the host owns
 * *how* — `RdxPresenceDirective` simply creates the embedded view in place, while `RdxPortalPresence`
 * additionally relocates its root nodes into a portal container.
 */
export interface PresenceMachineHost {
    /** Reactive `present` flag driving the machine. */
    readonly present: Signal<boolean>;
    /** Whether we are running in a browser (animation/computed-style logic is skipped on the server). */
    readonly isBrowser: boolean;
    /** Injection context for the internal `effect` / `afterNextRender`. */
    readonly injector: Injector;
    /**
     * Create (and, for the portal, relocate) the view. Returns the root `HTMLElement` nodes whose
     * exit animations should suspend the unmount. For a single-root template this is one element —
     * identical to the previous single-node behavior; dialog-shaped templates return backdrop + popup.
     */
    mountView(): HTMLElement[];
    /** Destroy the view (Angular removes the nodes from wherever they currently live). */
    destroyView(): void;
}

/**
 * Reusable presence state machine extracted from `RdxPresenceDirective`. It keeps content mounted
 * while a CSS exit animation (`@keyframes` applied for the closed state) is running on *any* watched
 * root node, and unmounts only once every running exit animation has finished. With no exit
 * animation it unmounts immediately. For a single watched node this reduces exactly to the original
 * `RdxPresenceDirective` behavior.
 */
export class PresenceMachine {
    private state: PresenceState;
    private prevPresent: boolean;

    /** Root nodes currently watched for exit animations (set on mount). */
    private nodes: HTMLElement[] = [];
    /** Last-seen computed `animationName` per node, used to detect a *fresh* exit animation. */
    private readonly prevAnimationNames = new WeakMap<HTMLElement, string>();
    /** Nodes whose exit animation we are still waiting on before unmounting. */
    private readonly pendingExits = new Set<HTMLElement>();
    private removeListeners: (() => void) | null = null;

    constructor(private readonly host: PresenceMachineHost) {
        this.prevPresent = host.present();
        this.state = this.prevPresent ? 'mounted' : 'unmounted';

        if (this.prevPresent) {
            this.mount();
        }

        effect(
            () => {
                const present = host.present();

                if (present === this.prevPresent) {
                    return;
                }
                this.prevPresent = present;

                if (present) {
                    // Mount synchronously so the enter animation can start on this frame.
                    this.send('MOUNT');
                } else if (host.isBrowser) {
                    // Defer the unmount decision until the next render, so the consumer's
                    // `data-state` (and therefore the exit `@keyframes`) is applied to the DOM
                    // before we read the computed animation name.
                    afterNextRender(() => this.evaluateExit(), { injector: host.injector });
                } else {
                    this.send('UNMOUNT');
                }
            },
            { injector: host.injector }
        );
    }

    /** Tear the machine down — destroys the view. Call from the host's `DestroyRef`. */
    dispose(): void {
        this.unmount();
    }

    /** Decides whether to suspend the unmount for an exit animation (port of Radix' logic). */
    private evaluateExit(): void {
        // Re-opened before this callback ran — keep the content mounted.
        if (this.state !== 'mounted' || this.host.present()) {
            return;
        }

        this.pendingExits.clear();

        for (const node of this.nodes) {
            const styles = getComputedStyle(node);
            const currentAnimationName = styles.animationName || 'none';
            const prevAnimationName = this.prevAnimationNames.get(node) ?? 'none';

            // Only suspend for a node whose closed state actually starts a *different* animation
            // (and that is not hidden).
            const isAnimating =
                currentAnimationName !== 'none' &&
                styles.display !== 'none' &&
                prevAnimationName !== currentAnimationName;

            if (isAnimating) {
                this.pendingExits.add(node);
            }
        }

        // No root runs a fresh exit animation — unmount right away. Otherwise suspend until every
        // pending exit animation has finished.
        this.send(this.pendingExits.size === 0 ? 'UNMOUNT' : 'ANIMATION_OUT');
    }

    private send(event: PresenceEvent): void {
        const next = MACHINE[this.state][event];
        if (next === undefined || next === this.state) {
            return;
        }

        this.state = next;

        if (next === 'mounted') {
            if (this.nodes.length > 0) {
                // Re-opened while an exit animation was running — refresh the tracked animations and
                // drop any pending exits so a late `animationend` cannot tear down the live view.
                this.pendingExits.clear();
                for (const node of this.nodes) {
                    this.prevAnimationNames.set(node, this.getAnimationName(node));
                }
            } else {
                this.mount();
            }
        } else if (next === 'unmounted') {
            this.unmount();
        }
        // `unmountSuspended` keeps the existing view mounted until ANIMATION_END.
    }

    private mount(): void {
        this.nodes = this.host.mountView();

        if (this.host.isBrowser && this.nodes.length > 0) {
            for (const node of this.nodes) {
                this.prevAnimationNames.set(node, this.getAnimationName(node));
            }
            this.addAnimationListeners();
        }
    }

    private unmount(): void {
        this.removeListeners?.();
        this.removeListeners = null;
        this.host.destroyView();
        this.nodes = [];
        this.pendingExits.clear();
    }

    private addAnimationListeners(): void {
        const onStart = (event: AnimationEvent) => {
            const node = event.target as HTMLElement;
            if (this.nodes.includes(node)) {
                this.prevAnimationNames.set(node, this.getAnimationName(node));
            }
        };
        const onEnd = (event: AnimationEvent) => {
            const node = event.target as HTMLElement;
            if (!this.nodes.includes(node)) {
                return;
            }
            // Ignore the end of an animation other than the one we are currently waiting on.
            if (!this.getAnimationName(node).includes(event.animationName)) {
                return;
            }

            this.pendingExits.delete(node);
            if (this.pendingExits.size === 0) {
                this.send('ANIMATION_END');
            }
        };

        for (const node of this.nodes) {
            node.addEventListener('animationstart', onStart);
            node.addEventListener('animationcancel', onEnd);
            node.addEventListener('animationend', onEnd);
        }

        this.removeListeners = () => {
            for (const node of this.nodes) {
                node.removeEventListener('animationstart', onStart);
                node.removeEventListener('animationcancel', onEnd);
                node.removeEventListener('animationend', onEnd);
            }
        };
    }

    private getAnimationName(node: HTMLElement): string {
        return (this.host.isBrowser ? getComputedStyle(node).animationName : '') || 'none';
    }
}
