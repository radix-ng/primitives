import { cn, demoButton, demoMenu } from '../../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';

@Component({
    selector: 'menu-with-labels-items-story',
    imports: [RdxMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container #root="rdxMenuRoot" rdxMenuRoot>
            <button rdxMenuTrigger [class]="cn(b.base, b.outline, b.size.md)">Foods</button>

            <div *rdxMenuPortal sideOffset="4" rdxMenuPositioner [class]="m.positioner">
                <div rdxMenuPopup [class]="m.popup">
                    @for (group of foodGroups; track $index) {
                        <div rdxMenuGroup>
                            @if (group.label) {
                                <span rdxMenuGroupLabel [class]="m.groupLabel">{{ group.label }}</span>
                            }
                            @for (food of group.foods; track food.value) {
                                <button
                                    rdxMenuItem
                                    [class]="m.item"
                                    [disabled]="food.disabled ?? false"
                                    (onSelect)="handleSelect(food.value)"
                                >
                                    {{ food.label }}
                                </button>
                            }
                        </div>
                        @if ($index < foodGroups.length - 1) {
                            <div rdxMenuSeparator [class]="m.separator"></div>
                        }
                    }
                </div>
            </div>
        </ng-container>
    `
})
export class MenuWithLabelsItemsStory {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly m = demoMenu;

    handleSelect(food: string): void {
        console.log(food);
    }

    readonly foodGroups: Array<{
        label?: string;
        foods: Array<{ value: string; label: string; disabled?: boolean }>;
    }> = [
        {
            label: 'Fruits',
            foods: [
                { value: 'apple', label: 'Apple' },
                { value: 'banana', label: 'Banana' },
                { value: 'blueberry', label: 'Blueberry' },
                { value: 'grapes', label: 'Grapes' }
            ]
        },
        {
            label: 'Vegetables',
            foods: [
                { value: 'aubergine', label: 'Aubergine' },
                { value: 'broccoli', label: 'Broccoli' },
                { value: 'carrot', label: 'Carrot', disabled: true },
                { value: 'courgette', label: 'Courgette' }
            ]
        },
        {
            label: 'Meat',
            foods: [
                { value: 'beef', label: 'Beef' },
                { value: 'chicken', label: 'Chicken' },
                { value: 'lamb', label: 'Lamb' }
            ]
        }
    ];
}
