# Menu — With labels

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Group items visually and semantically with `rdxMenuGroup` and label them with `rdxMenuGroupLabel`.
The label automatically supplies the group's `aria-labelledby` relationship.
Disabled items remain in keyboard navigation, expose `data-disabled` / `aria-disabled`, and cannot be activated.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';

@Component({
    selector: 'menu-with-labels-items-story',
    imports: [RdxMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container #root="rdxMenuRoot" rdxMenuRoot>
            <button class="demo-button demo-button-outline h-9 px-4" rdxMenuTrigger>Foods</button>

            <div class="z-50 data-[closed]:pointer-events-none" *rdxMenuPortal sideOffset="4" rdxMenuPositioner>
                <div
                    class="demo-menu-popup min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                    rdxMenuPopup
                >
                    @for (group of foodGroups; track $index) {
                        <div rdxMenuGroup>
                            @if (group.label) {
                                <span class="demo-menu-group-label px-2 py-1.5" rdxMenuGroupLabel>
                                    {{ group.label }}
                                </span>
                            }
                            @for (food of group.foods; track food.value) {
                                <button
                                    class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50"
                                    [disabled]="food.disabled ?? false"
                                    (onSelect)="handleSelect(food.value)"
                                    rdxMenuItem
                                >
                                    {{ food.label }}
                                </button>
                            }
                        </div>
                        @if ($index < foodGroups.length - 1) {
                            <div class="bg-border -mx-1 my-1 h-px" rdxMenuSeparator></div>
                        }
                    }
                </div>
            </div>
        </ng-container>
    `
})
export class MenuWithLabelsItemsStory {
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
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
