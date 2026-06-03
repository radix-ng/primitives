import { cn, demoButton, demoDialog } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-dialog-non-modal',
    imports: [...dialogImports, LucideX],
    template: `
        <div class="flex flex-col items-center gap-4">
            <p class="text-muted-foreground max-w-96 text-center text-xs leading-5">
                Non-modal: page scrolling and outside pointer interactions stay enabled while the dialog is open.
            </p>

            <div rdxDialogRoot [modal]="false">
                <button rdxDialogTrigger [class]="cn(b.base, b.primary, b.size.md)">Open non-modal dialog</button>

                <ng-template rdxDialogPortal>
                    <div rdxDialogPopup [class]="cn(d.popup, d.popupAnimated)">
                        <h2 rdxDialogTitle [class]="d.title">Non-modal dialog</h2>
                        <p rdxDialogDescription [class]="d.description">
                            There is no backdrop, so you can keep interacting with the rest of the page.
                        </p>

                        <button aria-label="Close" rdxDialogClose [class]="d.close">
                            <svg aria-hidden="true" lucideX size="16" />
                        </button>
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
