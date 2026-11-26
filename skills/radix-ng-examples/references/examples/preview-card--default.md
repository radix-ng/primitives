# Preview Card — Default

> One example from the [Preview Card](../components/preview-card.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

Copy the standalone component and follow the linked example setup.

```typescript
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
            <p class="text-foreground max-w-md text-base text-balance">
                The principles of good
                <a
                    class="text-foreground decoration-foreground/60 hover:decoration-foreground data-popup-open:decoration-foreground focus-visible:outline-ring underline underline-offset-2 focus-visible:no-underline focus-visible:outline-2"
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
                <div class="demo-popup demo-popup-motion relative w-60 max-w-(--available-width)" rdxPreviewCardPopup>
                    <span class="h-1.5 w-3" rdxPreviewCardArrow aria-hidden="true">
                        <span class="demo-popup-arrow block size-full"></span>
                    </span>
                    <div class="flex flex-col gap-2 p-2">
                        <img
                            class="bg-muted aspect-[224/150] w-full object-cover"
                            src="https://images.unsplash.com/photo-1619615391095-dfa29e1672ef?q=80&w=448&h=300"
                            width="224"
                            height="150"
                            alt=""
                        />
                        <p class="text-foreground text-sm">
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
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
