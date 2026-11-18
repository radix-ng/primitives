import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxPreviewCardArrow,
    RdxPreviewCardPopup,
    RdxPreviewCardPortal,
    RdxPreviewCardPositioner,
    RdxPreviewCardRoot,
    RdxPreviewCardTrigger
} from '@radix-ng/primitives/preview-card';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-preview-card-default',
    imports: [
        RdxPreviewCardRoot,
        RdxPreviewCardTrigger,
        RdxPreviewCardPortal,
        RdxPreviewCardPositioner,
        RdxPreviewCardPopup,
        RdxPreviewCardArrow
    ],
    template: `
        <ng-container rdxPreviewCardRoot>
            <p class="text-muted-foreground max-w-md text-sm leading-6">
                The principles of good
                <a
                    class="text-primary demo-focus font-medium underline underline-offset-4"
                    href="https://en.wikipedia.org/wiki/Typography"
                    rel="noreferrer"
                    target="_blank"
                    rdxPreviewCardTrigger
                >
                    typography
                </a>
                remain in the digital age.
            </p>

            <div class="z-50" *rdxPreviewCardPortal sideOffset="8" rdxPreviewCardPositioner>
                <div class="demo-surface relative w-80 p-4" rdxPreviewCardPopup>
                    <span class="text-card demo-arrow my-px" rdxPreviewCardArrow></span>
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
export class RdxPreviewCardDefaultComponent {}
