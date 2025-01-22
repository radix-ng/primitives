import { Component } from '@angular/core';
import { RdxPositionAlign, RdxPositionSide } from '@radix-ng/primitives/core';
import { MenuModule } from '@radix-ng/primitives/menu';
import { ArrowRight, LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'menu-with-sub-menu-story',
    imports: [MenuModule, LucideAngularModule],
    styleUrl: 'styles.css',
    template: `
        <div class="MenuRoot" MenuRoot>
            <div
                class="MenuTrigger"
                [menuTriggerFor]="menuGroup"
                align="start"
                sideOffset="5"
                alignOffset="-3"
                MenuItem
                MenuTrigger
            >
                File
            </div>
        </div>

        <ng-template #menuGroup>
            <div class="MenuContent" MenuContent>
                <div class="MenuItem " MenuItem>Undo</div>
                <div class="MenuItem " MenuItem>Redo</div>
                <div class="MenuSeparator" MenuSeparator></div>

                <div
                    class="MenuItem"
                    [menuTriggerFor]="subMenu"
                    align="start"
                    sideOffset="-20"
                    alignOffset="210"
                    MenuItem
                    MenuTrigger
                >
                    Find
                    <div class="RightSlot"><lucide-angular [img]="ArrowRight" size="16" strokeWidth="2" /></div>
                </div>

                <div class="MenuSeparator" MenuSeparator></div>

                <div class="MenuItem " MenuItem>Cut</div>
                <div class="MenuItem " MenuItem>Copy</div>
                <div class="MenuItem " MenuItem>Paste</div>
            </div>
        </ng-template>

        <ng-template #subMenu>
            <div class="MenuSubContent" MenuContent>
                <div class="MenuItem" MenuItem>Undo</div>
                <div class="MenuItem" MenuItem>Redo</div>
                <div class="MenuSeparator" MenuSeparator></div>
                <div class="MenuItem" MenuItem>Cut</div>
                <div class="MenuItem" MenuItem>Copy</div>
                <div class="MenuItem" MenuItem>Paste</div>
            </div>
        </ng-template>
    `
})
export class MenuWithSubMenuStory {
    protected readonly ArrowRight = ArrowRight;
    protected readonly RdxPositionAlign = RdxPositionAlign;
    protected readonly RdxPositionSide = RdxPositionSide;
}
