import { Component } from '@angular/core';
import { MenuModule } from '@radix-ng/primitives/menu';

@Component({
    selector: 'menu-with-labels-items-story',
    imports: [
        MenuModule
    ],
    styleUrl: 'styles.css',
    template: `
        <div class="MenuRoot" MenuRoot>
            <div class="MenuTrigger" [menuTriggerFor]="menuGroup" align="center" sideOffset="8" MenuItem MenuTrigger>
                File
            </div>
        </div>

        <ng-template #menuGroup>
            <div class="MenuContent" MenuContent>
                <div MenuGroup>
                    @for (foodGroup of foodGroups; track $index) {
                        <div class="MenuLabel" MenuLabel>{{ foodGroup.label }}</div>

                        @for (food of foodGroup.foods; track $index) {
                            <div class="MenuItem" (onSelect)="handleSelect(food.value)" MenuItem>
                                {{ food.label }}
                            </div>
                        }
                        @if ($index < foodGroups.length - 1) {
                            <div class="MenuSeparator" MenuSeparator></div>
                        }
                    }
                </div>
            </div>
        </ng-template>
    `
})
export class MenuWithLabelsItemsStory {
    handleSelect(food: string) {
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
                { value: 'grapes', label: 'Grapes' },
                { value: 'pineapple', label: 'Pineapple' }
            ]
        },
        {
            label: 'Vegetables',
            foods: [
                { value: 'aubergine', label: 'Aubergine' },
                { value: 'broccoli', label: 'Broccoli' },
                { value: 'carrot', label: 'Carrot', disabled: true },
                { value: 'courgette', label: 'Courgette' },
                { value: 'leek', label: 'Leek' }
            ]
        },
        {
            label: 'Meat',
            foods: [
                { value: 'beef', label: 'Beef' },
                { value: 'beef-with-sauce', label: 'Beef with sauce' },
                { value: 'chicken', label: 'Chicken' },
                { value: 'lamb', label: 'Lamb' },
                { value: 'pork', label: 'Pork' }
            ]
        },
        {
            foods: [
                { value: 'candies', label: 'Candies' },
                { value: 'chocolates', label: 'Chocolates' }
            ]
        }
    ];
}
