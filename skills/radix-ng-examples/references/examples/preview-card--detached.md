# Preview Card — Detached

> One example from the [Preview Card](../components/preview-card.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

Associate triggers outside the root through a shared handle.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { createRdxPreviewCardHandle, previewCardImports } from '@radix-ng/primitives/preview-card';
import { cn, demoFocusRing, demoPopover } from '../../storybook/styles';

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
                    [class]="link"
                    [handle]="previewCard"
                    href="#"
                    payload="Typography preview"
                    rdxPreviewCardTrigger
                >
                    typography
                </a>
                and
                <a
                    id="design"
                    [class]="link"
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
export class RdxPreviewCardDetachedComponent {
    protected readonly previewCard = createRdxPreviewCardHandle<string>();
    protected readonly p = demoPopover;
    protected readonly link = cn('font-medium text-primary underline underline-offset-4', demoFocusRing);
}
```
