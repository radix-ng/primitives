import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxPositionAlign, RdxPositionSide } from '@radix-ng/primitives/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { ArrowRight, LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'menu-with-sub-menu-story',
    imports: [RdxMenuModule, LucideAngularModule],
    styleUrl: 'styles.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="MenuRoot" RdxMenuRoot>
            <div
                class="MenuTrigger"
                [menuTriggerFor]="menuGroup"
                align="start"
                sideOffset="5"
                alignOffset="-3"
                RdxMenuItem
                RdxMenuTrigger
            >
                File
            </div>
        </div>

        <ng-template #menuGroup>
            <div class="MenuContent" RdxMenuContent>
                <div class="MenuItem" RdxMenuItem>Undo</div>
                <div class="MenuItem" RdxMenuItem>Redo</div>
                <div class="MenuSeparator" RdxMenuSeparator></div>

                <div
                    class="MenuItem"
                    [menuTriggerFor]="subMenu"
                    align="start"
                    sideOffset="-20"
                    alignOffset="210"
                    RdxMenuItem
                    RdxMenuTrigger
                >
                    Find
                    <div class="RightSlot"><lucide-angular [img]="ArrowRight" size="16" strokeWidth="2" /></div>
                </div>

                <div class="MenuSeparator" RdxMenuSeparator></div>

                <div class="MenuItem" RdxMenuItem>Cut</div>
                <div class="MenuItem" RdxMenuItem>Copy</div>
                <div class="MenuItem" RdxMenuItem>Paste</div>
            </div>
        </ng-template>

        <ng-template #subMenu>
            <div class="MenuSubContent" RdxMenuContent>
                <div class="MenuItem" RdxMenuItem>Undo</div>
                <div class="MenuItem" RdxMenuItem>Redo</div>
                <div class="MenuSeparator" RdxMenuSeparator></div>
                <div class="MenuItem" RdxMenuItem>Cut</div>
                <div class="MenuItem" RdxMenuItem>Copy</div>
                <div class="MenuItem" RdxMenuItem>Paste</div>
            </div>
        </ng-template>
    `
})
export class MenuWithSubMenuStory {
    protected readonly ArrowRight = ArrowRight;
    protected readonly RdxPositionAlign = RdxPositionAlign;
    protected readonly RdxPositionSide = RdxPositionSide;
}
