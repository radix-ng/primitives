import { injectRdxDialogRootContext } from './dialog-root';
import { Directive } from '@angular/core';

/**
 * A button that closes the dialog.
 */
@Directive({
    selector: 'button[rdxDialogClose]',
    exportAs: 'rdxDialogClose',
    host: {
        type: 'button',
        '(click)': 'rootContext.close("close-press", $event)'
    }
})
export class RdxDialogClose {
    protected readonly rootContext = injectRdxDialogRootContext();
}
