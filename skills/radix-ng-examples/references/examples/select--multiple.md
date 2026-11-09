# Select — Multiple

> One example from the [Select](../components/select.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

With `multiple`, picks accumulate in the value array, the trigger joins their labels, and every chosen
item keeps its indicator. Shows `RdxSelectIcon` and `RdxSelectSeparator`.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { demoSelect } from '../../storybook/styles';
import { RdxSelectGroup } from '../src/select-group';
import { RdxSelectGroupLabel } from '../src/select-group-label';
import { RdxSelectIcon } from '../src/select-icon';
import { RdxSelectItem } from '../src/select-item';
import { RdxSelectItemIndicator } from '../src/select-item-indicator';
import { RdxSelectItemText } from '../src/select-item-text';
import { RdxSelectList } from '../src/select-list';
import { RdxSelectPopup } from '../src/select-popup';
import { RdxSelectPortal } from '../src/select-portal';
import { RdxSelectPositioner } from '../src/select-positioner';
import { RdxSelectRoot } from '../src/select-root';
import { RdxSelectSeparator } from '../src/select-separator';
import { RdxSelectTrigger } from '../src/select-trigger';
import { RdxSelectValue } from '../src/select-value';

/**
 * Multiple selection: picks accumulate in the value array, `RdxSelectValue` joins their labels, and
 * each selected item keeps its `RdxSelectItemIndicator` visible. Uses `RdxSelectIcon` for the chevron
 * and `RdxSelectSeparator` between groups.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'select-multiple',
    imports: [
        RdxSelectRoot,
        RdxSelectPortal,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectIcon,
        RdxSelectPopup,
        RdxSelectList,
        LucideChevronDown,
        LucideCheck,
        RdxSelectItem,
        RdxSelectGroupLabel,
        RdxSelectGroup,
        RdxSelectSeparator,
        RdxSelectPositioner,
        RdxSelectItemText,
        RdxSelectItemIndicator
    ],
    template: `
        <div [(value)]="value" multiple rdxSelectRoot>
            <button class="min-w-52" [class]="s.trigger" aria-label="Pick fruits" rdxSelectTrigger>
                <span #selectedValue="rdxSelectedValue" rdxSelectValue placeholder="Pick fruits…">
                    {{ selectedValue.slotText() }}
                </span>
                <svg [class]="s.icon" lucideChevronDown size="16" aria-hidden="true" rdxSelectIcon></svg>
            </button>

            <div *rdxSelectPortal [class]="s.positioner" [sideOffset]="5" rdxSelectPositioner>
                <div [class]="s.popup" rdxSelectPopup>
                    <div [class]="s.list" rdxSelectList>
                        <div [class]="s.groupLabel" rdxSelectGroupLabel>Fruits</div>
                        <div rdxSelectGroup>
                            @for (fruit of fruits; track fruit) {
                                <div [class]="s.item" [value]="fruit" rdxSelectItem>
                                    <span [class]="s.itemIndicator" rdxSelectItemIndicator>
                                        <svg [class]="s.icon" lucideCheck size="16" aria-hidden="true"></svg>
                                    </span>
                                    <span rdxSelectItemText>{{ fruit }}</span>
                                </div>
                            }
                        </div>
                        <div [class]="s.separator" rdxSelectSeparator></div>
                        <div [class]="s.groupLabel" rdxSelectGroupLabel>Berries</div>
                        <div rdxSelectGroup>
                            @for (berry of berries; track berry) {
                                <div [class]="s.item" [value]="berry" rdxSelectItem>
                                    <span [class]="s.itemIndicator" rdxSelectItemIndicator>
                                        <svg [class]="s.icon" lucideCheck size="16" aria-hidden="true"></svg>
                                    </span>
                                    <span rdxSelectItemText>{{ berry }}</span>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class SelectMultiple {
    protected readonly s = demoSelect;

    readonly value = signal<string[]>(['Apple']);
    readonly fruits = ['Apple', 'Banana', 'Grapes', 'Pineapple'];
    readonly berries = ['Blueberry', 'Raspberry', 'Strawberry'];
}
```
