import { cn, demoButton, demoMenu } from '../../../storybook/styles';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';

@Component({
    selector: 'menu-radio-items-story',
    imports: [RdxMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container #root="rdxMenuRoot" rdxMenuRoot>
            <button rdxMenuTrigger [class]="cn(b.base, b.outline, b.size.md)">View</button>

            <div *rdxMenuPortal sideOffset="4" rdxMenuPositioner [class]="m.positioner">
                <div rdxMenuPopup [class]="m.popup">
                    <button rdxMenuItem [class]="m.item">Minimize window</button>
                    <button rdxMenuItem [class]="m.item">Zoom</button>
                    <div rdxMenuSeparator [class]="m.separator"></div>
                    <div rdxMenuRadioGroup [(value)]="selectedItem">
                        @for (item of items(); track item) {
                            <label rdxMenuRadioItem [class]="m.selectableItem" [value]="item">
                                <span rdxMenuRadioItemIndicator [class]="m.itemIndicator">●</span>
                                {{ item }}
                            </label>
                        }
                    </div>
                </div>
            </div>
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
