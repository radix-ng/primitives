import {
    Directive,
    effect,
    inject,
    InjectionToken,
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

@Directive()
export class RdxPresenceDirective {
    private readonly context = inject(RDX_PRESENCE_CONTEXT);
    private readonly viewContainerRef = inject(ViewContainerRef);
    private readonly templateRef = inject(TemplateRef<RdxPresenceContext>);

    private effectRef = effect((onCleanup) => {
        if (this.context.present()) {
            const view = this.viewContainerRef.createEmbeddedView(this.templateRef, { $implicit: this.context });

            onCleanup(() => view.destroy());
        }
    });
}
