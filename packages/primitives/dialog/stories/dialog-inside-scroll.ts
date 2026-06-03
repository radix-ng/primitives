import { cn, demoButton, demoDialog } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-dialog-inside-scroll',
    imports: [...dialogImports, LucideX],
    template: `
        <div rdxDialogRoot>
            <button rdxDialogTrigger [class]="cn(b.base, b.primary, b.size.md)">Open dialog</button>

            <ng-template rdxDialogPortal>
                <div rdxDialogBackdrop [class]="cn(d.backdrop, d.backdropAnimated)"></div>

                <!-- The popup stays fixed on screen; only its body scrolls. -->
                <div rdxDialogPopup [class]="cn(d.popup, d.popupAnimated, 'flex max-h-[85vh] flex-col')">
                    <h2 rdxDialogTitle [class]="d.title">Release notes</h2>
                    <p rdxDialogDescription [class]="d.description">
                        Header and footer stay put while the body scrolls.
                    </p>

                    <div [class]="d.scrollBody">
                        @for (paragraph of paragraphs; track $index) {
                            <p class="mt-3 first:mt-0">{{ paragraph }}</p>
                        }
                    </div>

                    <div [class]="d.footer">
                        <button rdxDialogClose [class]="cn(b.base, b.primary, b.size.sm)">Got it</button>
                    </div>

                    <button aria-label="Close" rdxDialogClose [class]="d.close">
                        <svg aria-hidden="true" lucideX size="16" />
                    </button>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDialogInsideScrollComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
    protected readonly paragraphs = Array.from(
        { length: 14 },
        (_, i) => `Change ${i + 1}. Lots of details that overflow the fixed-height popup and scroll inside it.`
    );
}
