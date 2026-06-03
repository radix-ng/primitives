import { cn, demoButton, demoDialog } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { alertDialogImports } from '@radix-ng/primitives/alert-dialog';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-alert-dialog-multiple-triggers',
    imports: [...alertDialogImports],
    template: `
        <div #root="rdxAlertDialogRoot" rdxAlertDialogRoot>
            <div class="flex gap-2">
                <button payload="photo" rdxAlertDialogTrigger [class]="cn(b.base, b.outline, b.size.md)">
                    Delete photo
                </button>
                <button payload="video" rdxAlertDialogTrigger [class]="cn(b.base, b.outline, b.size.md)">
                    Delete video
                </button>
                <button payload="album" rdxAlertDialogTrigger [class]="cn(b.base, b.outline, b.size.md)">
                    Delete album
                </button>
            </div>

            <ng-template rdxAlertDialogPortal>
                <div rdxAlertDialogBackdrop [class]="cn(d.backdrop, d.backdropAnimated)"></div>
                <div rdxAlertDialogPopup [class]="cn(d.popup, d.popupAnimated)">
                    <h2 rdxAlertDialogTitle [class]="d.title">Delete this {{ root.payload() || 'item' }}?</h2>
                    <p rdxAlertDialogDescription [class]="d.description">
                        Every trigger opens the same alert dialog; the active trigger's
                        <code>payload</code>
                        decides what is being deleted.
                    </p>
                    <div [class]="d.footer">
                        <button rdxAlertDialogClose [class]="cn(b.base, b.outline, b.size.sm)">Cancel</button>
                        <button rdxAlertDialogClose [class]="cn(b.base, b.destructive, b.size.sm)">Delete</button>
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
