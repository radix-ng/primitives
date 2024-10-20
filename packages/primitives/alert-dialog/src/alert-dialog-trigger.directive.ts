import { Directive, inject } from '@angular/core';
import { RdxAlertDialogService } from './alert-dialog.service';

@Directive({
    selector: '[rdxAlertDialogTrigger]',
    standalone: true,
    host: {
        '(click)': 'handleClick()'
    }
})
export class RdxAlertDialogTriggerDirective {
    private readonly alertDialogService = inject(RdxAlertDialogService);

    handleClick() {
        this.alertDialogService.open();
    }
}
