# Preview Card — Viewport

> One example from the [Preview Card](../components/preview-card.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

Animate content changes when different triggers render different payloads.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { previewCardImports } from '@radix-ng/primitives/preview-card';
import { cn, demoFocusRing, demoPopover } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-preview-card-viewport',
    imports: [...previewCardImports],
    template: `
        <ng-container #root="rdxPreviewCardRoot" rdxPreviewCardRoot>
            <p class="text-muted-foreground max-w-lg text-sm leading-6">
                Compare
                <a
                    [class]="link"
                    href="#"
                    payload="Typography arranges type for readable language."
                    rdxPreviewCardTrigger
                >
                    typography
                </a>
                ,
                <a [class]="link" href="#" payload="Design shapes objects and systems." rdxPreviewCardTrigger>design</a>
                , and
                <a
                    [class]="link"
                    href="#"
                    payload="Art communicates ideas through creative work."
                    rdxPreviewCardTrigger
                >
                    art
                </a>
                .
            </p>

            <div
                *rdxPreviewCardPortal
                [class]="cn(p.positioner, 'transition-[left,right,top,bottom] duration-200')"
                sideOffset="8"
                rdxPreviewCardPositioner
            >
                <div
                    [class]="cn(p.popup, 'overflow-hidden transition-[width,height] duration-200')"
                    rdxPreviewCardPopup
                >
                    <span [class]="p.arrow" rdxPreviewCardArrow></span>
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
export class RdxPreviewCardViewportComponent {
    protected readonly cn = cn;
    protected readonly p = demoPopover;
    protected readonly link = cn('font-medium text-primary underline underline-offset-4', demoFocusRing);
}
```
