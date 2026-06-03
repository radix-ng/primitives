import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideDot as Dot, LucideDynamicIcon } from '@lucide/angular';
import { RdxMenuModule } from '@radix-ng/primitives/menu';

@Component({
    selector: 'menu-radio-items-story',
    imports: [RdxMenuModule, LucideDynamicIcon],
    styleUrl: 'styles.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="MenuRoot" RdxMenuRoot>
            <div
                class="MenuTrigger"
                [menuTriggerFor]="menuGroup"
                side="bottom"
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
                <div class="MenuItem inset" RdxMenuItem>Minimize window</div>
                <div class="MenuItem inset" RdxMenuItem>Zoom</div>
                <div class="MenuItem inset" RdxMenuItem>Smaller</div>

                <div class="MenuSeparator" RdxMenuSeparator></div>
                <div RdxMenuRadioGroup>
                    @for (item of items(); track $index) {
                        <div
                            class="MenuRadioItem inset"
                            [checked]="item === selectedItem"
                            (menuItemTriggered)="selectedItem = item"
                            RdxMenuItemRadio
                        >
                            {{ item }}
                            <svg
                                class="MenuItemIndicator"
                                [lucideIcon]="Dot"
                                RdxMenuItemIndicator
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
