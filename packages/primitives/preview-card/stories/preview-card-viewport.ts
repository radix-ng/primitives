import { cn, demoFocusRing, demoPopover } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { previewCardImports } from '@radix-ng/primitives/preview-card';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-preview-card-viewport',
    imports: [...previewCardImports],
    template: `
        <ng-container #root="rdxPreviewCardRoot" rdxPreviewCardRoot>
            <p class="text-muted-foreground max-w-lg text-sm leading-6">
                Compare
                <a
                    href="#"
                    payload="Typography arranges type for readable language."
                    rdxPreviewCardTrigger
                    [class]="link"
                >
                    typography
                </a>
                ,
                <a href="#" payload="Design shapes objects and systems." rdxPreviewCardTrigger [class]="link">design</a>
                , and
                <a
                    href="#"
                    payload="Art communicates ideas through creative work."
                    rdxPreviewCardTrigger
                    [class]="link"
                >
                    art
                </a>
                .
            </p>

            <div
                *rdxPreviewCardPortal
                sideOffset="8"
                rdxPreviewCardPositioner
                [class]="cn(p.positioner, 'transition-[left,right,top,bottom] duration-200')"
            >
                <div
                    rdxPreviewCardPopup
                    [class]="cn(p.popup, 'overflow-hidden transition-[width,height] duration-200')"
                >
                    <span rdxPreviewCardArrow [class]="p.arrow"></span>
                    <div rdxPreviewCardViewport>
                        <div class="grid gap-2">
                            <div class="bg-muted h-24 rounded-md"></div>
                            <p class="text-muted-foreground text-sm">{{ root.payload() }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </ng-container>
    `
})
export class RdxPreviewCardViewportComponent {
    protected readonly cn = cn;
    protected readonly p = demoPopover;
    protected readonly link = cn('font-medium text-primary underline underline-offset-4', demoFocusRing);
}
