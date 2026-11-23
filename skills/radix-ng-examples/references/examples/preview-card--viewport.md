# Preview Card — Viewport

> One example from the [Preview Card](../components/preview-card.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Animate content changes when different triggers render different payloads.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxPreviewCardArrow,
    RdxPreviewCardPopup,
    RdxPreviewCardPortal,
    RdxPreviewCardPositioner,
    RdxPreviewCardRoot,
    RdxPreviewCardTrigger,
    RdxPreviewCardViewport
} from '@radix-ng/primitives/preview-card';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-preview-card-viewport',
    imports: [
        RdxPreviewCardRoot,
        RdxPreviewCardTrigger,
        RdxPreviewCardPortal,
        RdxPreviewCardPositioner,
        RdxPreviewCardPopup,
        RdxPreviewCardArrow,
        RdxPreviewCardViewport
    ],
    template: `
        <ng-container #root="rdxPreviewCardRoot" rdxPreviewCardRoot>
            <p class="text-muted-foreground max-w-lg text-sm leading-6">
                Compare
                <a
                    class="text-primary demo-focus font-medium underline underline-offset-4"
                    href="#"
                    payload="Typography arranges type for readable language."
                    rdxPreviewCardTrigger
                >
                    typography
                </a>
                ,
                <a
                    class="text-primary demo-focus font-medium underline underline-offset-4"
                    href="#"
                    payload="Design shapes objects and systems."
                    rdxPreviewCardTrigger
                >
                    design
                </a>
                , and
                <a
                    class="text-primary demo-focus font-medium underline underline-offset-4"
                    href="#"
                    payload="Art communicates ideas through creative work."
                    rdxPreviewCardTrigger
                >
                    art
                </a>
                .
            </p>

            <div
                class="z-50 transition-[left,right,top,bottom] duration-200"
                *rdxPreviewCardPortal
                sideOffset="8"
                rdxPreviewCardPositioner
            >
                <div
                    class="demo-surface relative w-80 overflow-hidden p-4 transition-[width,height] duration-200"
                    rdxPreviewCardPopup
                >
                    <span class="text-card demo-arrow my-px" rdxPreviewCardArrow></span>
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
export class RdxPreviewCardViewportComponent {}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
