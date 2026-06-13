import { afterNextRender, effect, Injector, Signal } from '@angular/core';
import { getMaxTransitionDuration } from '@radix-ng/primitives/core';

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
 * Grace period (ms) added to the longest declared exit duration before the safety-net timer
 * force-completes the exit. Only matters when a `finished` promise never settles (the engine
 * under-reports `getAnimations`, the animation is replaced without a cancel, reduced motion, …).
 * Mirrors `TRANSITION_FALLBACK_BUFFER` in `use-transition-status.ts`.
 */
const EXIT_FALLBACK_BUFFER = 50;

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
 * while a CSS exit animation runs anywhere inside the template — a `@keyframes` **or** a
 * `transition` (`data-ending-style`), on a watched root **or any of its descendants** — and unmounts
 * only once every exit animation started by the close has finished. With no exit animation it
 * unmounts immediately. For a single watched node and a root-level keyframe this reduces exactly to
 * the original `RdxPresenceDirective` behavior.
 *
 * Detection (ADR 0011) uses the Web Animations API: when `present()` flips `false` we snapshot a
 * close timestamp, and after the next render collect `node.getAnimations({ subtree: true })`, keeping
 * only animations that are running/pending and were *started by* the close (`startTime` null or
 * `>= closeTimestamp`). The view stays mounted until all of their `finished` promises settle, bounded
 * by a duration-based safety net. The legacy root-level computed-`animationName` check and the
 * `animationstart`/`animationend` listeners are kept as an additional acceptor — they drive the
 * zoneless jsdom suites (where `getAnimations` is absent) and cost nothing in a real browser.
 */
export class PresenceMachine {
    private state: PresenceState;
    private prevPresent: boolean;

    /** Root nodes currently watched for exit animations (set on mount). */
    private nodes: HTMLElement[] = [];
    /** Last-seen computed `animationName` per node, used to detect a *fresh* root exit animation. */
    private readonly prevAnimationNames = new WeakMap<HTMLElement, string>();
    /** Root nodes whose exit animation the event path is still waiting on (jsdom / root-keyframe). */
    private readonly pendingExits = new Set<HTMLElement>();
    private removeListeners: (() => void) | null = null;

    /**
     * Timeline time captured the moment `present` flipped `false`, on the same clock as
     * `Animation.startTime`. Animations started at or after it are the exit animations.
     */
    private closeTimestamp = 0;
    /**
     * Monotonic counter bumped on every mount/unmount transition. A suspended exit captures it and
     * its `finished`/safety-net resolution is ignored if it changed in the meantime (re-open or a
     * second close), so a stale promise can never tear down a freshly-reopened view.
     */
    private exitVersion = 0;
    /** True while a WAAPI `finished`-promise wait owns completion; gates the event path off. */
    private waapiPending = false;
    private safetyTimer: ReturnType<typeof setTimeout> | null = null;

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
                    // Snapshot the close time *now* (before the render that applies the closed-state
                    // styles) so the freshness filter can tell exit animations from pre-existing ones.
                    this.closeTimestamp = this.now();
                    // Defer the unmount decision until the next render, so the consumer's
                    // `data-state` / `data-ending-style` (and therefore the exit styles) are applied
                    // to the DOM before we read the running animations.
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

        // Legacy acceptor: a watched root whose closed state starts a *different* `@keyframes`.
        // This is what the zoneless jsdom suite drives (via synthetic `animationstart`/`animationend`)
        // and what catches root keyframes in engines that do not expose `getAnimations`.
        for (const node of this.nodes) {
            const styles = getComputedStyle(node);
            const currentAnimationName = styles.animationName || 'none';
            const prevAnimationName = this.prevAnimationNames.get(node) ?? 'none';

            const isAnimating =
                currentAnimationName !== 'none' &&
                styles.display !== 'none' &&
                prevAnimationName !== currentAnimationName;

            if (isAnimating) {
                this.pendingExits.add(node);
            }
        }

        // WAAPI acceptor (ADR 0011): subtree-aware, transitions *or* keyframes, on any element in the
        // template. This is what makes popup-level exits work without a positioner decoy keyframe.
        const exitAnimations = this.collectExitAnimations();

