import { Directive, inject } from '@angular/core';
import { RdxAlertDialogService } from './alert-dialog.service';

@Directive({
    selector: '[rdxAlertDialogCancel]',
    standalone: true,
    host: {
        '(click)': 'onClick()'
    }
})
export class RdxAlertDialogCancelDirective {
    private readonly alertDialogService = inject(RdxAlertDialogService);

    onClick() {
        this.alertDialogService.close();
    }
}
