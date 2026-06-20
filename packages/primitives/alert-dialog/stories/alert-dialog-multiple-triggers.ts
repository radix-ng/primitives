import { ChangeDetectionStrategy, Component } from '@angular/core';
import { alertDialogImports } from '@radix-ng/primitives/alert-dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-alert-dialog-multiple-triggers',
    imports: [...alertDialogImports],
    template: `
        <div #root="rdxAlertDialogRoot" rdxAlertDialogRoot>
            <div class="flex gap-2">
                <button [class]="cn(b.base, b.outline, b.size.md)" payload="photo" rdxAlertDialogTrigger>
                    Delete photo
                </button>
                <button [class]="cn(b.base, b.outline, b.size.md)" payload="video" rdxAlertDialogTrigger>
                    Delete video
                </button>
                <button [class]="cn(b.base, b.outline, b.size.md)" payload="album" rdxAlertDialogTrigger>
                    Delete album
                </button>
            </div>

            <ng-template rdxAlertDialogPortal>
                <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxAlertDialogBackdrop></div>
                <div [class]="cn(d.popup, d.popupAnimated)" rdxAlertDialogPopup>
                    <h2 [class]="d.title" rdxAlertDialogTitle>Delete this {{ root.payload() || 'item' }}?</h2>
                    <p [class]="d.description" rdxAlertDialogDescription>
                        Every trigger opens the same alert dialog; the active trigger's
                        <code>payload</code>
                        decides what is being deleted.
                    </p>
                    <div [class]="d.footer">
                        <button [class]="cn(b.base, b.outline, b.size.sm)" rdxAlertDialogClose>Cancel</button>
                        <button [class]="cn(b.base, b.destructive, b.size.sm)" rdxAlertDialogClose>Delete</button>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxAlertDialogMultipleTriggersComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
}
