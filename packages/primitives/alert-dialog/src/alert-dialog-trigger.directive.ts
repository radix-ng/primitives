import { Directive, HostListener } from '@angular/core';

import { AlertDialogService } from './alert-dialog.service';

@Directive({
    selector: '[rdxAlertDialogTrigger]',
    standalone: true
})
export class AlertDialogTriggerDirective {
    constructor(private alertDialogService: AlertDialogService) {}

    @HostListener('click')
    handleClick() {
        this.alertDialogService.open();
    }
}
