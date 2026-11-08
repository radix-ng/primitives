# Select — Default

> One example from the [Select](../components/select.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

A grouped list (Fruits / Vegetables) with Popper positioning. Click the trigger to open the popup.

```typescript
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { Align } from '@radix-ng/primitives/popper';
import { demoSelect } from '../../storybook/styles';
import { RdxSelectGroup } from '../src/select-group';
import { RdxSelectGroupLabel } from '../src/select-group-label';
import { RdxSelectItem } from '../src/select-item';
import { RdxSelectItemIndicator } from '../src/select-item-indicator';
import { RdxSelectItemText } from '../src/select-item-text';
import { RdxSelectList } from '../src/select-list';
import { RdxSelectPopup } from '../src/select-popup';
import { RdxSelectPortal } from '../src/select-portal';
import { RdxSelectPositioner } from '../src/select-positioner';
import { RdxSelectRoot } from '../src/select-root';
import { RdxSelectTrigger } from '../src/select-trigger';
import { RdxSelectValue } from '../src/select-value';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'select-default',
    imports: [
        RdxSelectRoot,
        RdxSelectPortal,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectPopup,
        RdxSelectList,
        LucideChevronDown,
        LucideCheck,
        RdxSelectItem,
        RdxSelectGroupLabel,
        RdxSelectGroup,
        RdxSelectPositioner,
        RdxSelectItemText,
        RdxSelectItemIndicator
    ],
    template: `
        <ng-container rdxSelectRoot>
            <button class="min-w-40" [class]="s.trigger" aria-label="Customise options" rdxSelectTrigger>
                <span #selectedValue="rdxSelectedValue" rdxSelectValue placeholder="Select a fruit...">
                    {{ selectedValue.slotText() }}
                </span>
                <svg [class]="s.icon" lucideChevronDown size="16" aria-hidden="true" />
            </button>

            <div
                *rdxSelectPortal
                [class]="s.positioner"
                [sideOffset]="sideOffset()"
                [align]="align()"
                rdxSelectPositioner
            >
                <div [class]="s.popup" rdxSelectPopup>
                    <div [class]="s.list" rdxSelectList>
                        <div [class]="s.groupLabel" rdxSelectGroupLabel>Fruits</div>
                        <div rdxSelectGroup>
                            @for (option of options; track option) {
                                <div [class]="s.item" [value]="option" rdxSelectItem>
                                    <span [class]="s.itemIndicator" rdxSelectItemIndicator>
                                        <svg [class]="s.icon" lucideCheck size="16" aria-hidden="true" />
                                    </span>
                                    <span rdxSelectItemText>{{ option }}</span>
                                </div>
                            }
                        </div>
                        <div [class]="s.separator"></div>
                        <div [class]="s.groupLabel" rdxSelectGroupLabel>Vegetables</div>
                        <div rdxSelectGroup>
                            @for (vegetable of vegetables; track vegetable) {
                                <div [class]="s.item" [value]="vegetable" rdxSelectItem>
                                    <span [class]="s.itemIndicator" rdxSelectItemIndicator>
                                        <svg [class]="s.icon" lucideCheck size="16" aria-hidden="true" />
                                    </span>
                                    <span rdxSelectItemText>{{ vegetable }}</span>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </ng-container>
    `
})
export class SelectDefault {
    protected readonly s = demoSelect;

    readonly sideOffset = input<number>(5);
    readonly align = input<Align>('start');

    readonly options = ['Apple', 'Banana', 'Blueberry', 'Grapes', 'Pineapple'];
    readonly vegetables = ['Aubergine', 'Broccoli', 'Carrot', 'Courgette', 'Leek'];
}
```
