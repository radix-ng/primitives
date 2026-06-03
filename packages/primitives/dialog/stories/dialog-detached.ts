import { cn, demoButton, demoDialog } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { createRdxDialogHandle, dialogImports } from '@radix-ng/primitives/dialog';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-dialog-detached',
    imports: [...dialogImports, LucideX],
    template: `
        <div class="flex flex-col items-center gap-3">
            <!-- Triggers live outside the root and are linked through a shared handle. -->
            <div class="flex gap-2">
                <button id="settings" rdxDialogTrigger [class]="cn(b.base, b.outline, b.size.md)" [handle]="handle">
                    Settings
                </button>
                <button id="profile" rdxDialogTrigger [class]="cn(b.base, b.outline, b.size.md)" [handle]="handle">
                    Profile
                </button>
            </div>

            <button [class]="cn(b.base, b.secondary, b.size.sm)" (click)="handle.open('profile')">
                Open profile imperatively
            </button>

            <div rdxDialogRoot [handle]="handle">
                <ng-template rdxDialogPortal>
                    <div rdxDialogBackdrop [class]="cn(d.backdrop, d.backdropAnimated)"></div>
                    <div rdxDialogPopup [class]="cn(d.popup, d.popupAnimated)">
                        <h2 rdxDialogTitle [class]="d.title">Detached triggers</h2>
                        <p rdxDialogDescription [class]="d.description">
                            The triggers and this dialog are connected with
                            <code>createRdxDialogHandle()</code>
                            rather than DOM nesting.
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
        </div>
    `
})
export class RdxDialogDetachedComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
    protected readonly handle = createRdxDialogHandle();
}
