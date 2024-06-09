import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

import { AlertDialogService } from './alert-dialog.service';

@Directive({
    selector: '[rdxAlertDialogRoot]',
    standalone: true
})
export class AlertDialogRootDirective {
    @Input() set content(template: TemplateRef<any>) {
        this.alertDialogService.setDialogContent(this.viewContainerRef, template);
    }

    constructor(
        private viewContainerRef: ViewContainerRef,
        private alertDialogService: AlertDialogService
    ) {}
}
