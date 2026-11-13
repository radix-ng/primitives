# Menu — Item highlight

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

Use `(onItemHighlighted)` to preview the current command as the user navigates. `$event` contains
`item` (the native element, or `undefined` after clearing), `label`, `reason` and the original native
`event`. The reason is `keyboard` for arrows/typeahead, `pointer` for hover/leave, and `none` for
opening, closing or collection changes. Changes without native input carry a generic `Event`.

The label uses the item's explicit `label` input, falling back to its text content. Repeating the
same item does not emit again. Replacing the element at the same index does emit; changing only
its label does not. Each nested Root reports its own highlighted item.

The event type narrows with `reason`: checking `keyboard` gives a `KeyboardEvent`, and `pointer`
gives a `MouseEvent | PointerEvent`.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxMenuItemHighlightedEvent, RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-menu-highlight-example',
    imports: [RdxMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <section class="grid w-80 gap-4">
            <ng-container (onItemHighlighted)="highlight.set($event)" rdxMenuRoot>
                <button [class]="cn(b.base, b.outline, b.size.md)" rdxMenuTrigger>Command preview</button>
                <div *rdxMenuPortal [class]="m.positioner" align="start" sideOffset="4" rdxMenuPositioner>
                    <div [class]="m.popup" rdxMenuPopup>
                        <button [class]="m.item" rdxMenuItem>Open file</button>
                        <button [class]="m.item" [disabled]="true" rdxMenuItem>Save file</button>
                        <button [class]="m.item" label="Export document" rdxMenuItem>Export…</button>
                        <button [class]="m.item" rdxMenuItem>Print document</button>
                    </div>
                </div>
            </ng-container>
            <p class="text-muted-foreground text-sm">Use arrow keys, type a command, or hover to preview an item.</p>
            <output class="grid gap-1 text-sm">
                <span>Highlighted: {{ highlight()?.label ?? 'none' }}</span>
                <span class="text-muted-foreground">Reason: {{ highlight()?.reason ?? 'none' }}</span>
            </output>
        </section>
    `
})
export class RdxMenuHighlightExampleComponent {
    protected readonly highlight = signal<RdxMenuItemHighlightedEvent | undefined>(undefined);
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly m = demoMenu;
}
```
