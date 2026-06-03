import { cn, demoMenu, demoMenubar } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideDot } from '@lucide/angular';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { RdxMenubarRoot } from '@radix-ng/primitives/menubar';

@Component({
    selector: 'rdx-menubar-default',
    imports: [RdxMenuModule, RdxMenubarRoot, LucideCheck, LucideDot],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div rdxMenubarRoot [class]="mb.root">
            <!-- File -->
            <ng-container #fileMenu="rdxMenuRoot" rdxMenuRoot>
                <button rdxMenuTrigger [class]="mb.trigger">File</button>

                <div align="start" sideOffset="4" rdxMenuPositioner [class]="cn(m.positioner, 'data-[closed]:hidden')">
                    <div rdxMenuPopup [class]="m.popup">
                        <button rdxMenuItem [class]="m.item">
                            New Tab
                            <span [class]="mb.shortcut">⌘ T</span>
                        </button>
                        <button rdxMenuItem [class]="m.item">
                            New Window
                            <span [class]="mb.shortcut">⌘ N</span>
                        </button>
                        <button rdxMenuItem [class]="m.item" [disabled]="true">New Incognito Window</button>
                        <div rdxMenuSeparator [class]="m.separator"></div>

                        <!-- Share submenu -->
                        <ng-container #shareSub="rdxMenuRoot" rdxMenuRoot>
                            <button rdxMenuSubTrigger [class]="cn(m.item, 'justify-between')">
                                Share
                                <span class="text-muted-foreground text-xs">›</span>
                            </button>
                            @if (shareSub.open()) {
                                <div side="right" align="start" sideOffset="4" rdxMenuPositioner [class]="m.positioner">
                                    <div rdxMenuPopup [class]="m.popup">
                                        <button rdxMenuItem [class]="m.item">Email Link</button>
                                        <button rdxMenuItem [class]="m.item">Messages</button>
                                        <button rdxMenuItem [class]="m.item">Notes</button>
                                    </div>
                                </div>
                            }
                        </ng-container>

                        <div rdxMenuSeparator [class]="m.separator"></div>
                        <button rdxMenuItem [class]="m.item">
                            Print…
                            <span [class]="mb.shortcut">⌘ P</span>
                        </button>
                    </div>
                </div>
            </ng-container>

            <!-- Edit -->
            <ng-container #editMenu="rdxMenuRoot" rdxMenuRoot>
                <button rdxMenuTrigger [class]="mb.trigger">Edit</button>

                <div align="start" sideOffset="4" rdxMenuPositioner [class]="cn(m.positioner, 'data-[closed]:hidden')">
                    <div rdxMenuPopup [class]="m.popup">
                        <button rdxMenuItem [class]="m.item">
                            Undo
                            <span [class]="mb.shortcut">⌘ Z</span>
                        </button>
                        <button rdxMenuItem [class]="m.item">
                            Redo
                            <span [class]="mb.shortcut">⇧ ⌘ Z</span>
                        </button>
                        <div rdxMenuSeparator [class]="m.separator"></div>
                        <button rdxMenuItem [class]="m.item">
                            Cut
                            <span [class]="mb.shortcut">⌘ X</span>
                        </button>
                        <button rdxMenuItem [class]="m.item">
                            Copy
                            <span [class]="mb.shortcut">⌘ C</span>
                        </button>
                        <button rdxMenuItem [class]="m.item">
                            Paste
                            <span [class]="mb.shortcut">⌘ V</span>
                        </button>
                    </div>
                </div>
            </ng-container>

            <!-- View -->
            <ng-container #viewMenu="rdxMenuRoot" rdxMenuRoot>
                <button rdxMenuTrigger [class]="mb.trigger">View</button>

                <div align="start" sideOffset="4" rdxMenuPositioner [class]="cn(m.positioner, 'data-[closed]:hidden')">
                    <div rdxMenuPopup [class]="m.popup">
                        <label rdxMenuCheckboxItem [class]="m.selectableItem" [(checked)]="showBookmarks">
                            <span rdxMenuCheckboxItemIndicator [class]="m.itemIndicator">
                                <svg lucideCheck [size]="12"></svg>
                            </span>
                            Always Show Bookmarks Bar
                        </label>
                        <label rdxMenuCheckboxItem [class]="m.selectableItem" [(checked)]="showFullUrls">
                            <span rdxMenuCheckboxItemIndicator [class]="m.itemIndicator">
                                <svg lucideCheck [size]="12"></svg>
                            </span>
                            Always Show Full URLs
                        </label>
                        <div rdxMenuSeparator [class]="m.separator"></div>
                        <button rdxMenuItem [class]="m.item">
                            Reload
                            <span [class]="mb.shortcut">⌘ R</span>
                        </button>
                        <button rdxMenuItem [class]="m.item" [disabled]="true">
                            Force Reload
                            <span [class]="mb.shortcut">⇧ ⌘ R</span>
                        </button>
                        <div rdxMenuSeparator [class]="m.separator"></div>
                        <button rdxMenuItem [class]="m.item">Toggle Fullscreen</button>
                    </div>
                </div>
            </ng-container>

            <!-- Profiles -->
            <ng-container #profilesMenu="rdxMenuRoot" rdxMenuRoot>
                <button rdxMenuTrigger [class]="mb.trigger">Profiles</button>

                <div align="start" sideOffset="4" rdxMenuPositioner [class]="cn(m.positioner, 'data-[closed]:hidden')">
                    <div rdxMenuPopup [class]="m.popup">
                        <div rdxMenuRadioGroup [(value)]="activeProfile">
                            <label value="andy" rdxMenuRadioItem [class]="m.selectableItem">
                                <span rdxMenuRadioItemIndicator [class]="m.itemIndicator">
                                    <svg strokeWidth="5" lucideDot [size]="10"></svg>
                                </span>
                                Andy
                            </label>
                            <label value="luis" rdxMenuRadioItem [class]="m.selectableItem">
                                <span rdxMenuRadioItemIndicator [class]="m.itemIndicator">
                                    <svg strokeWidth="5" lucideDot [size]="10"></svg>
                                </span>
                                Luis
                            </label>
                        </div>
                        <div rdxMenuSeparator [class]="m.separator"></div>
                        <button rdxMenuItem [class]="cn(m.item, 'pl-8')">Edit…</button>
                        <button rdxMenuItem [class]="cn(m.item, 'pl-8')">Add Profile…</button>
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
