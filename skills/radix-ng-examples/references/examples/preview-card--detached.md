# Preview Card — Detached

> One example from the [Preview Card](../components/preview-card.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

Associate triggers outside the root through a shared handle.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    createRdxPreviewCardHandle,
    RdxPreviewCardArrow,
    RdxPreviewCardPopup,
    RdxPreviewCardPortal,
    RdxPreviewCardPositioner,
    RdxPreviewCardRoot,
    RdxPreviewCardTrigger
} from '@radix-ng/primitives/preview-card';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-preview-card-detached',
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
            <p class="text-muted-foreground max-w-lg text-sm leading-6">
                Detached triggers can live outside the root:
                <a
                    class="text-primary demo-focus font-medium underline underline-offset-4"
                    id="typography"
                    [handle]="previewCard"
                    href="#"
                    payload="Typography preview"
                    rdxPreviewCardTrigger
                >
                    typography
                </a>
                and
                <a
                    class="text-primary demo-focus font-medium underline underline-offset-4"
                    id="design"
                    [handle]="previewCard"
                    href="#"
                    payload="Design preview"
                    rdxPreviewCardTrigger
                >
                    design
                </a>
                .
            </p>

            <ng-container #root="rdxPreviewCardRoot" [handle]="previewCard" rdxPreviewCardRoot>
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
export class RdxPreviewCardDetachedComponent {
    protected readonly previewCard = createRdxPreviewCardHandle<string>();
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
