import { Directive } from '@angular/core';
import { injectRdxDialogRootContext } from './dialog-root';

/**
 * A button that closes the dialog.
 */
@Directive({
    selector: 'button[rdxDialogClose]',
    exportAs: 'rdxDialogClose',
    host: {
        type: 'button',
        tabindex: '0',
        '(click)': 'rootContext.close("close-press", $event)'
    }
})
export class RdxDialogClose {
    protected readonly rootContext = injectRdxDialogRootContext();
}
