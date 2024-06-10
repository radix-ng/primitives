import { Directive, inject, Input, TemplateRef, ViewContainerRef } from '@angular/core';

import { AlertDialogService } from './alert-dialog.service';

@Directive({
    selector: '[rdxAlertDialogRoot]',
    standalone: true
})
export class AlertDialogRootDirective {
    private readonly viewContainerRef = inject(ViewContainerRef);
    private readonly alertDialogService = inject(AlertDialogService);

    @Input() set content(template: TemplateRef<any>) {
        this.alertDialogService.setDialogContent(this.viewContainerRef, template);
    }
}
