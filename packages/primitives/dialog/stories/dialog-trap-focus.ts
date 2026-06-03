import { cn, demoButton, demoDialog, demoInput } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-dialog-trap-focus',
    imports: [...dialogImports, LucideX],
    template: `
        <div class="flex flex-col items-center gap-4">
            <p class="text-muted-foreground max-w-96 text-center text-xs leading-5">
                Trap focus: keyboard focus stays inside the dialog (Tab cycles its controls), while page scrolling and
                outside pointer interactions remain available.
            </p>

            <div modal="trap-focus" rdxDialogRoot>
                <button rdxDialogTrigger [class]="cn(b.base, b.primary, b.size.md)">Open dialog</button>

                <ng-template rdxDialogPortal>
                    <div rdxDialogPopup [class]="cn(d.popup, d.popupAnimated)">
                        <h2 rdxDialogTitle [class]="d.title">Focus is trapped</h2>
                        <p rdxDialogDescription [class]="d.description">
                            Press Tab and notice focus never leaves the dialog.
                        </p>

                        <label [class]="d.field">
                            First field
                            <input placeholder="Focused when opened" [class]="input" />
                        </label>
                        <label [class]="d.field">
                            Second field
                            <input placeholder="Tab to reach me" [class]="input" />
                        </label>

                        <div [class]="d.footer">
                            <button rdxDialogClose [class]="cn(b.base, b.primary, b.size.sm)">Done</button>
                        </div>

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
export class RdxDialogTrapFocusComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
    protected readonly input = demoInput;
    protected readonly outsideClicks = signal(0);
}
