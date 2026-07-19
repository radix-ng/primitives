# Drawer — Nested drawers

> One example from the [Drawer](../components/drawer.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

Drawers stack on top of each other — each level's content hosts the trigger for the next. Nesting is
detected through the dialog hierarchy, so every parent gains `data-nested-drawer-open` (and
`--nested-drawers`) and recedes behind the one in front.

```typescript
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { drawerImports } from '@radix-ng/primitives/drawer';
import { cn, demoButton, demoDrawer } from '../../storybook/styles';

/**
 * A self-recursive drawer: each level's content hosts the trigger for the next level, so drawers
 * stack on top of each other. Nesting is detected through the dialog hierarchy, so every parent
 * gains `data-nested-drawer-open` and recedes behind the one in front (see `demoDrawer.popup`).
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-drawer-nested',
    imports: [...drawerImports],
    template: `
        <div rdxDrawerRoot>
            <button [class]="cn(b.base, level() === 1 ? b.primary : b.outline, b.size.md)" rdxDrawerTrigger>
                {{ level() === 1 ? 'Open drawer' : 'Open drawer ' + level() }}
            </button>

            <ng-template rdxDrawerPortal>
                <div [class]="cn(d.backdrop, d.overlayAnimated)" rdxDrawerBackdrop></div>

                <div [class]="cn(d.popup, d.side.bottom)" rdxDrawerPopup>
                    <div [class]="d.grip" aria-hidden="true"></div>

                    <div [class]="d.body" rdxDrawerContent>
                        <h2 [class]="d.title" rdxDrawerTitle>Drawer level {{ level() }}</h2>
                        <p [class]="d.description" rdxDrawerDescription>
                            @if (level() < max()) {
                                Open another to stack it on top — this one scales back and peeks behind it.
                            } @else {
                                Deepest level. Swipe down or press Escape to peel the stack back one at a time.
                            }
                        </p>

                        <div [class]="d.footer">
                            @if (level() < max()) {
                                <rdx-drawer-nested [level]="level() + 1" [max]="max()" />
                            }
                            <button [class]="cn(b.base, b.outline, b.size.sm)" rdxDrawerClose>Close</button>
                        </div>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDrawerNestedComponent {
    /** Current depth (1 = the root drawer). */
    readonly level = input(1);
    /** How many levels can be stacked. */
    readonly max = input(4);

    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDrawer;
}
```
