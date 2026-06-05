import { Directive } from '@angular/core';
import { RdxDialogPortalPresence } from '@radix-ng/primitives/dialog';

/**
 * Mounts the portal while the alert dialog is open and waits for CSS exit keyframes before unmounting.
 */
@Directive({
    selector: 'ng-template[rdxAlertDialogPortalPresence]',
    hostDirectives: [RdxDialogPortalPresence]
})
export class RdxAlertDialogPortalPresence {}
