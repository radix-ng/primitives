import { Injectable } from '@angular/core';

/**
 * Modality control: When `isModal` is set to `true`, the dialog will:
 *
 * - Have a backdrop that blocks interaction with the rest of the page
 * - Disable closing by clicking outside or pressing Escape
 * - Set `aria-modal="true"` for screen readers
 * - Automatically focus the first tabbable element in the dialog
 * - Restore focus to the element that opened the dialog when it's closed
 *
 *
 * When `isModal` is `false`, the dialog will:
 *
 * - Not have a backdrop, allowing interaction with the rest of the page
 * - Allow closing by clicking outside or pressing Escape
 * - Not set `aria-modal` attribute
 * - Not automatically manage focus
 */
@Injectable({
    providedIn: 'root'
})
export class RdxDialogService {
    open(isModal = true) {
        /*
        From @angular/cdk/dialog:
              disableClose: isModal,
              hasBackdrop: isModal,
              backdropClass: isModal ? 'cdk-overlay-backdrop' : '',
              autoFocus: isModal ? 'first-tabbable' : false,
              restoreFocus: isModal,
              ariaModal: isModal
        * */
    }
}
