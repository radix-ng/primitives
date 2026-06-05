import { Component, signal } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

@Component({
    selector: 'rdx-dialog-non-modal',
    imports: [...dialogImports, LucideX],
    template: `
        <div class="flex flex-col items-center gap-4">
            <p class="text-muted-foreground max-w-96 text-center text-xs leading-5">
                Non-modal: page scrolling and outside pointer interactions stay enabled while the dialog is open.
            </p>

            <div [modal]="false" rdxDialogRoot>
                <button [class]="cn(b.base, b.primary, b.size.md)" rdxDialogTrigger>Open non-modal dialog</button>

                <ng-template rdxDialogPortalPresence>
                    <div [class]="d.portalAnimated" rdxDialogPortal>
                        <div [class]="cn(d.popup, d.popupAnimated)" rdxDialogPopup>
                            <h2 [class]="d.title" rdxDialogTitle>Non-modal dialog</h2>
                            <p [class]="d.description" rdxDialogDescription>
                                There is no backdrop, so you can keep interacting with the rest of the page.
                            </p>

                            <button [class]="d.close" aria-label="Close" rdxDialogClose>
                                <svg aria-hidden="true" lucideX size="16" />
                            </button>
                        </div>
                    </div>
                </ng-template>
            </div>

            <button [class]="cn(b.base, b.secondary, b.size.sm)" (click)="outsideClicks.update((count) => count + 1)">
                Outside interaction target: {{ outsideClicks() }}
            </button>
        </div>
    `
})
export class RdxDialogNonModalComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
    protected readonly outsideClicks = signal(0);
}
