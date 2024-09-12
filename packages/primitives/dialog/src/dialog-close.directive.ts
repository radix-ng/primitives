import { Directive, inject } from '@angular/core';
import { RdxDialogRef } from './dialog-ref';

@Directive({
    selector: 'button[rdxDialogClose]',
    standalone: true,
    host: {
        type: 'button',
        '(click)': 'onClick()'
    }
})
export class RdxDialogCloseDirective {
    #ref = inject<RdxDialogRef>(RdxDialogRef);

    protected onClick(): void {
        this.#ref.close();
    }
}
