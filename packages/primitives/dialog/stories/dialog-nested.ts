import { cn, demoButton, demoDialog } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-dialog-nested',
    imports: [...dialogImports, LucideX],
    template: `
        <div rdxDialogRoot>
            <button rdxDialogTrigger [class]="cn(b.base, b.primary, b.size.md)">Open dialog</button>

            <ng-template rdxDialogPortal>
                <div rdxDialogBackdrop [class]="cn(d.backdrop, d.backdropAnimated)"></div>

                <div rdxDialogPopup [class]="cn(d.popup, d.popupAnimated)">
                    <h2 rdxDialogTitle [class]="d.title">Parent dialog</h2>
                    <p rdxDialogDescription [class]="d.description">
                        Opening the nested dialog scales this popup back via
                        <code>[data-nested-dialog-open]</code>
                        .
                    </p>

                    <div [class]="d.footer">
                        <button rdxDialogClose [class]="cn(b.base, b.outline, b.size.sm)">Close</button>

                        <div rdxDialogRoot>
                            <button rdxDialogTrigger [class]="cn(b.base, b.primary, b.size.sm)">Open nested</button>

                            <ng-template rdxDialogPortal>
                                <div rdxDialogBackdrop [class]="cn(d.backdrop, d.backdropAnimated)"></div>
                                <div rdxDialogPopup [class]="cn(d.popup, d.popupAnimated)">
                                    <h2 rdxDialogTitle [class]="d.title">Nested dialog</h2>
                                    <p rdxDialogDescription [class]="d.description">
                                        Escape or the backdrop closes this one first, then the parent.
                                    </p>
                                    <div [class]="d.footer">
                                        <button rdxDialogClose [class]="cn(b.base, b.primary, b.size.sm)">Done</button>
                                    </div>
                                    <button aria-label="Close" rdxDialogClose [class]="d.close">
                                        <svg aria-hidden="true" lucideX size="16" />
                                    </button>
                                </div>
                            </ng-template>
                        </div>
                    </div>

                    <button aria-label="Close" rdxDialogClose [class]="d.close">
                        <svg aria-hidden="true" lucideX size="16" />
                    </button>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDialogNestedComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
}
