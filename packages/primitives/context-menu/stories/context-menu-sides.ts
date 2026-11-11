import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxContextMenuModule } from '@radix-ng/primitives/context-menu';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-context-menu-sides',
    imports: [RdxContextMenuModule, RdxMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'w-full max-w-md' },
    template: `
        <div class="grid grid-cols-2 gap-4">
            @for (side of sides; track side) {
                <ng-container rdxContextMenuRoot>
                    <div
                        [class]="cn(m.contextArea, 'aspect-video w-full flex-col gap-1')"
                        tabindex="0"
                        rdxContextMenuTrigger
                    >
                        <span class="font-medium capitalize">{{ side }}</span>
                        <span class="pointer-coarse:hidden">Right-click here</span>
                        <span class="hidden pointer-coarse:inline">Long-press here</span>
                    </div>
                    <ng-template rdxMenuPortal>
                        <div [class]="m.positioner" [side]="side" align="start" sideOffset="8" rdxMenuPositioner>
                            <div [class]="cn(m.popup, 'min-w-40!')" rdxMenuPopup>
                                <button [class]="m.item" type="button" rdxMenuItem>Back</button>
                                <button [class]="m.item" type="button" rdxMenuItem>Forward</button>
                                <button [class]="m.item" type="button" rdxMenuItem>Reload</button>
                            </div>
                        </div>
                    </ng-template>
                </ng-container>
            }
        </div>
    `
})
export class RdxContextMenuSidesComponent {
    protected readonly sides = ['top', 'right', 'bottom', 'left'] as const;
    protected readonly cn = cn;
    protected readonly m = demoMenu;
}
