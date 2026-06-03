import { cn, demoButton, demoDialog } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-dialog-multiple-triggers',
    imports: [...dialogImports, LucideX],
    template: `
        <div #root="rdxDialogRoot" rdxDialogRoot>
            <div class="flex gap-2">
                <button payload="Lemon" rdxDialogTrigger [class]="cn(b.base, b.outline, b.size.md)">Lemon</button>
                <button payload="Lime" rdxDialogTrigger [class]="cn(b.base, b.outline, b.size.md)">Lime</button>
                <button payload="Orange" rdxDialogTrigger [class]="cn(b.base, b.outline, b.size.md)">Orange</button>
            </div>

            <ng-template rdxDialogPortal>
                <div rdxDialogBackdrop [class]="cn(d.backdrop, d.backdropAnimated)"></div>
                <div rdxDialogPopup [class]="cn(d.popup, d.popupAnimated)">
                    <h2 rdxDialogTitle [class]="d.title">{{ root.payload() || 'Fruit' }}</h2>
                    <p rdxDialogDescription [class]="d.description">
                        Every trigger opens the same dialog; the active trigger's
                        <code>payload</code>
                        is shown here.
                    </p>
                    <div [class]="d.footer">
                        <button rdxDialogClose [class]="cn(b.base, b.primary, b.size.sm)">Close</button>
                    </div>
                    <button aria-label="Close" rdxDialogClose [class]="d.close">
                        <svg aria-hidden="true" lucideX size="16" />
                    </button>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDialogMultipleTriggersComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
}
