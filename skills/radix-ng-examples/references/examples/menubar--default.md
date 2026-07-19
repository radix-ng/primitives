# Menubar — Default

> One example from the [Menubar](../components/menubar.md) docs — imports, anatomy, and the data-attribute styling contract live there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

A four-menu bar (File, Edit, View, Profiles) with a submenu, checkbox items, and a radio group.
Click a trigger to open it, then hover the other triggers to switch, or use the arrow keys.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideDot } from '@lucide/angular';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { RdxMenubarRoot } from '@radix-ng/primitives/menubar';
import { cn, demoMenu, demoMenubar } from '../../storybook/styles';

@Component({
    selector: 'rdx-menubar-default',
    imports: [RdxMenuModule, RdxMenubarRoot, LucideCheck, LucideDot],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div [class]="mb.root" rdxMenubarRoot>
            <!-- File -->
            <ng-container #fileMenu="rdxMenuRoot" rdxMenuRoot>
                <button [class]="mb.trigger" rdxMenuTrigger>File</button>

                <div [class]="cn(m.positioner, 'data-[closed]:hidden')" align="start" sideOffset="4" rdxMenuPositioner>
                    <div [class]="m.popup" rdxMenuPopup>
                        <button [class]="m.item" rdxMenuItem>
                            New Tab
                            <span [class]="mb.shortcut">⌘ T</span>
                        </button>
                        <button [class]="m.item" rdxMenuItem>
                            New Window
                            <span [class]="mb.shortcut">⌘ N</span>
                        </button>
                        <button [class]="m.item" [disabled]="true" rdxMenuItem>New Incognito Window</button>
                        <div [class]="m.separator" rdxMenuSeparator></div>

                        <!-- Share submenu -->
                        <ng-container #shareSub="rdxMenuRoot" rdxMenuRoot>
                            <button [class]="cn(m.item, 'justify-between')" rdxMenuSubTrigger>
                                Share
                                <span class="text-muted-foreground text-xs">›</span>
                            </button>
                            @if (shareSub.open()) {
                                <div [class]="m.positioner" side="right" align="start" sideOffset="4" rdxMenuPositioner>
                                    <div [class]="m.popup" rdxMenuPopup>
                                        <button [class]="m.item" rdxMenuItem>Email Link</button>
                                        <button [class]="m.item" rdxMenuItem>Messages</button>
                                        <button [class]="m.item" rdxMenuItem>Notes</button>
                                    </div>
                                </div>
                            }
                        </ng-container>

                        <div [class]="m.separator" rdxMenuSeparator></div>
                        <button [class]="m.item" rdxMenuItem>
                            Print…
                            <span [class]="mb.shortcut">⌘ P</span>
                        </button>
                    </div>
                </div>
            </ng-container>

            <!-- Edit -->
            <ng-container #editMenu="rdxMenuRoot" rdxMenuRoot>
                <button [class]="mb.trigger" rdxMenuTrigger>Edit</button>

                <div [class]="cn(m.positioner, 'data-[closed]:hidden')" align="start" sideOffset="4" rdxMenuPositioner>
                    <div [class]="m.popup" rdxMenuPopup>
                        <button [class]="m.item" rdxMenuItem>
                            Undo
                            <span [class]="mb.shortcut">⌘ Z</span>
                        </button>
                        <button [class]="m.item" rdxMenuItem>
                            Redo
                            <span [class]="mb.shortcut">⇧ ⌘ Z</span>
                        </button>
                        <div [class]="m.separator" rdxMenuSeparator></div>
                        <button [class]="m.item" rdxMenuItem>
                            Cut
                            <span [class]="mb.shortcut">⌘ X</span>
                        </button>
                        <button [class]="m.item" rdxMenuItem>
                            Copy
                            <span [class]="mb.shortcut">⌘ C</span>
                        </button>
                        <button [class]="m.item" rdxMenuItem>
                            Paste
                            <span [class]="mb.shortcut">⌘ V</span>
                        </button>
                    </div>
                </div>
            </ng-container>

            <!-- View -->
            <ng-container #viewMenu="rdxMenuRoot" rdxMenuRoot>
                <button [class]="mb.trigger" rdxMenuTrigger>View</button>

                <div [class]="cn(m.positioner, 'data-[closed]:hidden')" align="start" sideOffset="4" rdxMenuPositioner>
                    <div [class]="m.popup" rdxMenuPopup>
                        <label [(checked)]="showBookmarks" [class]="m.selectableItem" rdxMenuCheckboxItem>
                            <span [class]="m.itemIndicator" rdxMenuCheckboxItemIndicator>
                                <svg [size]="12" lucideCheck></svg>
                            </span>
                            Always Show Bookmarks Bar
                        </label>
                        <label [(checked)]="showFullUrls" [class]="m.selectableItem" rdxMenuCheckboxItem>
                            <span [class]="m.itemIndicator" rdxMenuCheckboxItemIndicator>
                                <svg [size]="12" lucideCheck></svg>
                            </span>
                            Always Show Full URLs
                        </label>
                        <div [class]="m.separator" rdxMenuSeparator></div>
                        <button [class]="m.item" rdxMenuItem>
                            Reload
                            <span [class]="mb.shortcut">⌘ R</span>
                        </button>
                        <button [class]="m.item" [disabled]="true" rdxMenuItem>
                            Force Reload
                            <span [class]="mb.shortcut">⇧ ⌘ R</span>
                        </button>
                        <div [class]="m.separator" rdxMenuSeparator></div>
                        <button [class]="m.item" rdxMenuItem>Toggle Fullscreen</button>
                    </div>
                </div>
            </ng-container>

            <!-- Profiles -->
            <ng-container #profilesMenu="rdxMenuRoot" rdxMenuRoot>
                <button [class]="mb.trigger" rdxMenuTrigger>Profiles</button>

                <div [class]="cn(m.positioner, 'data-[closed]:hidden')" align="start" sideOffset="4" rdxMenuPositioner>
                    <div [class]="m.popup" rdxMenuPopup>
                        <div [(value)]="activeProfile" rdxMenuRadioGroup>
                            <label [class]="m.selectableItem" value="andy" rdxMenuRadioItem>
                                <span [class]="m.itemIndicator" rdxMenuRadioItemIndicator>
                                    <svg [size]="10" strokeWidth="5" lucideDot></svg>
                                </span>
                                Andy
                            </label>
                            <label [class]="m.selectableItem" value="luis" rdxMenuRadioItem>
                                <span [class]="m.itemIndicator" rdxMenuRadioItemIndicator>
                                    <svg [size]="10" strokeWidth="5" lucideDot></svg>
                                </span>
                                Luis
                            </label>
                        </div>
                        <div [class]="m.separator" rdxMenuSeparator></div>
                        <button [class]="cn(m.item, 'pl-8')" rdxMenuItem>Edit…</button>
                        <button [class]="cn(m.item, 'pl-8')" rdxMenuItem>Add Profile…</button>
                    </div>
                </div>
            </ng-container>
        </div>
    `
})
export class RdxMenubarDefaultComponent {
    protected readonly cn = cn;
    protected readonly mb = demoMenubar;
    protected readonly m = demoMenu;

    showBookmarks = signal(true);
    showFullUrls = signal(false);
    activeProfile = signal<string | undefined>('andy');
}
```
