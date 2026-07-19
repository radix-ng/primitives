# Drawer — Non-modal

> One example from the [Drawer](../components/drawer.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

Set `[modal]="false"` to keep page scrolling and outside pointer interactions available while the
drawer is open; there is no backdrop in this mode.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { drawerImports } from '@radix-ng/primitives/drawer';
import { cn, demoButton, demoDrawer } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-drawer-non-modal',
    imports: [...drawerImports],
    template: `
        <div class="flex flex-col items-center gap-4">
            <p class="text-muted-foreground max-w-96 text-center text-xs leading-5">
                Non-modal: page scrolling and outside pointer interactions stay enabled while the drawer is open, and
                there is no backdrop.
            </p>

            <div [modal]="false" rdxDrawerRoot>
                <button [class]="cn(b.base, b.primary, b.size.md)" rdxDrawerTrigger>Open non-modal drawer</button>

                <ng-template rdxDrawerPortal>
                    <div [class]="cn(d.popup, d.side.bottom, d.overlayAnimated)" rdxDrawerPopup>
                        <div [class]="d.grip" aria-hidden="true"></div>

                        <div [class]="d.body" rdxDrawerContent>
                            <h2 [class]="d.title" rdxDrawerTitle>Non-modal drawer</h2>
                            <p [class]="d.description" rdxDrawerDescription>
                                Keep interacting with the rest of the page; the counter below still works.
                            </p>

                            <div [class]="d.footer">
                                <button [class]="cn(b.base, b.primary, b.size.sm)" rdxDrawerClose>Close</button>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </div>

            <button [class]="cn(b.base, b.secondary, b.size.sm)" (click)="outsideClicks.update((count) => count + 1)">
                Outside interaction target: {{ outsideClicks() }}
            </button>
        </div>
    `
})
export class RdxDrawerNonModalComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDrawer;
    protected readonly outsideClicks = signal(0);
}
```
