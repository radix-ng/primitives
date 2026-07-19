# Drawer — Default

> One example from the [Drawer](../components/drawer.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

A bottom sheet you can swipe down to dismiss, with an accessible title, description, and close buttons.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { drawerImports } from '@radix-ng/primitives/drawer';
import { cn, demoButton, demoDrawer } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-drawer-default',
    imports: [...drawerImports, LucideX],
    template: `
        <div rdxDrawerRoot>
            <button [class]="cn(b.base, b.primary, b.size.md)" rdxDrawerTrigger>Open drawer</button>

            <ng-template rdxDrawerPortal>
                <div [class]="cn(d.backdrop, d.overlayAnimated)" rdxDrawerBackdrop></div>

                <div [class]="cn(d.popup, d.side.bottom)" rdxDrawerPopup>
                    <div [class]="d.grip" aria-hidden="true"></div>

                    <div [class]="d.body" rdxDrawerContent>
                        <h2 [class]="d.title" rdxDrawerTitle>Drag me down</h2>
                        <p [class]="d.description" rdxDrawerDescription>
                            Swipe the sheet downwards or press Escape to dismiss it. Releasing before the halfway point
                            snaps it back.
                        </p>

                        <p class="text-muted-foreground mt-4 text-sm">
                            The grab handle above is purely visual — the whole panel is draggable. Scrollable regions
                            yield to scrolling until they reach their edge.
                        </p>

                        <div [class]="d.footer">
                            <button [class]="cn(b.base, b.outline, b.size.sm)" rdxDrawerClose>Cancel</button>
                            <button [class]="cn(b.base, b.primary, b.size.sm)" rdxDrawerClose>Confirm</button>
                        </div>
                    </div>

                    <button [class]="d.close" aria-label="Close" rdxDrawerClose>
                        <svg aria-hidden="true" lucideX size="16"></svg>
                    </button>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDrawerDefaultComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDrawer;
}
```
