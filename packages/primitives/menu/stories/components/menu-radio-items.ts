import { Component, signal } from '@angular/core';
import { MenuModule } from '@radix-ng/primitives/menu';
import { Dot, LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'menu-radio-items-story',
    imports: [MenuModule, LucideAngularModule],
    styleUrl: 'styles.css',
    template: `
        <div class="MenuRoot" MenuRoot>
            <div
                class="MenuTrigger"
                [menuTriggerFor]="menuGroup"
                side="bottom"
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
                <div class="MenuItem inset" MenuItem>Minimize window</div>
                <div class="MenuItem inset" MenuItem>Zoom</div>
                <div class="MenuItem inset" MenuItem>Smaller</div>

                <div class="MenuSeparator" MenuSeparator></div>
                <div MenuRadioGroup>
                    @for (item of items(); track $index) {
                        <div
                            class="MenuRadioItem inset"
                            [checked]="item === selectedItem"
                            (menuItemTriggered)="selectedItem = item"
                            MenuItemRadio
                        >
                            {{ item }}
                            <lucide-icon
                                class="MenuItemIndicator"
                                [img]="Dot"
                                MenuItemIndicator
                                size="16"
                                strokeWidth="5"
                            />
                        </div>
                    }
                </div>
            </div>
        </ng-template>
    `
})
export class MenuRadioItemsStory {
    readonly items = signal(['README.md', 'index.js', 'page.css']);

    selectedItem: string | undefined;

    protected readonly Dot = Dot;
}
