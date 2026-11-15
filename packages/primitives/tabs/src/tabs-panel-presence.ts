import { isPlatformBrowser } from '@angular/common';
import {
    DestroyRef,
    Directive,
    EmbeddedViewRef,
    inject,
    Injector,
    PLATFORM_ID,
    signal,
    TemplateRef,
    ViewContainerRef
} from '@angular/core';
import { PresenceMachine } from '@radix-ng/primitives/presence';
import { RdxTabsPanel } from './tabs-panel';

/**
 * Structural directive that mounts the tab panel contents only while the panel is active,
 * unmounting them once the exit animation finishes. Apply it inside an `[rdxTabsPanel]` to get
 * Base UI's default unmounting behavior; combine with `keepMounted` on the panel to keep the
 * contents mounted instead.
 *
 * The shared PresenceMachine watches the panel host, including its descendants, because the
 * structural template is inside the animated panel rather than wrapping it.
 */
@Directive({
    selector: 'ng-template[rdxTabsPanelPresence]'
})
export class RdxTabsPanelPresence {
    private readonly templateRef = inject(TemplateRef<void>);
    private readonly viewContainerRef = inject(ViewContainerRef);
    private readonly mounted = signal(false);
    private view: EmbeddedViewRef<void> | null = null;

    constructor() {
        const panel = inject(RdxTabsPanel);
        const registration = panel.registerPresence(this.mounted.asReadonly());
        const machine = new PresenceMachine({
            present: panel.present,
            isBrowser: isPlatformBrowser(inject(PLATFORM_ID)),
            injector: inject(Injector),
            mountView: () => {
                this.view = this.viewContainerRef.createEmbeddedView(this.templateRef);
                this.mounted.set(true);
                return [registration.element];
            },
            destroyView: () => {
                this.view?.destroy();
                this.view = null;
                this.mounted.set(false);
            }
        });
        inject(DestroyRef).onDestroy(() => {
            machine.dispose();
            registration.unregister();
        });
    }
}
