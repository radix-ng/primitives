import { Directive } from '@angular/core';
import { provideRdxDialogVariant, RdxDialogRoot } from '@radix-ng/primitives/dialog';

/**
 * Groups all parts of the alert dialog.
 *
 * Composes the Dialog primitive and forces alert-dialog semantics: it is always modal, never
 * dismisses on outside pointer / focus-out interactions (Escape still closes), and renders its
 * popup with `role="alertdialog"`. Assemble it from the `rdxAlertDialog*` parts (Popup, Backdrop,
 * Title, Description, Close, Portal, Viewport), which are thin wrappers around the dialog parts.
 */
@Directive({
    selector: '[rdxAlertDialogRoot]',
    exportAs: 'rdxAlertDialogRoot',
    hostDirectives: [
        {
            directive: RdxDialogRoot,
            inputs: ['open', 'defaultOpen', 'triggerId', 'defaultTriggerId', 'handle'],
            outputs: ['openChange', 'triggerIdChange', 'onOpenChange', 'onOpenChangeComplete']
        }
    ],
    providers: [
        provideRdxDialogVariant({
            role: 'alertdialog',
            forceModal: true,
            forcePointerDismissalDisabled: true
        })
    ]
})
export class RdxAlertDialogRoot {}
