import { Component } from '@angular/core';

import {
    RdxSelectContent,
    RdxSelectGroup,
    RdxSelectItem,
    RdxSelectItemIndicator,
    RdxSelectItemText,
    RdxSelectLabel,
    RdxSelectPopperPositionContent,
    RdxSelectPopperPositionWrapper,
    RdxSelectPortal,
    RdxSelectPortalPresence,
    RdxSelectRoot,
    RdxSelectTrigger,
    RdxSelectValue,
    RdxSelectViewport
} from '@radix-ng/primitives/select';
import { Check, ChevronDown, LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'radix-select-demo',
    standalone: true,
    imports: [
        RdxSelectRoot,
        RdxSelectPortal,
        RdxSelectPortalPresence,
        RdxSelectContent,
        RdxSelectPopperPositionWrapper,
        RdxSelectPopperPositionContent,
        RdxSelectViewport,
        RdxSelectLabel,
        RdxSelectItemIndicator,
        RdxSelectItem,
        RdxSelectItemText,
        RdxSelectGroup,
        RdxSelectTrigger,
        RdxSelectValue,
        LucideAngularModule
    ],
    template: `
        <ng-container rdxSelectRoot>
            <button class="SelectTrigger" rdxSelectTrigger>
                <span #selectedValue="rdxSelectedValue" rdxSelectValue placeholder="Select a fruit…">
                    {{ selectedValue.slotText() }}
                </span>
                <lucide-icon class="SelectIcon" [img]="LucideChevronDownIcon" size="16" />
            </button>

            <div rdxSelectPortal>
                <ng-template rdxSelectPortalPresence>
                    <div rdxSelectContent>
                        <div class="SelectContent" [sideOffset]="5" align="start" rdxSelectPopperPositionWrapper>
                            <div rdxSelectPopperPositionContent>
                                <div class="SelectViewport" rdxSelectViewport>
                                    @for (group of foodGroups; track group; let last = $last) {
                                        <div class="SelectGroup" rdxSelectGroup>
                                            @if (group.label) {
                                                <div class="SelectLabel" rdxSelectLabel>{{ group.label }}</div>
                                            }
                                            @for (food of group.foods; track food) {
                                                <div
                                                    class="SelectItem"
                                                    [value]="food.value"
                                                    [disabled]="food.disabled"
                                                    rdxSelectItem
                                                >
                                                    <lucide-icon
                                                        class="SelectItemIndicator"
                                                        [img]="LucideCheckIcon"
                                                        rdxSelectItemIndicator
                                                        size="16"
                                                    />
                                                    <span rdxSelectItemText>{{ food.label }}</span>
                                                </div>
                                            }
                                        </div>
                                        @if (!last) {
                                            <div class="SelectSeparator"></div>
                                        }
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </div>
        </ng-container>
    `,
    styleUrl: 'select-demo.css'
})
export class SelectDemoComponent {
    readonly LucideChevronDownIcon = ChevronDown;
    readonly LucideCheckIcon = Check;

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
