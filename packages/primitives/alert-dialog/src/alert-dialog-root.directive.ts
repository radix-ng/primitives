import { Directive, inject, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { RdxAlertDialogService } from './alert-dialog.service';

@Directive({
    selector: '[rdxAlertDialogRoot]',
    standalone: true
})
export class RdxAlertDialogRootDirective {
    private readonly viewContainerRef = inject(ViewContainerRef);
    private readonly alertDialogService = inject(RdxAlertDialogService);

    @Input() set content(template: TemplateRef<any>) {
        this.alertDialogService.setDialogContent(this.viewContainerRef, template);
    }
}
