import { cn, demoButton, demoDialog } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-dialog-controlled',
    imports: [...dialogImports, LucideX],
    template: `
        <div class="flex flex-col items-center gap-4">
            <p class="text-muted-foreground text-xs">Dialog is {{ open() ? 'open' : 'closed' }}</p>

            <div class="flex gap-2">
                <button [class]="cn(b.base, b.outline, b.size.sm)" (click)="open.set(true)">Open from outside</button>
            </div>

            <div rdxDialogRoot [(open)]="open">
                <button rdxDialogTrigger [class]="cn(b.base, b.primary, b.size.md)">Open dialog</button>

                <ng-template rdxDialogPortal>
                    <div rdxDialogBackdrop [class]="cn(d.backdrop, d.backdropAnimated)"></div>

                    <div rdxDialogPopup [class]="cn(d.popup, d.popupAnimated)">
                        <h2 rdxDialogTitle [class]="d.title">Controlled dialog</h2>
                        <p rdxDialogDescription [class]="d.description">
                            The open state is owned by the component and bound with
                            <code>[(open)]</code>
                            .
                        </p>

                        <div [class]="d.footer">
                            <button [class]="cn(b.base, b.primary, b.size.sm)" (click)="open.set(false)">
                                Close from outside
                            </button>
                        </div>

                        <button aria-label="Close" rdxDialogClose [class]="d.close">
                            <svg aria-hidden="true" lucideX size="16" />
                        </button>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class RdxDialogControlledComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
    protected readonly open = signal(false);
}
