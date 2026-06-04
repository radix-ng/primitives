import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoMenu } from '../../../storybook/styles';

@Component({
    selector: 'menu-radio-items-story',
    imports: [RdxMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container #root="rdxMenuRoot" rdxMenuRoot>
            <button [class]="cn(b.base, b.outline, b.size.md)" rdxMenuTrigger>View</button>

            @if (root.open()) {
                <div [class]="m.positioner" sideOffset="4" rdxMenuPositioner>
                    <div [class]="m.popup" rdxMenuPopup>
                        <button [class]="m.item" rdxMenuItem>Minimize window</button>
                        <button [class]="m.item" rdxMenuItem>Zoom</button>
                        <div [class]="m.separator" rdxMenuSeparator></div>
                        <div [(value)]="selectedItem" rdxMenuRadioGroup>
                            @for (item of items(); track item) {
                                <label [class]="m.selectableItem" [value]="item" rdxMenuRadioItem>
                                    <span [class]="m.itemIndicator" rdxMenuRadioItemIndicator>●</span>
                                    {{ item }}
                                </label>
                            }
                        </div>
                    </div>
                </div>
            }
        </ng-container>
    `
})
export class MenuRadioItemsStory {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly m = demoMenu;

    readonly items = signal(['README.md', 'index.js', 'page.css']);
    selectedItem: string | undefined = undefined;
}
