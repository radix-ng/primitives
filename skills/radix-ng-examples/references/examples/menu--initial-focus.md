# Menu — Initial focus

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

Enter, Space and the opening arrow choose the first/last enabled item. When every item is disabled,
focus stays on Popup. Once open, arrows and Home/End may focus disabled items without activating
them. A retained popup clears its Tab stops when closed and chooses its initial item again on reopen.
Enable Nested menu to check Tab departure: forward Tab follows the portal's declaration order,
while Shift+Tab returns to the submenu trigger and leaves the parent open. Keep mounted also checks
the same path after closing and reopening both levels.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-menu-initial-focus',
    imports: [RdxMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="flex w-72 flex-col gap-4">
            <div class="text-foreground grid gap-2 text-sm">
                <div class="flex items-center gap-2">
                    <input
                        class="accent-primary"
                        id="menu-initial-first"
                        #firstToggle
                        [checked]="firstDisabled()"
                        (change)="firstDisabled.set(firstToggle.checked)"
                        type="checkbox"
                    />
                    <label for="menu-initial-first">First item disabled</label>
                </div>
                <div class="flex items-center gap-2">
                    <input
                        class="accent-primary"
                        id="menu-initial-all"
                        #allToggle
                        [checked]="allDisabled()"
                        (change)="allDisabled.set(allToggle.checked)"
                        type="checkbox"
                    />
                    <label for="menu-initial-all">All items disabled</label>
                </div>
                <div class="flex items-center gap-2">
                    <input
                        class="accent-primary"
                        id="menu-initial-nested"
                        #nestedToggle
                        [checked]="nested()"
                        (change)="nested.set(nestedToggle.checked)"
                        type="checkbox"
                    />
                    <label for="menu-initial-nested">Nested menu</label>
                </div>
                <div class="flex items-center gap-2">
                    <input
                        class="accent-primary"
                        id="menu-initial-retained"
                        #retainedToggle
                        [checked]="keepMounted()"
                        (change)="keepMounted.set(retainedToggle.checked)"
                        type="checkbox"
                    />
                    <label for="menu-initial-retained">Keep mounted</label>
                </div>
            </div>
            <ng-container rdxMenuRoot>
                <button [class]="cn(b.base, b.outline, b.size.md)" rdxMenuTrigger>Actions</button>
                <ng-template [keepMounted]="keepMounted()" rdxMenuPortal>
                    <div [class]="m.positioner" sideOffset="4" rdxMenuPositioner>
                        <div [class]="m.popup" rdxMenuPopup>
                            @if (nested()) {
                                <ng-container rdxMenuRoot>
                                    <button [class]="m.item" [disabled]="allDisabled()" rdxMenuSubTrigger>
                                        More commands
                                    </button>
                                    <ng-template [keepMounted]="keepMounted()" rdxMenuPortal>
                                        <div [class]="m.positioner" side="right" sideOffset="4" rdxMenuPositioner>
                                            <div [class]="m.popup" rdxMenuPopup>
                                                <button
                                                    [class]="m.item"
                                                    [disabled]="firstDisabled() || allDisabled()"
                                                    (onSelect)="selected.set('First child command')"
                                                    rdxMenuItem
                                                >
                                                    First child command
                                                </button>
                                                <button
                                                    [class]="m.item"
                                                    [disabled]="allDisabled()"
                                                    (onSelect)="selected.set('Second child command')"
                                                    rdxMenuItem
                                                >
                                                    Second child command
                                                </button>
                                            </div>
                                        </div>
                                    </ng-template>
                                </ng-container>
                            }
                            <button
                                [class]="m.item"
                                [disabled]="firstDisabled() || allDisabled()"
                                (onSelect)="selected.set('First command')"
                                rdxMenuItem
                            >
                                First command
                            </button>
                            <button
                                [class]="m.item"
                                [disabled]="allDisabled()"
                                (onSelect)="selected.set('Second command')"
                                rdxMenuItem
                            >
                                Second command
                            </button>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
            <button [class]="cn(b.base, b.outline, b.size.md)">After menu</button>
            <output class="text-muted-foreground text-sm" aria-live="polite">Selected: {{ selected() }}</output>
        </div>
    `
})
export class RdxMenuInitialFocusComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly m = demoMenu;
    protected readonly firstDisabled = signal(true);
    protected readonly allDisabled = signal(false);
    protected readonly keepMounted = signal(false);
    protected readonly nested = signal(false);
    protected readonly selected = signal('none');
}
```
