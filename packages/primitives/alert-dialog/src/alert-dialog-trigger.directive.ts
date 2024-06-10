import { Directive, inject } from '@angular/core';

import { AlertDialogService } from './alert-dialog.service';

@Directive({
    selector: '[rdxAlertDialogTrigger]',
    standalone: true,
    host: {
        '(click)': 'handleClick()'
    }
})
export class AlertDialogTriggerDirective {
    private readonly alertDialogService = inject(AlertDialogService);

    handleClick() {
        this.alertDialogService.open();
    }
}
