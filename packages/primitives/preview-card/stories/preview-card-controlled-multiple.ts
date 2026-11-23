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
    selector: 'rdx-preview-card-controlled-multiple',
    imports: [
        RdxPreviewCardRoot,
        RdxPreviewCardTrigger,
        RdxPreviewCardPortal,
        RdxPreviewCardPositioner,
        RdxPreviewCardPopup,
        RdxPreviewCardArrow
    ],
    template: `
        <div class="grid gap-4">
            <div class="flex items-center gap-3">
                <button
                    class="demo-button demo-button-outline h-8 px-3 text-xs"
                    (click)="openFrom('design')"
                    type="button"
                >
                    Open design
                </button>
                <button class="demo-button demo-button-outline h-8 px-3 text-xs" (click)="open = false" type="button">
                    Close
                </button>
            </div>

            <ng-container
                #root="rdxPreviewCardRoot"
                [(open)]="open"
                [(triggerId)]="triggerId"
                (onOpenChange)="triggerId = $event.triggerId"
                rdxPreviewCardRoot
            >
                <p class="text-muted-foreground max-w-lg text-sm leading-6">
                    Discover
                    <a
                        class="text-primary demo-focus font-medium underline underline-offset-4"
                        id="typography"
                        [payload]="cards.typography"
                        href="#"
                        rdxPreviewCardTrigger
                    >
                        typography
                    </a>
                    ,
                    <a
                        class="text-primary demo-focus font-medium underline underline-offset-4"
                        id="design"
                        [payload]="cards.design"
                        href="#"
                        rdxPreviewCardTrigger
                    >
                        design
                    </a>
                    , or
                    <a
                        class="text-primary demo-focus font-medium underline underline-offset-4"
                        id="art"
                        [payload]="cards.art"
                        href="#"
                        rdxPreviewCardTrigger
                    >
                        art
                    </a>
                    .
                </p>

                <div class="z-50" *rdxPreviewCardPortal sideOffset="8" rdxPreviewCardPositioner>
                    <div class="demo-popup relative w-80 p-4" rdxPreviewCardPopup>
                        <span class="text-card demo-arrow my-px" rdxPreviewCardArrow></span>
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
    triggerId: string | null = null;
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
