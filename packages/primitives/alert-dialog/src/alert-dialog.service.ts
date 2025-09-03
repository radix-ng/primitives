import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { inject, Injectable, TemplateRef, ViewContainerRef } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class RdxAlertDialogService {
    private overlayRef: OverlayRef | null | undefined;
    private readonly overlay = inject(Overlay);

    private dialogContent:
        | {
              viewContainerRef: ViewContainerRef;
              template: TemplateRef<any>;
          }
        | undefined;

    setDialogContent(viewContainerRef: ViewContainerRef, template: TemplateRef<any>) {
        this.dialogContent = { viewContainerRef, template };
    }

    open() {
        if (!this.dialogContent) {
            throw new Error('Dialog content is not set');
        }

        this.overlayRef = this.overlay.create({
            hasBackdrop: true,
            backdropClass: 'cdk-overlay-dark-backdrop',
            positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically()
        });

        const templatePortal = new TemplatePortal(this.dialogContent.template, this.dialogContent.viewContainerRef);
        this.overlayRef.attach(templatePortal);

        this.overlayRef.keydownEvents().subscribe((event) => {
            if (event.key === 'Escape' || event.code === 'Escape') {
                this.close();
            }
        });
        this.overlayRef.backdropClick().subscribe(() => this.close());
    }

    close() {
        if (this.overlayRef) {
            this.overlayRef.dispose();
            this.overlayRef = null;
        }
    }
}
