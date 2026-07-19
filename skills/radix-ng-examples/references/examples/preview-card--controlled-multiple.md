# Preview Card — Controlled Multiple

> One example from the [Preview Card](../components/preview-card.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

Control both the open state and the active trigger id.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { previewCardImports } from '@radix-ng/primitives/preview-card';
import { cn, demoButton, demoFocusRing, demoPopover } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-preview-card-controlled-multiple',
    imports: [...previewCardImports],
    template: `
        <div class="grid gap-4">
            <div class="flex items-center gap-3">
                <button [class]="cn(b.base, b.outline, b.size.sm)" (click)="openFrom('design')" type="button">
                    Open design
                </button>
                <button [class]="cn(b.base, b.outline, b.size.sm)" (click)="open = false" type="button">Close</button>
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
                    <a id="typography" [class]="link" [payload]="cards.typography" href="#" rdxPreviewCardTrigger>
                        typography
                    </a>
                    ,
                    <a id="design" [class]="link" [payload]="cards.design" href="#" rdxPreviewCardTrigger>design</a>
                    , or
                    <a id="art" [class]="link" [payload]="cards.art" href="#" rdxPreviewCardTrigger>art</a>
                    .
                </p>

                <div *rdxPreviewCardPortal [class]="p.positioner" sideOffset="8" rdxPreviewCardPositioner>
                    <div [class]="p.popup" rdxPreviewCardPopup>
                        <span [class]="p.arrow" rdxPreviewCardArrow></span>
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
```
