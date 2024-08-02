import { Directive, inject } from '@angular/core';
import { AlertDialogService } from './alert-dialog.service';

@Directive({
    selector: '[rdxAlertDialogCancel]',
    standalone: true,
    host: {
        '(click)': 'onClick()'
    }
})
export class AlertDialogCancelDirective {
    private readonly alertDialogService = inject(AlertDialogService);

    onClick() {
        this.alertDialogService.close();
    }
}
