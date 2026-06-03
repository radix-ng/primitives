import { cn, demoFocusRing, demoPopover } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { previewCardImports } from '@radix-ng/primitives/preview-card';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-preview-card-default',
    imports: [...previewCardImports],
    template: `
        <ng-container rdxPreviewCardRoot>
            <p class="text-muted-foreground max-w-md text-sm leading-6">
                The principles of good
                <a
                    href="https://en.wikipedia.org/wiki/Typography"
                    rel="noreferrer"
                    target="_blank"
                    rdxPreviewCardTrigger
                    [class]="link"
                >
                    typography
                </a>
                remain in the digital age.
            </p>

            <div *rdxPreviewCardPortal sideOffset="8" rdxPreviewCardPositioner [class]="p.positioner">
                <div rdxPreviewCardPopup [class]="p.popup">
                    <span rdxPreviewCardArrow [class]="p.arrow"></span>
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
