import { Directive } from '@angular/core';
import { RdxDialogPortalPresence } from '@radix-ng/primitives/dialog';

/**
 * Mounts the portal while the drawer is open and waits for CSS exit keyframes before unmounting.
 */
@Directive({
    selector: 'ng-template[rdxDrawerPortalPresence]',
    hostDirectives: [RdxDialogPortalPresence]
})
export class RdxDrawerPortalPresence {}
