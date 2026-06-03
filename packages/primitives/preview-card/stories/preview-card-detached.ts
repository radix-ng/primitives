import { cn, demoFocusRing, demoPopover } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { createRdxPreviewCardHandle, previewCardImports } from '@radix-ng/primitives/preview-card';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-preview-card-detached',
    imports: [...previewCardImports],
    template: `
        <div class="grid gap-4">
            <p class="text-muted-foreground max-w-lg text-sm leading-6">
                Detached triggers can live outside the root:
                <a
                    id="typography"
                    href="#"
                    payload="Typography preview"
                    rdxPreviewCardTrigger
                    [class]="link"
                    [handle]="previewCard"
                >
                    typography
                </a>
                and
                <a
                    id="design"
                    href="#"
                    payload="Design preview"
                    rdxPreviewCardTrigger
                    [class]="link"
                    [handle]="previewCard"
                >
                    design
                </a>
                .
            </p>

            <ng-container #root="rdxPreviewCardRoot" rdxPreviewCardRoot [handle]="previewCard">
                <div *rdxPreviewCardPortal sideOffset="8" rdxPreviewCardPositioner [class]="p.positioner">
                    <div rdxPreviewCardPopup [class]="p.popup">
                        <span rdxPreviewCardArrow [class]="p.arrow"></span>
                        <div class="grid gap-2">
                            <div class="bg-muted h-24 rounded-md"></div>
                            <p class="text-muted-foreground text-sm">{{ root.payload() }}</p>
                        </div>
                    </div>
                </div>
            </ng-container>
        </div>
    `
})
export class RdxPreviewCardDetachedComponent {
    protected readonly previewCard = createRdxPreviewCardHandle<string>();
    protected readonly p = demoPopover;
    protected readonly link = cn('font-medium text-primary underline underline-offset-4', demoFocusRing);
}
