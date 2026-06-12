import { Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

@Component({
    selector: 'rdx-dialog-multiple-triggers',
    imports: [...dialogImports, LucideX],
    template: `
        <div #root="rdxDialogRoot" rdxDialogRoot>
            <div class="flex gap-2">
                <button [class]="cn(b.base, b.outline, b.size.md)" payload="Lemon" rdxDialogTrigger>Lemon</button>
                <button [class]="cn(b.base, b.outline, b.size.md)" payload="Lime" rdxDialogTrigger>Lime</button>
                <button [class]="cn(b.base, b.outline, b.size.md)" payload="Orange" rdxDialogTrigger>Orange</button>
            </div>

            <ng-template rdxDialogPortal>
                <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxDialogBackdrop></div>
                <div [class]="cn(d.popup, d.popupAnimated)" rdxDialogPopup>
                    <h2 [class]="d.title" rdxDialogTitle>{{ root.payload() || 'Fruit' }}</h2>
                    <p [class]="d.description" rdxDialogDescription>
                        Every trigger opens the same dialog; the active trigger's
                        <code>payload</code>
                        is shown here.
                    </p>
                    <div [class]="d.footer">
                        <button [class]="cn(b.base, b.primary, b.size.sm)" rdxDialogClose>Close</button>
                    </div>
                    <button [class]="d.close" aria-label="Close" rdxDialogClose>
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
