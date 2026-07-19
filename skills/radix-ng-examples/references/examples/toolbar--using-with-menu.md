# Toolbar — Using with Menu

> One example from the [Toolbar](../components/toolbar.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.1` — if the installed version differs, verify the API against the installed package.

Render a `[rdxMenuTrigger]` on a toolbar button to open a menu from the toolbar.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { toolbarImports } from '@radix-ng/primitives/toolbar';
import { demoMenu } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'toolbar-with-menu',
    imports: [...toolbarImports, RdxMenuModule, LucideChevronDown],
    template: `
        <div
            class="border-border bg-background flex items-center gap-1 rounded-lg border p-1 shadow-sm"
            rdxToolbarRoot
            aria-label="Toolbar with menu"
        >
            <button
                class="${'text-foreground hover:bg-muted focus-visible:ring-ring inline-flex h-8 items-center justify-center rounded-md px-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2'}"
                rdxToolbarButton
            >
                Bold
            </button>
            <button
                class="${'text-foreground hover:bg-muted focus-visible:ring-ring inline-flex h-8 items-center justify-center rounded-md px-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2'}"
                rdxToolbarButton
            >
                Italic
            </button>

            <div class="bg-border mx-1 h-5 w-px" rdxToolbarSeparator orientation="vertical"></div>

            <ng-container #menu="rdxMenuRoot" rdxMenuRoot>
                <button
                    class="text-foreground hover:bg-muted focus-visible:ring-ring data-[popup-open]:bg-muted inline-flex h-8 items-center justify-center gap-1 rounded-md px-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2"
                    rdxToolbarButton
                    rdxMenuTrigger
                >
                    More
                    <svg lucideChevronDown size="14"></svg>
                </button>

                @if (menu.open()) {
                    <div [class]="m.positioner" sideOffset="6" rdxMenuPositioner>
                        <div [class]="m.popup" rdxMenuPopup>
                            <button [class]="m.item" rdxMenuItem>Undo</button>
                            <button [class]="m.item" rdxMenuItem>Redo</button>
                            <div [class]="m.separator" rdxMenuSeparator></div>
                            <button [class]="m.item" rdxMenuItem>Clear formatting</button>
                        </div>
                    </div>
                }
            </ng-container>
        </div>
    `
})
export class ToolbarWithMenuExample {
    protected readonly m = demoMenu;
}
```
