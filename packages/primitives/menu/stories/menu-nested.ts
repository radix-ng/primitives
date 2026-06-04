import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-menu-nested',
    imports: [RdxMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container #root="rdxMenuRoot" rdxMenuRoot>
            <button [class]="cn(b.base, b.outline, b.size.md)" rdxMenuTrigger>Edit</button>

            @if (root.open()) {
                <div [class]="m.positioner" sideOffset="4" rdxMenuPositioner>
                    <div [class]="m.popup" rdxMenuPopup>
                        <button [class]="m.item" rdxMenuItem>Undo</button>
                        <button [class]="m.item" rdxMenuItem>Redo</button>
                        <div [class]="m.separator" rdxMenuSeparator></div>

                        <!-- Submenu: inner rdxMenuRoot provides submenu context -->
                        <ng-container #findSub="rdxMenuRoot" rdxMenuRoot>
                            <button [class]="cn(m.item, 'justify-between')" rdxMenuSubTrigger>
                                Find
                                <span class="text-muted-foreground text-xs">›</span>
                            </button>

                            @if (findSub.open()) {
                                <div [class]="m.positioner" side="right" align="start" sideOffset="4" rdxMenuPositioner>
                                    <div [class]="m.popup" rdxMenuPopup>
                                        <button [class]="m.item" rdxMenuItem>Search Web…</button>
                                        <button [class]="m.item" rdxMenuItem>Find…</button>
                                        <button [class]="m.item" rdxMenuItem>Find and Replace…</button>
                                        <button [class]="m.item" rdxMenuItem>Use Selection for Find</button>
                                    </div>
                                </div>
                            }
                        </ng-container>

                        <!-- Second submenu -->
                        <ng-container #spellSub="rdxMenuRoot" rdxMenuRoot>
                            <button [class]="cn(m.item, 'justify-between')" rdxMenuSubTrigger>
                                Spelling and Grammar
                                <span class="text-muted-foreground text-xs">›</span>
                            </button>

                            @if (spellSub.open()) {
                                <div [class]="m.positioner" side="right" align="start" sideOffset="4" rdxMenuPositioner>
                                    <div [class]="m.popup" rdxMenuPopup>
                                        <button [class]="m.item" rdxMenuItem>Show Spelling and Grammar</button>
                                        <button [class]="m.item" rdxMenuItem>Check Document Now</button>
                                        <div [class]="m.separator" rdxMenuSeparator></div>
                                        <button [class]="m.item" rdxMenuItem>Check Spelling While Typing</button>
                                        <button [class]="m.item" [disabled]="true" rdxMenuItem>Check Grammar</button>
                                    </div>
                                </div>
                            }
                        </ng-container>

                        <div [class]="m.separator" rdxMenuSeparator></div>
                        <button [class]="m.item" rdxMenuItem>Cut</button>
                        <button [class]="m.item" rdxMenuItem>Copy</button>
                        <button [class]="m.item" rdxMenuItem>Paste</button>
                    </div>
                </div>
            }
        </ng-container>
    `
})
export class RdxMenuNestedComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly m = demoMenu;
}
