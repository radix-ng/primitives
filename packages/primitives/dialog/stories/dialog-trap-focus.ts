import { Component, signal } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog, demoInput } from '../../storybook/styles';

@Component({
    selector: 'rdx-dialog-trap-focus',
    imports: [...dialogImports, LucideX],
    template: `
        <div class="flex flex-col items-center gap-4">
            <p class="text-muted-foreground max-w-96 text-center text-xs leading-5">
                Trap focus: keyboard focus stays inside the dialog (Tab cycles its controls), while page scrolling and
                outside pointer interactions remain available.
            </p>

            <div modal="trap-focus" rdxDialogRoot>
                <button [class]="cn(b.base, b.primary, b.size.md)" rdxDialogTrigger>Open dialog</button>

                <ng-template rdxDialogPortal>
                    <div [class]="cn(d.popup, d.popupAnimated)" rdxDialogPopup>
                        <h2 [class]="d.title" rdxDialogTitle>Focus is trapped</h2>
                        <p [class]="d.description" rdxDialogDescription>
                            Press Tab and notice focus never leaves the dialog.
                        </p>

                        <label [class]="d.field">
                            First field
                            <input [class]="input" placeholder="Focused when opened" />
                        </label>
                        <label [class]="d.field">
                            Second field
                            <input [class]="input" placeholder="Tab to reach me" />
                        </label>

                        <div [class]="d.footer">
                            <button [class]="cn(b.base, b.primary, b.size.sm)" rdxDialogClose>Done</button>
                        </div>

                        <button [class]="d.close" aria-label="Close" rdxDialogClose>
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
