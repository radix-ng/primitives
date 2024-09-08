import { Directive } from '@angular/core';

@Directive({
    selector: 'button[rdxDialogClose]',
    standalone: true,
    host: {
        type: 'button',
        '(click)': 'onClose()'
    }
})
export class RdxDialogCloseDirective {
    protected onClick(): void {
        /**/
    }
}
