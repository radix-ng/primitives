import { Component, signal } from '@angular/core';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

@Component({
    selector: 'rdx-dialog-deferred-open',
    imports: [dialogImports],
    template: `
        <div class="flex items-center gap-3">
            <button
                [class]="cn(b.base, b.outline, b.size.sm)"
                [disabled]="requestedOpen() !== true"
                (click)="applyRequest()"
            >
                Apply open request
            </button>

            <div [open]="open()" (openChange)="requestedOpen.set($event)" rdxDialogRoot defaultOpen>
                <button [class]="cn(b.base, b.primary, b.size.md)" rdxDialogTrigger>Open dialog</button>
                <ng-template rdxDialogPortal>
                    <div [class]="d.backdrop" rdxDialogBackdrop></div>
                    <div [class]="d.popup" rdxDialogPopup>
                        <h2 [class]="d.title" rdxDialogTitle>Review the request</h2>
                        <div [class]="d.footer">
                            <button [class]="cn(b.base, b.primary, b.size.sm)" rdxDialogClose>Request close</button>
                            <button
                                [class]="cn(b.base, b.outline, b.size.sm)"
                                [disabled]="requestedOpen() !== false"
                                (click)="applyRequest()"
                            >
                                Apply close request
                            </button>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class RdxDialogDeferredOpenComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
    protected readonly open = signal(false);
    protected readonly requestedOpen = signal<boolean | null>(null);

    protected applyRequest(): void {
        const requested = this.requestedOpen();
        if (requested !== null) {
            this.open.set(requested);
            this.requestedOpen.set(null);
        }
    }
}
