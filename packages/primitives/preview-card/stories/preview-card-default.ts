import { Component } from '@angular/core';
import { previewCardImports } from '@radix-ng/primitives/preview-card';
import { cn, demoFocusRing, demoPopover } from '../../storybook/styles';

@Component({
    selector: 'rdx-preview-card-default',
    imports: [...previewCardImports],
    template: `
        <ng-container rdxPreviewCardRoot>
            <p class="text-muted-foreground max-w-md text-sm leading-6">
                The principles of good
                <a
                    [class]="link"
                    href="https://en.wikipedia.org/wiki/Typography"
                    rel="noreferrer"
                    target="_blank"
                    rdxPreviewCardTrigger
                >
                    typography
                </a>
                remain in the digital age.
            </p>

            <div *rdxPreviewCardPortal [class]="p.positioner" sideOffset="8" rdxPreviewCardPositioner>
                <div [class]="p.popup" rdxPreviewCardPopup>
                    <span [class]="p.arrow" rdxPreviewCardArrow></span>
                    <div class="grid gap-3">
                        <div class="bg-muted h-28 rounded-md"></div>
                        <p class="text-muted-foreground text-sm">
                            <strong class="text-foreground font-medium">Typography</strong>
                            is the art and science of arranging type to make written language clear and effective.
                        </p>
                    </div>
                </div>
            </div>
        </ng-container>
    `
})
export class RdxPreviewCardDefaultComponent {
    protected readonly cn = cn;
    protected readonly p = demoPopover;
    protected readonly link = cn('font-medium text-primary underline underline-offset-4', demoFocusRing);
}
