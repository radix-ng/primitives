import { Component } from '@angular/core';

import {
    RdxSelectComponent,
    RdxSelectContentDirective,
    RdxSelectGroupDirective,
    RdxSelectIconDirective,
    RdxSelectItemDirective,
    RdxSelectItemIndicatorDirective,
    RdxSelectLabelDirective,
    RdxSelectSeparatorDirective,
    RdxSelectTriggerDirective,
    RdxSelectValueDirective
} from '@radix-ng/primitives/select';
import { CheckIcon, ChevronDown, LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'radix-select-demo',
    standalone: true,
    imports: [
        RdxSelectComponent,
        RdxSelectSeparatorDirective,
        RdxSelectLabelDirective,
        RdxSelectItemIndicatorDirective,
        RdxSelectItemDirective,
        RdxSelectGroupDirective,
        RdxSelectContentDirective,
        RdxSelectTriggerDirective,
        RdxSelectValueDirective,
        RdxSelectIconDirective,
        LucideAngularModule
    ],
    template: `
        <span rdxSelect>
            <button class="SelectTrigger" rdxSelectTrigger>
                <span rdxSelectValue placeholder="Select a fruit…"></span>
                <lucide-icon class="SelectIcon" [img]="LucideChevronDownIcon" size="16" rdxSelectIcon />
            </button>
            <div class="SelectContent SelectViewport" rdxSelectContent>
                @for (group of foodGroups; track group; let last = $last) {
                    <div class="SelectGroup" rdxSelectGroup>
                        <div class="SelectLabel" rdxSelectLabel>{{ group.label }}</div>
                        @for (food of group.foods; track food) {
                            <div class="SelectItem" [value]="food.value" [disabled]="food.disabled" rdxSelectItem>
                                <lucide-icon
                                    class="SelectItemIndicator"
                                    [img]="LucideCheckIcon"
                                    rdxSelectItemIndicator
                                    size="16"
                                />
                                {{ food.label }}
                            </div>
                        }
                    </div>
                    @if (!last) {
                        <div class="SelectSeparator" rdxSelectSeparator></div>
                    }
                }
            </div>
        </span>
    `,
    styleUrl: 'select-demo.css'
})
export class SelectDemoComponent {
    readonly LucideChevronDownIcon = ChevronDown;
    readonly LucideCheckIcon = CheckIcon;

    readonly foodGroups: FoodArray = [
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
    item: any;
}

type FoodItem = {
    value: string;
    label: string;
    disabled?: boolean;
};

type Category = {
    label?: string;
    foods: FoodItem[];
};

type FoodArray = Category[];

export default SelectDemoComponent;
