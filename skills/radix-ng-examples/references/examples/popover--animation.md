# Popover — Animation

> One example from the [Popover](../components/popover.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

Apply native CSS keyframe utilities to the positioner (the portal's root element) for the enter/exit
fade — the closed-state keyframes keep the content mounted until `animationend`. Transform-based
zoom/slide belongs on the popup, so it never fights the positioner's placement transform.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { popoverImports } from '@radix-ng/primitives/popover';
import { cn, demoButton, demoPopover } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-popover-animated',
    imports: [...popoverImports, LucideX],
    template: `
        <ng-container rdxPopoverRoot>
            <button [class]="cn(b.base, b.outline, b.size.md)" rdxPopoverTrigger>Animated popover</button>

            <div *rdxPopoverPortal [class]="p.positioner" sideOffset="8" rdxPopoverPositioner>
                <div [class]="cn(p.popup, p.popupAnimated)" rdxPopoverPopup>
                    <span [class]="p.arrow" rdxPopoverArrow></span>
                    <h2 [class]="p.title" rdxPopoverTitle>Native CSS keyframes</h2>
                    <p [class]="p.description" rdxPopoverDescription>
                        Presence keeps this content mounted until the exit animation finishes.
                    </p>
                    <button [class]="p.close" aria-label="Close" rdxPopoverClose>
                        <svg aria-hidden="true" lucideX size="14" />
                    </button>
                </div>
            </div>
        </ng-container>
    `
})
export class RdxPopoverAnimatedComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly p = demoPopover;
}
```
