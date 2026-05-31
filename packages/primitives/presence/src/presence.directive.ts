import { isPlatformBrowser } from '@angular/common';
import {
    afterNextRender,
    DestroyRef,
    Directive,
    effect,
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
 * Headless structural directive that conditionally renders its template based on a reactive
 * `present` signal supplied through {@link RDX_PRESENCE_CONTEXT}.
 *
 * Unlike a plain `*ngIf`, it keeps the content mounted while a CSS exit animation
 * (`@keyframes` applied for the closed state) is running, and unmounts it only once that
 * animation finishes. If the content has no exit animation, it unmounts immediately.
 */
@Directive({
    standalone: true
})
export class RdxPresenceDirective {
    private readonly context = inject(RDX_PRESENCE_CONTEXT);
    private readonly viewContainerRef = inject(ViewContainerRef);
    private readonly templateRef = inject(TemplateRef<void>);
    private readonly injector = inject(Injector);
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    private viewRef: EmbeddedViewRef<void> | null = null;
    private node: HTMLElement | null = null;
    private removeListeners: (() => void) | null = null;

    private state: PresenceState;
    private prevPresent: boolean;
    private prevAnimationName = 'none';

    constructor() {
        this.prevPresent = this.context.present();
        this.state = this.prevPresent ? 'mounted' : 'unmounted';

        if (this.prevPresent) {
            this.mountView();
        }

        effect(() => {
            const present = this.context.present();

            if (present === this.prevPresent) {
                return;
            }
            this.prevPresent = present;

            if (present) {
                // Mount synchronously so the enter animation can start on this frame.
                this.send('MOUNT');
            } else if (this.isBrowser) {
                // Defer the unmount decision until the next render, so the consumer's
                // `data-state` (and therefore the exit `@keyframes`) is applied to the DOM
                // before we read the computed animation name.
                afterNextRender(() => this.evaluateExit(), { injector: this.injector });
            } else {
                this.send('UNMOUNT');
            }
        });

        inject(DestroyRef).onDestroy(() => this.destroyView());
    }

    /** Decides whether to suspend the unmount for an exit animation (port of Radix' logic). */
    private evaluateExit(): void {
        // Re-opened before this callback ran — keep the content mounted.
        if (this.state !== 'mounted' || this.context.present()) {
            return;
        }

        const styles = this.getComputedStyles();
        const currentAnimationName = styles?.animationName || 'none';

        if (currentAnimationName === 'none' || styles?.display === 'none') {
            // No exit animation (or the element is hidden) — unmount right away.
            this.send('UNMOUNT');
        } else {
            // Only suspend the unmount if the closed state actually starts a *different* animation.
            const isAnimating = this.prevAnimationName !== currentAnimationName;
            this.send(isAnimating ? 'ANIMATION_OUT' : 'UNMOUNT');
        }
    }

    private send(event: PresenceEvent): void {
        const next = MACHINE[this.state][event];
        if (next === undefined || next === this.state) {
            return;
        }

        this.state = next;

        if (next === 'mounted') {
            if (this.viewRef) {
                // Re-opened while an exit animation was running — refresh the tracked animation.
                this.prevAnimationName = this.getAnimationName();
            } else {
                this.mountView();
            }
        } else if (next === 'unmounted') {
            this.destroyView();
        }
        // `unmountSuspended` keeps the existing view mounted until ANIMATION_END.
    }

    private mountView(): void {
        this.viewRef = this.viewContainerRef.createEmbeddedView(this.templateRef);
        this.node = this.viewRef.rootNodes.find((n): n is HTMLElement => n instanceof HTMLElement) ?? null;

        if (this.node && this.isBrowser) {
            this.prevAnimationName = this.getAnimationName();
            this.addAnimationListeners(this.node);
        }
    }

    private destroyView(): void {
        this.removeListeners?.();
        this.removeListeners = null;
        this.viewRef?.destroy();
        this.viewRef = null;
        this.node = null;
    }

    private addAnimationListeners(node: HTMLElement): void {
        const onStart = (event: AnimationEvent) => {
            if (event.target === node) {
                this.prevAnimationName = this.getAnimationName();
            }
        };
        const onEnd = (event: AnimationEvent) => {
            const isCurrentAnimation = this.getAnimationName().includes(event.animationName);
            if (event.target === node && isCurrentAnimation) {
                this.send('ANIMATION_END');
            }
        };

        node.addEventListener('animationstart', onStart);
        node.addEventListener('animationcancel', onEnd);
        node.addEventListener('animationend', onEnd);

        this.removeListeners = () => {
            node.removeEventListener('animationstart', onStart);
            node.removeEventListener('animationcancel', onEnd);
            node.removeEventListener('animationend', onEnd);
        };
    }

    private getComputedStyles(): CSSStyleDeclaration | null {
        return this.node && this.isBrowser ? getComputedStyle(this.node) : null;
    }

    private getAnimationName(): string {
        return this.getComputedStyles()?.animationName || 'none';
    }
}
