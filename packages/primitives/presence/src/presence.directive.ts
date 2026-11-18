import { Directive, inject, InjectionToken, Provider, Signal } from '@angular/core';
import type { RdxPopupPresenceRegistration, RdxRenderLifecycle } from '@radix-ng/primitives/core';
import { providePresenceTargetContext } from './presence-target';
import { usePresence } from './use-presence';

/**
 * Context interface for RdxPresence directive
 * Contains a Signal that indicates whether the content should be present in the DOM
 */
export type RdxPresenceContext = {
    present: Signal<boolean>;
    /** A semantic owner supplies the lifetime; the structural directive only renders its view. */
    renderLifecycle?: RdxRenderLifecycle;
    /** A composed Portal can supply retention through its own public input. */
    keepMounted?: Signal<boolean>;
    skipExitAnimation?: Signal<boolean>;
    registerPresence?: (presence: RdxPopupPresenceRegistration) => () => void;
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

/**
 * Headless structural directive that conditionally renders its template based on a reactive
 * `present` signal supplied through {@link RDX_PRESENCE_CONTEXT}.
 *
 * Its signal-owned lifetime retains the live Angular view through finite root exit animations.
 * Add rdxPresenceTarget to include an animated descendant explicitly. A semantic owner may supply
 * its existing renderLifecycle, in which case this directive only creates/destroys the view.
 */
@Directive({
    standalone: true,
    providers: [providePresenceTargetContext(() => inject(RdxPresenceDirective).presence.lifecycle)]
})
export class RdxPresenceDirective {
    /** @internal Shared with an explicitly registered rdxPresenceTarget. */
    readonly presence = usePresence(inject(RDX_PRESENCE_CONTEXT));
}
