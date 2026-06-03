import { cn, demoButton, demoMenu } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';

@Component({
    selector: 'rdx-menu-nested',
    imports: [RdxMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container #root="rdxMenuRoot" rdxMenuRoot>
            <button rdxMenuTrigger [class]="cn(b.base, b.outline, b.size.md)">Edit</button>

            <div *rdxMenuPortal sideOffset="4" rdxMenuPositioner [class]="m.positioner">
                <div rdxMenuPopup [class]="m.popup">
                    <button rdxMenuItem [class]="m.item">Undo</button>
                    <button rdxMenuItem [class]="m.item">Redo</button>
                    <div rdxMenuSeparator [class]="m.separator"></div>

                    <!-- Submenu: inner rdxMenuRoot provides submenu context -->
                    <ng-container #findSub="rdxMenuRoot" rdxMenuRoot>
                        <button rdxMenuSubTrigger [class]="cn(m.item, 'justify-between')">
                            Find
                            <span class="text-muted-foreground text-xs">›</span>
                        </button>

                        <div
                            *rdxMenuPortal
                            side="right"
                            align="start"
                            sideOffset="4"
                            rdxMenuPositioner
                            [class]="m.positioner"
                        >
                            <div rdxMenuPopup [class]="m.popup">
                                <button rdxMenuItem [class]="m.item">Search Web…</button>
                                <button rdxMenuItem [class]="m.item">Find…</button>
                                <button rdxMenuItem [class]="m.item">Find and Replace…</button>
                                <button rdxMenuItem [class]="m.item">Use Selection for Find</button>
                            </div>
                        </div>
                    </ng-container>

                    <!-- Second submenu -->
                    <ng-container #spellSub="rdxMenuRoot" rdxMenuRoot>
                        <button rdxMenuSubTrigger [class]="cn(m.item, 'justify-between')">
                            Spelling and Grammar
                            <span class="text-muted-foreground text-xs">›</span>
                        </button>

                        <div
                            *rdxMenuPortal
                            side="right"
                            align="start"
                            sideOffset="4"
                            rdxMenuPositioner
                            [class]="m.positioner"
                        >
                            <div rdxMenuPopup [class]="m.popup">
                                <button rdxMenuItem [class]="m.item">Show Spelling and Grammar</button>
                                <button rdxMenuItem [class]="m.item">Check Document Now</button>
                                <div rdxMenuSeparator [class]="m.separator"></div>
                                <button rdxMenuItem [class]="m.item">Check Spelling While Typing</button>
                                <button rdxMenuItem [class]="m.item" [disabled]="true">Check Grammar</button>
                            </div>
                        </div>
                    </ng-container>

                    <div rdxMenuSeparator [class]="m.separator"></div>
                    <button rdxMenuItem [class]="m.item">Cut</button>
                    <button rdxMenuItem [class]="m.item">Copy</button>
                    <button rdxMenuItem [class]="m.item">Paste</button>
                </div>
            </div>
        </ng-container>
    `
})
export class RdxMenuNestedComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly m = demoMenu;
}
