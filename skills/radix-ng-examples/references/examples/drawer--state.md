# Drawer — State

> One example from the [Drawer](../components/drawer.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

Own the open state with `[(open)]` and drive it from anywhere — buttons outside the drawer open and
close it alongside the trigger.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { drawerImports } from '@radix-ng/primitives/drawer';
import { cn, demoButton, demoDrawer } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-drawer-controlled',
    imports: [...drawerImports],
    template: `
        <div class="flex flex-col items-center gap-4">
            <p class="text-muted-foreground text-xs">Drawer is {{ open() ? 'open' : 'closed' }}</p>

            <button [class]="cn(b.base, b.outline, b.size.sm)" (click)="open.set(true)">Open from outside</button>

            <div [(open)]="open" rdxDrawerRoot>
                <button [class]="cn(b.base, b.primary, b.size.md)" rdxDrawerTrigger>Open drawer</button>

                <ng-template rdxDrawerPortal>
                    <div [class]="cn(d.backdrop, d.overlayAnimated)" rdxDrawerBackdrop></div>

                    <div [class]="cn(d.popup, d.side.bottom)" rdxDrawerPopup>
                        <div [class]="d.grip" aria-hidden="true"></div>

                        <div [class]="d.body" rdxDrawerContent>
                            <h2 [class]="d.title" rdxDrawerTitle>Controlled drawer</h2>
                            <p [class]="d.description" rdxDrawerDescription>
                                The open state is owned by the component and bound with
                                <code>[(open)]</code>
                                .
                            </p>

                            <div [class]="d.footer">
                                <button [class]="cn(b.base, b.primary, b.size.sm)" (click)="open.set(false)">
                                    Close from outside
                                </button>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class RdxDrawerControlledComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDrawer;
    protected readonly open = signal(false);
}
```
