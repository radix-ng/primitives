# Select — Multiple

> One example from the [Select](../components/select.md) docs — imports, anatomy, and the data-attribute styling contract live there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

With `multiple`, picks accumulate in the value array, the trigger joins their labels, and every chosen
item keeps its indicator. Shows `RdxSelectIcon` and `RdxSelectSeparator`.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
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
            <button
                class="border-border bg-background text-foreground data-[placeholder]:text-muted-foreground hover:bg-muted focus-visible:ring-ring focus-visible:ring-offset-background inline-flex h-9 min-w-52 items-center justify-between gap-2 rounded-md border px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                aria-label="Pick fruits"
                rdxSelectTrigger
            >
                <span #selectedValue="rdxSelectedValue" rdxSelectValue placeholder="Pick fruits…">
                    {{ selectedValue.slotText() }}
                </span>
                <svg lucideChevronDown size="16" rdxSelectIcon></svg>
            </button>

            <div class="z-[100]" *rdxSelectPortal [sideOffset]="5" rdxSelectPositioner>
                <div
                    class="border-border bg-popover text-popover-foreground min-w-52 rounded-lg border p-1 shadow-md"
                    rdxSelectPopup
                >
                    <div rdxSelectList>
                        <div class="text-muted-foreground px-6 text-xs leading-6" rdxSelectGroupLabel>Fruits</div>
                        <div rdxSelectGroup>
                            @for (fruit of fruits; track fruit) {
                                <div [class]="itemClass" [value]="fruit" rdxSelectItem>
                                    <span [class]="indicatorClass" rdxSelectItemIndicator>
                                        <svg lucideCheck size="16"></svg>
                                    </span>
                                    <span rdxSelectItemText>{{ fruit }}</span>
                                </div>
                            }
                        </div>
                        <div class="bg-border mx-1 my-1 h-px" rdxSelectSeparator></div>
                        <div class="text-muted-foreground px-6 text-xs leading-6" rdxSelectGroupLabel>Berries</div>
                        <div rdxSelectGroup>
                            @for (berry of berries; track berry) {
                                <div [class]="itemClass" [value]="berry" rdxSelectItem>
                                    <span [class]="indicatorClass" rdxSelectItemIndicator>
                                        <svg lucideCheck size="16"></svg>
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
    protected readonly itemClass =
        'text-popover-foreground data-[disabled]:text-muted-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground relative flex h-7 cursor-default items-center rounded-sm pr-8 pl-6 text-sm leading-none outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50';
    protected readonly indicatorClass = 'absolute left-0 inline-flex w-6 items-center justify-center';

    readonly value = signal<string[]>(['Apple']);
    readonly fruits = ['Apple', 'Banana', 'Grapes', 'Pineapple'];
    readonly berries = ['Blueberry', 'Raspberry', 'Strawberry'];
}
```
