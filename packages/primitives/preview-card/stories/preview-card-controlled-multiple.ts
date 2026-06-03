import { cn, demoButton, demoFocusRing, demoPopover } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { previewCardImports } from '@radix-ng/primitives/preview-card';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-preview-card-controlled-multiple',
    imports: [...previewCardImports],
    template: `
        <div class="grid gap-4">
            <div class="flex items-center gap-3">
                <button type="button" [class]="cn(b.base, b.outline, b.size.sm)" (click)="openFrom('design')">
                    Open design
                </button>
                <button type="button" [class]="cn(b.base, b.outline, b.size.sm)" (click)="open = false">Close</button>
            </div>

            <ng-container
                #root="rdxPreviewCardRoot"
                rdxPreviewCardRoot
                [(open)]="open"
                [(triggerId)]="triggerId"
                (onOpenChange)="triggerId = $event.triggerId"
            >
                <p class="text-muted-foreground max-w-lg text-sm leading-6">
                    Discover
                    <a id="typography" href="#" rdxPreviewCardTrigger [class]="link" [payload]="cards.typography">
                        typography
                    </a>
                    ,
                    <a id="design" href="#" rdxPreviewCardTrigger [class]="link" [payload]="cards.design">design</a>
                    , or
                    <a id="art" href="#" rdxPreviewCardTrigger [class]="link" [payload]="cards.art">art</a>
                    .
                </p>

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
export class RdxPreviewCardControlledMultipleComponent {
    open = false;
    triggerId: 'typography' | 'design' | 'art' | null = null;

    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly p = demoPopover;
    protected readonly link = cn('font-medium text-primary underline underline-offset-4', demoFocusRing);
    protected readonly cards = {
        typography: 'Typography arranges type to make written language clear and effective.',
        design: 'Design shapes the concept and structure of an object, process, or system.',
        art: 'Art communicates ideas and emotion through creative work.'
    } as const;

    openFrom(id: 'typography' | 'design' | 'art') {
        this.triggerId = id;
        this.open = true;
    }
}