        if (this.pendingExits.size === 0 && exitAnimations.length === 0) {
            // Nothing runs a fresh exit animation — unmount right away.
            this.send('UNMOUNT');
            return;
        }

        this.send('ANIMATION_OUT');

        if (exitAnimations.length > 0) {
            // WAAPI sees the whole subtree, so it supersedes the root-event path for this close:
            // wait for every fresh exit animation, version-guarded against re-open.
            this.waapiPending = true;
            const version = this.exitVersion;

            void Promise.all(exitAnimations.map((animation) => animation.finished.catch(() => undefined))).then(() =>
                this.finishExit(version)
            );

            this.armSafetyNet(version, exitAnimations);
        }
        // else: no WAAPI animations (jsdom, or an engine without `getAnimations`) → the root-event
        // path drains `pendingExits` through `onEnd`, exactly as before this ADR.
    }

    /**
     * Running/pending animations across the watched subtrees that were *started by* the close.
     * Pre-existing animations (an infinite spinner, a settled enter) have an earlier `startTime`
     * and must not delay the unmount.
     */
    private collectExitAnimations(): Animation[] {
        if (!this.host.isBrowser) {
            return [];
        }

        const result: Animation[] = [];

        for (const node of this.nodes) {
            if (typeof node.getAnimations !== 'function') {
                continue;
            }

            for (const animation of node.getAnimations({ subtree: true })) {
                const fresh = animation.startTime === null || Number(animation.startTime) >= this.closeTimestamp;

                // `animation.pending` is the WAAPI "created but not yet started this frame" flag — a
                // freshly triggered exit. `playState` itself never reports `'pending'`.
                if ((animation.playState === 'running' || animation.pending) && fresh) {
                    result.push(animation);
                }
            }
        }

        return result;
    }

    /**
     * Force-completes the exit shortly after the longest declared duration, in case a `finished`
     * promise never settles. Measures the animated targets (falling back to the roots).
     */
    private armSafetyNet(version: number, exitAnimations: Animation[]): void {
        const targets = new Set<HTMLElement>(this.nodes);

        for (const animation of exitAnimations) {
            const target = (animation.effect as KeyframeEffect | null)?.target;
            if (target instanceof HTMLElement) {
                targets.add(target);
            }
        }

        let maxDuration = 0;
        for (const element of targets) {
            maxDuration = Math.max(maxDuration, getMaxTransitionDuration(element));
        }

        this.clearSafetyNet();
        this.safetyTimer = setTimeout(() => this.finishExit(version), maxDuration + EXIT_FALLBACK_BUFFER);
    }

    /** Settle a WAAPI/safety-net exit wait, ignoring it if a newer mount/unmount superseded it. */
    private finishExit(version: number): void {
        if (version !== this.exitVersion) {
            return;
        }
        this.waapiPending = false;
        this.clearSafetyNet();
        this.send('ANIMATION_END');
    }

    private clearSafetyNet(): void {
        if (this.safetyTimer !== null) {
            clearTimeout(this.safetyTimer);
            this.safetyTimer = null;
        }
    }

    private send(event: PresenceEvent): void {
        const next = MACHINE[this.state][event];
        if (next === undefined || next === this.state) {
            return;
        }

        this.state = next;

        if (next === 'mounted') {
            // Bump the version so any in-flight exit wait from a prior close is ignored.
            this.exitVersion++;
            this.waapiPending = false;
            this.clearSafetyNet();

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
            this.exitVersion++;
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
        this.clearSafetyNet();
        this.waapiPending = false;
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
            // While a WAAPI wait owns completion it is authoritative (it sees the full subtree); the
            // event path only drives the unmount when no WAAPI animations were detected.
            if (!this.waapiPending && this.pendingExits.size === 0) {
                this.finishExit(this.exitVersion);
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

    /** Current timeline time on the same clock as `Animation.startTime` (ms), or 0 if unavailable. */
    private now(): number {
        const time = typeof document !== 'undefined' ? document.timeline?.currentTime : null;
        return typeof time === 'number' ? time : Number(time ?? 0);
    }
}
