import { RdxTabsPanel } from './tabs-panel';
import { Directive, inject } from '@angular/core';
import { RdxPresenceDirective } from '@radix-ng/primitives/presence';

/**
 * Structural directive that mounts the tab panel contents only while the panel is active,
 * unmounting them once the exit animation finishes. Apply it inside an `[rdxTabsPanel]` to get
 * Base UI's default unmounting behavior; combine with `keepMounted` on the panel to keep the
 * contents mounted instead.
 *
 * The presence state is read from the parent panel through {@link RdxPresenceDirective}.
 */
@Directive({
    selector: 'ng-template[rdxTabsPanelPresence]',
    hostDirectives: [RdxPresenceDirective]
})
export class RdxTabsPanelPresence {
    constructor() {
        inject(RdxTabsPanel).markHasPresence();
    }
}
