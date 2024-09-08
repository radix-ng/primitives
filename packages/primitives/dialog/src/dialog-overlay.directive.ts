import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { Directive, inject, OnInit } from '@angular/core';

@Directive({
    selector: '[rdxDialogOverlay]',
    standalone: true
})
export class RdxDialogOverlayDirective implements OnInit {
    private overlayRef: OverlayRef | null = null;

    private readonly overlay = inject(Overlay);

    ngOnInit() {
        this.createOverlay();
    }

    private createOverlay() {
        if (this.overlayRef) {
            return;
        }

        const positionStrategy = this.overlay.position().global().centerHorizontally().centerVertically();

        this.overlayRef = this.overlay.create({
            positionStrategy,
            scrollStrategy: this.overlay.scrollStrategies.block()
        });
    }

    private attachOverlay() {
        if (this.overlayRef && !this.overlayRef.hasAttached()) {
            // this.overlayRef.attach();
        }
    }

    private detachOverlay() {
        if (this.overlayRef && this.overlayRef.hasAttached()) {
            this.overlayRef.detach();
        }
    }

    private destroyOverlay() {
        if (this.overlayRef) {
            this.overlayRef.dispose();
            this.overlayRef = null;
        }
    }
}
