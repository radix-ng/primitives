import { Directive, HostListener } from '@angular/core';

import { AlertDialogService } from './alert-dialog.service';

@Directive({
    selector: '[rdxAlertDialogCancel]',
    standalone: true
})
export class AlertDialogCancelDirective {
    constructor(private alertDialogService: AlertDialogService) {}

    @HostListener('click')
    onClick() {
        this.alertDialogService.close();
    }
}
