import { Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

@Component({
    selector: 'rdx-dialog-outside-scroll',
    imports: [...dialogImports, LucideX],
    template: `
        <div rdxDialogRoot>
            <button [class]="cn(b.base, b.primary, b.size.md)" rdxDialogTrigger>Open long dialog</button>

            <ng-template rdxDialogPortal>
                <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxDialogBackdrop></div>

                <!-- The viewport is the scrollable container; the popup grows past the screen. -->
                <div [class]="d.viewport" rdxDialogViewport>
                    <div [class]="cn(d.popupStatic, d.popupAnimated)" rdxDialogPopup>
                        <h2 [class]="d.title" rdxDialogTitle>Terms of service</h2>
                        <p [class]="d.description" rdxDialogDescription>
                            The whole dialog scrolls within the viewport.
                        </p>

                        @for (paragraph of paragraphs; track $index) {
                            <p class="text-muted-foreground mt-4 text-sm">{{ paragraph }}</p>
                        }

                        <div [class]="d.footer">
                            <button [class]="cn(b.base, b.primary, b.size.sm)" rdxDialogClose>Accept</button>
                        </div>

                        <button [class]="d.close" aria-label="Close" rdxDialogClose>
                            <svg aria-hidden="true" lucideX size="16" />
                        </button>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDialogOutsideScrollComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
    protected readonly paragraphs = Array.from(
        { length: 12 },
        (_, i) =>
            `Section ${i + 1}. This is filler content that makes the dialog taller than the viewport so the outer container scrolls.`
    );
}
