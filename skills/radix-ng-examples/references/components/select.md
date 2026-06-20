# Select

#### A control that presents a list of options for the user to pick from, triggered by a button.

Select is headless — it ships no styles and exposes state via `data-*` attributes so you can style it
with any approach. Two positioning modes are available: **Popper** (Floating UI, anchored below the
trigger) and **Item-aligned** (the popup overlaps the trigger, aligned to the selected item, matching
native `<select>` behavior).

```typescript
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { Align } from '@radix-ng/primitives/popper';
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
            <button
                class="border-border bg-background text-foreground data-[placeholder]:text-muted-foreground hover:bg-muted focus-visible:ring-ring focus-visible:ring-offset-background inline-flex h-9 min-w-40 items-center justify-between gap-2 rounded-md border px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                aria-label="Customise options"
                rdxSelectTrigger
            >
                <span #selectedValue="rdxSelectedValue" rdxSelectValue placeholder="Select a fruit...">
                    {{ selectedValue.slotText() }}
                </span>
                <svg lucideChevronDown size="16" />
            </button>

            <div class="z-[100]" *rdxSelectPortal [sideOffset]="sideOffset()" [align]="align()" rdxSelectPositioner>
                <div
                    class="border-border bg-popover text-popover-foreground min-w-40 rounded-lg border shadow-md will-change-[opacity,transform]"
                    rdxSelectPopup
                >
                    <div class="p-1" rdxSelectList>
                        <div class="text-muted-foreground px-6 text-xs leading-6" rdxSelectGroupLabel>Fruits</div>
                        <div rdxSelectGroup>
                            @for (option of options; track option) {
                                <div
                                    class="text-popover-foreground data-[disabled]:text-muted-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground relative flex h-7 cursor-default items-center rounded-sm pr-8 pl-6 text-sm leading-none outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                    [value]="option"
                                    rdxSelectItem
                                >
                                    <span
                                        class="absolute left-0 inline-flex w-6 items-center justify-center"
                                        rdxSelectItemIndicator
                                    >
                                        <svg lucideCheck size="16" />
                                    </span>
                                    <span rdxSelectItemText>{{ option }}</span>
                                </div>
                            }
                        </div>
                        <div class="bg-border mx-1 my-1 h-px"></div>
                        <div class="text-muted-foreground px-6 text-xs leading-6" rdxSelectGroupLabel>Vegetables</div>
                        <div rdxSelectGroup>
                            @for (vegetable of vegetables; track vegetable) {
                                <div
                                    class="text-popover-foreground data-[disabled]:text-muted-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground relative flex h-7 cursor-default items-center rounded-sm pr-8 pl-6 text-sm leading-none outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                    [value]="vegetable"
                                    rdxSelectItem
                                >
                                    <span
                                        class="absolute left-0 inline-flex w-6 items-center justify-center"
                                        rdxSelectItemIndicator
                                    >
                                        <svg lucideCheck size="16" />
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
    readonly sideOffset = input<number>(5);
    readonly align = input<Align>('start');

    readonly options = ['Apple', 'Banana', 'Blueberry', 'Grapes', 'Pineapple'];
    readonly vegetables = ['Aubergine', 'Broccoli', 'Carrot', 'Courgette', 'Leek'];
}
```

## Features

- ✅ Controlled and uncontrolled value via `[(value)]`.
- ✅ Single and multiple selection with the `multiple` input.
- ✅ Cancelable `onOpenChange` and `onValueChange` outputs with reason-aware `eventDetails`.
- ✅ Two positioning modes: Popper (Floating UI) and Item-aligned (native-like).
- ✅ Scroll buttons appear automatically when the list overflows the viewport.
- ✅ Typeahead: type a character to jump to matching items.
- ✅ Custom comparison (`isItemEqualToValue`) and labels (`itemToStringLabel`) for object values.
- ✅ Highlight-model navigation (`aria-activedescendant`) — focus stays on the listbox, not the items.
- ✅ Full keyboard navigation: ArrowDown / ArrowUp, Home, End, Enter / Space, Escape.
- ✅ Public interaction state via `openMethod`, `openInteractionType`, and `closeInteractionType`.
- ✅ `modal` (default) locks page scroll and makes outside content inert, with an optional `Backdrop`.
- ✅ Field integration on the trigger (invalid / disabled / required / focused state + `aria-describedby`).
- ✅ WAI-ARIA `combobox` / `listbox` semantics with `aria-selected` and `aria-disabled`.
- ✅ Headless — state via `data-selected`, `data-highlighted`, `data-popup-open`, `data-placeholder`, `data-disabled`.

## Import

```typescript
import {
  RdxSelectPopup,
  RdxSelectGroup,
  RdxSelectItem,
  RdxSelectItemIndicator,
  RdxSelectItemText,
  RdxSelectGroupLabel,
  RdxSelectPositioner,
  RdxSelectPortal,
  RdxSelectRoot,
  RdxSelectScrollDownButton,
  RdxSelectScrollUpButton,
  RdxSelectTrigger,
  RdxSelectValue,
  RdxSelectList
} from '@radix-ng/primitives/select';
```

## Anatomy

### Popper positioning (Floating UI)

The popup is anchored to the trigger and positioned with Floating UI — the same approach used by
Dropdown Menu and Popover. Use `rdxSelectPositioner` to configure side, align, and
offsets.

```html
<ng-container rdxSelectRoot>
  <button rdxSelectTrigger>
    <span #v="rdxSelectedValue" rdxSelectValue placeholder="Pick one…">{{ v.slotText() }}</span>
    <!-- chevron icon -->
  </button>

  <div *rdxSelectPortal sideOffset="4" align="start" rdxSelectPositioner>
    <div rdxSelectPopup>
      <!-- optional scroll-up button -->
      <div rdxSelectScrollUpButton><!-- up icon --></div>

      <div rdxSelectList>
        <div rdxSelectGroupLabel>Group label</div>
        <div rdxSelectGroup>
          <div value="apple" rdxSelectItem>
            <span rdxSelectItemIndicator><!-- check icon --></span>
            <span rdxSelectItemText>Apple</span>
          </div>
        </div>
      </div>

      <!-- optional scroll-down button -->
      <div rdxSelectScrollDownButton><!-- down icon --></div>
    </div>
  </div>
</ng-container>
```

### Item-aligned positioning (native-like)

The popup overlaps the trigger, with the selected item aligned to the trigger's position — matching
the behavior of a native `<select>`. Use `rdxSelectItemAlignedPosition` and
`rdxSelectItemAlignedPositionContent` instead of the Popper wrappers.

```html
<ng-container rdxSelectRoot>
  <button rdxSelectTrigger>
    <span #v="rdxSelectedValue" rdxSelectValue>{{ v.slotText() }}</span>
  </button>

  <div *rdxSelectPortal rdxSelectItemAlignedPosition>
    <div rdxSelectPopup>
      <div rdxSelectItemAlignedPositionContent>
        <div rdxSelectList>
          <div value="apple" rdxSelectItem>
            <span rdxSelectItemIndicator><!-- check icon --></span>
            <span rdxSelectItemText>Apple</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</ng-container>
```

## Examples

### Default

A grouped list (Fruits / Vegetables) with Popper positioning. Click the trigger to open the popup.

```typescript
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { Align } from '@radix-ng/primitives/popper';
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
            <button
                class="border-border bg-background text-foreground data-[placeholder]:text-muted-foreground hover:bg-muted focus-visible:ring-ring focus-visible:ring-offset-background inline-flex h-9 min-w-40 items-center justify-between gap-2 rounded-md border px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                aria-label="Customise options"
                rdxSelectTrigger
            >
                <span #selectedValue="rdxSelectedValue" rdxSelectValue placeholder="Select a fruit...">
                    {{ selectedValue.slotText() }}
                </span>
                <svg lucideChevronDown size="16" />
            </button>

            <div class="z-[100]" *rdxSelectPortal [sideOffset]="sideOffset()" [align]="align()" rdxSelectPositioner>
                <div
                    class="border-border bg-popover text-popover-foreground min-w-40 rounded-lg border shadow-md will-change-[opacity,transform]"
                    rdxSelectPopup
                >
                    <div class="p-1" rdxSelectList>
                        <div class="text-muted-foreground px-6 text-xs leading-6" rdxSelectGroupLabel>Fruits</div>
                        <div rdxSelectGroup>
                            @for (option of options; track option) {
                                <div
                                    class="text-popover-foreground data-[disabled]:text-muted-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground relative flex h-7 cursor-default items-center rounded-sm pr-8 pl-6 text-sm leading-none outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                    [value]="option"
                                    rdxSelectItem
                                >
                                    <span
                                        class="absolute left-0 inline-flex w-6 items-center justify-center"
                                        rdxSelectItemIndicator
                                    >
                                        <svg lucideCheck size="16" />
                                    </span>
                                    <span rdxSelectItemText>{{ option }}</span>
                                </div>
                            }
                        </div>
                        <div class="bg-border mx-1 my-1 h-px"></div>
                        <div class="text-muted-foreground px-6 text-xs leading-6" rdxSelectGroupLabel>Vegetables</div>
                        <div rdxSelectGroup>
                            @for (vegetable of vegetables; track vegetable) {
                                <div
                                    class="text-popover-foreground data-[disabled]:text-muted-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground relative flex h-7 cursor-default items-center rounded-sm pr-8 pl-6 text-sm leading-none outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                    [value]="vegetable"
                                    rdxSelectItem
                                >
                                    <span
                                        class="absolute left-0 inline-flex w-6 items-center justify-center"
                                        rdxSelectItemIndicator
                                    >
                                        <svg lucideCheck size="16" />
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
    readonly sideOffset = input<number>(5);
    readonly align = input<Align>('start');

    readonly options = ['Apple', 'Banana', 'Blueberry', 'Grapes', 'Pineapple'];
    readonly vegetables = ['Aubergine', 'Broccoli', 'Carrot', 'Courgette', 'Leek'];
}
```

### Multiple

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

### Change details and interaction state

`onOpenChange` and `onValueChange` expose `eventDetails.reason`, the originating DOM event, and a
`cancel()` hook. `RdxSelectRoot` also exposes `openMethod`, `openInteractionType`, and
`closeInteractionType`, so app logic can distinguish keyboard, mouse, and touch flows explicitly.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import {
    RdxSelectItem,
    RdxSelectItemIndicator,
    RdxSelectItemText,
    RdxSelectList,
    RdxSelectOpenChangeEvent,
    RdxSelectPopup,
    RdxSelectPortal,
    RdxSelectPositioner,
    RdxSelectRoot,
    RdxSelectTrigger,
    RdxSelectValue,
    RdxSelectValueChangeEvent
} from '../index';

interface SelectEventLogEntry {
    label: string;
    reason: string;
    payload: string;
    canceled: boolean;
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'select-events',
    imports: [
        RdxSelectRoot,
        RdxSelectPortal,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectPopup,
        RdxSelectList,
        RdxSelectPositioner,
        RdxSelectItem,
        RdxSelectItemText,
        RdxSelectItemIndicator,
        LucideChevronDown,
        LucideCheck
    ],
    template: `
        <div class="flex w-full max-w-[720px] flex-col gap-3">
            <div class="grid gap-3 sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
                <div class="flex flex-col gap-2">
                    <ng-container
                        #root="rdxSelectRoot"
                        [(open)]="open"
                        [(value)]="value"
                        (onOpenChange)="handleOpenChange($event)"
                        (onValueChange)="handleValueChange($event)"
                        rdxSelectRoot
                    >
                        <button
                            class="border-border bg-background text-foreground data-[placeholder]:text-muted-foreground hover:bg-muted focus-visible:ring-ring focus-visible:ring-offset-background inline-flex h-9 w-full items-center justify-between gap-2 rounded-md border px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                            aria-label="Select a framework"
                            rdxSelectTrigger
                        >
                            <span #selectedValue="rdxSelectedValue" rdxSelectValue placeholder="Select a framework">
                                {{ selectedValue.slotText() }}
                            </span>
                            <svg lucideChevronDown size="16" />
                        </button>

                        <div class="z-[100]" *rdxSelectPortal sideOffset="6" rdxSelectPositioner>
                            <div
                                class="border-border bg-popover text-popover-foreground min-w-48 rounded-lg border p-1 shadow-md"
                                rdxSelectPopup
                            >
                                <div rdxSelectList>
                                    @for (option of options; track option.value) {
                                        <div
                                            class="data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground relative flex h-8 cursor-default items-center rounded-sm pr-8 pl-7 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                            [value]="option.value"
                                            rdxSelectItem
                                        >
                                            <span
                                                class="absolute left-2 inline-flex size-4 items-center justify-center"
                                                rdxSelectItemIndicator
                                            >
                                                <svg lucideCheck size="14" />
                                            </span>
                                            <span rdxSelectItemText>{{ option.label }}</span>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>

                        <div class="grid gap-2 pt-1">
                            <button
                                class="border-border bg-background text-foreground hover:bg-muted inline-flex h-7 items-center justify-between rounded-md border px-3 text-xs"
                                (click)="cancelNextOpen.update((value) => !value)"
                                type="button"
                            >
                                <span>Cancel next open</span>
                                <span class="text-muted-foreground">{{ cancelNextOpen() ? 'armed' : 'off' }}</span>
                            </button>

                            <button
                                class="border-border bg-background text-foreground hover:bg-muted inline-flex h-7 items-center justify-between rounded-md border px-3 text-xs"
                                (click)="cancelNextValue.update((value) => !value)"
                                type="button"
                            >
                                <span>Cancel next value</span>
                                <span class="text-muted-foreground">{{ cancelNextValue() ? 'armed' : 'off' }}</span>
                            </button>

                            <div
                                class="border-border bg-muted/40 grid grid-cols-2 gap-x-3 gap-y-1.5 rounded-md border p-2.5 text-[11px]"
                            >
                                <div class="text-muted-foreground">openMethod</div>
                                <div class="font-medium">{{ root.openMethod() ?? 'null' }}</div>
                                <div class="text-muted-foreground">openInteraction</div>
                                <div class="font-medium">{{ root.openInteractionType() ?? 'null' }}</div>
                                <div class="text-muted-foreground">closeInteraction</div>
                                <div class="font-medium">{{ root.closeInteractionType() ?? 'null' }}</div>
                                <div class="text-muted-foreground">value</div>
                                <div class="truncate font-medium">{{ value() ?? 'unset' }}</div>
                            </div>
                        </div>
                    </ng-container>
                </div>

                <div class="border-border bg-muted/30 flex min-h-[280px] min-w-0 flex-col rounded-lg border">
                    <div class="border-border flex items-center justify-between border-b px-3 py-2">
                        <div>
                            <div class="text-sm font-medium">Change details</div>
                            <div class="text-muted-foreground text-xs">Reasons, payload, and cancel state.</div>
                        </div>
                        <button
                            class="text-muted-foreground hover:text-foreground inline-flex h-7 items-center rounded-md px-2 text-xs"
                            (click)="logs.set([])"
                            type="button"
                        >
                            Clear
                        </button>
                    </div>

                    <div class="flex min-h-0 flex-1 flex-col p-2.5">
                        <div class="flex max-h-[240px] flex-1 flex-col gap-2 overflow-y-auto pr-1">
                            @for (entry of logs(); track $index) {
                                <div
                                    class="border-border bg-background grid gap-1 rounded-md border p-2.5 text-[11px] leading-4"
                                >
                                    <div class="flex items-center justify-between gap-2">
                                        <span class="font-medium">{{ entry.label }}</span>
                                        <span class="text-muted-foreground truncate">{{ entry.reason }}</span>
                                    </div>
                                    <div class="text-foreground/80 break-words">{{ entry.payload }}</div>
                                    <div class="text-muted-foreground">
                                        canceled:
                                        <span class="font-medium">{{ entry.canceled ? 'yes' : 'no' }}</span>
                                    </div>
                                </div>
                            } @empty {
                                <div class="text-muted-foreground flex flex-1 items-center justify-center text-sm">
                                    Interact with the select to inspect change details.
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class SelectEvents {
    readonly open = signal(false);
    readonly value = signal<string | undefined>(undefined);
    readonly cancelNextOpen = signal(false);
    readonly cancelNextValue = signal(false);
    readonly logs = signal<SelectEventLogEntry[]>([]);

    readonly options = [
        { value: 'angular', label: 'Angular' },
        { value: 'react', label: 'React' },
        { value: 'vue', label: 'Vue' },
        { value: 'svelte', label: 'Svelte' }
    ];

    handleOpenChange(event: RdxSelectOpenChangeEvent): void {
        if (event.open && this.cancelNextOpen()) {
            event.eventDetails.cancel();
            this.cancelNextOpen.set(false);
        }

        this.record({
            label: `open -> ${event.open}`,
            reason: event.eventDetails.reason,
            payload: `event: ${event.eventDetails.event.type}`,
            canceled: event.eventDetails.isCanceled()
        });
    }

    handleValueChange(event: RdxSelectValueChangeEvent): void {
        if (this.cancelNextValue()) {
            event.eventDetails.cancel();
            this.cancelNextValue.set(false);
        }

        this.record({
            label: 'value change',
            reason: event.eventDetails.reason,
            payload: `value: ${Array.isArray(event.value) ? event.value.join(', ') : (event.value ?? 'unset')}`,
            canceled: event.eventDetails.isCanceled()
        });
    }

    private record(entry: SelectEventLogEntry): void {
        this.logs.update((items) => [entry, ...items].slice(0, 8));
    }
}
```

### Object values

Each item's `value` is an object. Set `[isItemEqualToValue]="'id'"` so items are matched by a stable
key (here `id`) instead of reference, and render rich, two-line content in both the trigger and the
items from the selected object.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideCheck, LucideChevronsUpDown } from '@lucide/angular';
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

interface ShippingMethod {
    id: string;
    name: string;
    duration: string;
    price: string;
}

/**
 * Object values: each item's `value` is a `ShippingMethod` object rather than a string. Items are
 * compared by their `id` (`[isItemEqualToValue]="'id'"`) so the pre-selected `[value]` matches the
 * right item, and both the trigger and the items render rich, two-line content from the object.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'select-object-values',
    imports: [
        RdxSelectRoot,
        RdxSelectPortal,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectPopup,
        RdxSelectList,
        RdxSelectPositioner,
        RdxSelectItem,
        RdxSelectItemText,
        RdxSelectItemIndicator,
        LucideChevronsUpDown,
        LucideCheck
    ],
    template: `
        <div class="flex flex-col items-start gap-1.5">
            <label class="text-foreground cursor-default text-sm font-medium" id="shipping-method-label">
                Shipping method
            </label>

            <ng-container #root="rdxSelectRoot" [value]="shippingMethods[0]" [isItemEqualToValue]="'id'" rdxSelectRoot>
                <button
                    class="border-border bg-background text-foreground hover:bg-muted focus-visible:ring-ring focus-visible:ring-offset-background inline-flex min-h-9 min-w-64 items-center justify-between gap-3 rounded-md border px-3 py-1.5 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2 data-[disabled]:opacity-50"
                    aria-labelledby="shipping-method-label"
                    rdxSelectTrigger
                >
                    <span #value="rdxSelectedValue" rdxSelectValue placeholder="Select a method...">
                        @if (asMethod(root.value()); as method) {
                            <span class="flex flex-col items-start gap-0.5">
                                <span class="text-sm leading-none">{{ method.name }}</span>
                                <span class="text-muted-foreground text-xs leading-none">
                                    {{ method.duration }} ({{ method.price }})
                                </span>
                            </span>
                        } @else {
                            {{ value.placeholder() }}
                        }
                    </span>
                    <svg class="text-muted-foreground shrink-0" lucideChevronsUpDown size="16" />
                </button>

                <div class="z-[100]" *rdxSelectPortal [sideOffset]="5" align="start" rdxSelectPositioner>
                    <div
                        class="border-border bg-popover text-popover-foreground min-w-[var(--radix-select-trigger-width)] rounded-lg border shadow-md will-change-[opacity,transform]"
                        rdxSelectPopup
                    >
                        <div class="p-1" rdxSelectList>
                            @for (method of shippingMethods; track method.id) {
                                <div
                                    class="text-popover-foreground data-[disabled]:text-muted-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground group relative grid cursor-default grid-cols-[1.25rem_1fr] items-start gap-2 rounded-sm py-1.5 pr-3 pl-2 outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                    [value]="method"
                                    rdxSelectItem
                                >
                                    <span
                                        class="col-start-1 mt-0.5 inline-flex items-center justify-center"
                                        rdxSelectItemIndicator
                                    >
                                        <svg lucideCheck size="16" />
                                    </span>
                                    <span class="col-start-2 flex flex-col gap-0.5" rdxSelectItemText>
                                        <span class="text-sm leading-none">{{ method.name }}</span>
                                        <span
                                            class="text-muted-foreground group-data-[highlighted]:text-primary-foreground/80 text-xs leading-none"
                                        >
                                            {{ method.duration }} ({{ method.price }})
                                        </span>
                                    </span>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </ng-container>
        </div>
    `
})
export class SelectObjectValues {
    readonly shippingMethods: ShippingMethod[] = [
        { id: 'standard', name: 'Standard', duration: 'Delivers in 4-6 business days', price: '$4.99' },
        { id: 'express', name: 'Express', duration: 'Delivers in 2-3 business days', price: '$9.99' },
        { id: 'overnight', name: 'Overnight', duration: 'Delivers next business day', price: '$19.99' }
    ];

    /** Narrows the root's `AcceptableValue` back to the demo's object type for template rendering. */
    asMethod(value: unknown): ShippingMethod | undefined {
        return value as ShippingMethod | undefined;
    }
}
```

### With scroll buttons

When the list is taller than the available viewport, `rdxSelectScrollUpButton` and
`rdxSelectScrollDownButton` appear automatically at the top and bottom of the popup.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideCheck, LucideChevronDown, LucideChevronUp } from '@lucide/angular';
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
import { RdxSelectScrollDownButton } from '../src/select-scroll-down-button';
import { RdxSelectScrollUpButton } from '../src/select-scroll-up-button';
import { RdxSelectTrigger } from '../src/select-trigger';
import { RdxSelectValue } from '../src/select-value';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'select-with-scroll',
    imports: [
        RdxSelectRoot,
        RdxSelectPortal,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectPopup,
        RdxSelectList,
        LucideChevronDown,
        LucideChevronUp,
        LucideCheck,
        RdxSelectItem,
        RdxSelectGroupLabel,
        RdxSelectGroup,
        RdxSelectPositioner,
        RdxSelectItemText,
        RdxSelectItemIndicator,
        RdxSelectScrollUpButton,
        RdxSelectScrollDownButton
    ],
    template: `
        <ng-container rdxSelectRoot>
            <button
                class="border-border bg-background text-foreground data-[placeholder]:text-muted-foreground hover:bg-muted focus-visible:ring-ring focus-visible:ring-offset-background inline-flex h-9 min-w-40 items-center justify-between gap-2 rounded-md border px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                aria-label="Customise options"
                rdxSelectTrigger
            >
                <span #selectedValue="rdxSelectedValue" rdxSelectValue placeholder="Select a fruit...">
                    {{ selectedValue.slotText() }}
                </span>
                <svg lucideChevronDown size="16" />
            </button>

            <div class="z-[100]" *rdxSelectPortal [sideOffset]="5" align="start" rdxSelectPositioner>
                <div
                    class="border-border bg-popover text-popover-foreground max-h-[300px] min-w-40 overflow-hidden rounded-lg border shadow-md will-change-[opacity,transform]"
                    rdxSelectPopup
                >
                    <div
                        class="text-muted-foreground hover:bg-muted bg-popover flex h-7 cursor-default items-center justify-center"
                        rdxSelectScrollUpButton
                    >
                        <svg lucideChevronUp size="16" />
                    </div>
                    <div class="p-1" rdxSelectList>
                        <div class="text-muted-foreground px-6 text-xs leading-6" rdxSelectGroupLabel>Fruits</div>
                        <div rdxSelectGroup>
                            @for (option of options; track option) {
                                <div
                                    class="text-popover-foreground data-[disabled]:text-muted-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground relative flex h-7 cursor-default items-center rounded-sm pr-8 pl-6 text-sm leading-none outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                    [value]="option"
                                    rdxSelectItem
                                >
                                    <span
                                        class="absolute left-0 inline-flex w-6 items-center justify-center"
                                        rdxSelectItemIndicator
                                    >
                                        <svg lucideCheck size="16" />
                                    </span>
                                    <span rdxSelectItemText>{{ option }}</span>
                                </div>
                            }
                        </div>
                        <div class="bg-border mx-1 my-1 h-px"></div>
                        <div class="text-muted-foreground px-6 text-xs leading-6" rdxSelectGroupLabel>Vegetables</div>
                        <div rdxSelectGroup>
                            @for (vegetable of vegetables; track vegetable) {
                                <div
                                    class="text-popover-foreground data-[disabled]:text-muted-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground relative flex h-7 cursor-default items-center rounded-sm pr-8 pl-6 text-sm leading-none outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                    [value]="vegetable"
                                    rdxSelectItem
                                >
                                    <span
                                        class="absolute left-0 inline-flex w-6 items-center justify-center"
                                        rdxSelectItemIndicator
                                    >
                                        <svg lucideCheck size="16" />
                                    </span>
                                    <span rdxSelectItemText>{{ vegetable }}</span>
                                </div>
                            }
                        </div>
                    </div>
                    <div
                        class="text-muted-foreground hover:bg-muted bg-popover flex h-7 cursor-default items-center justify-center"
                        rdxSelectScrollDownButton
                    >
                        <svg lucideChevronDown size="16" />
                    </div>
                </div>
            </div>
        </ng-container>
    `
})
export class SelectWithScroll {
    readonly options = ['Apple', 'Banana', 'Blueberry', 'Grapes', 'Pineapple'];
    readonly vegetables = [
        'Aubergine',
        'Broccoli',
        'Carrot',
        'Courgette',
        'Leek',
        'Aubergine 2',
        'Broccoli 2',
        'Carrot 2',
        'Courgette 2',
        'Leek 2'
    ];
}
```

### Item-aligned positioning

The popup opens aligned to the selected item, mirroring native `<select>` behavior. The initial
value is pre-selected so the alignment is immediately visible.

```typescript
import { booleanAttribute, ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { RdxSelectGroup } from '../src/select-group';
import { RdxSelectGroupLabel } from '../src/select-group-label';
import { RdxSelectItem } from '../src/select-item';
import { RdxSelectItemAlignedPosition } from '../src/select-item-aligned-position';
import { RdxSelectItemAlignedPositionContent } from '../src/select-item-aligned-position-content';
import { RdxSelectItemIndicator } from '../src/select-item-indicator';
import { RdxSelectItemText } from '../src/select-item-text';
import { RdxSelectList } from '../src/select-list';
import { RdxSelectPopup } from '../src/select-popup';
import { RdxSelectPortal } from '../src/select-portal';
import { RdxSelectRoot } from '../src/select-root';
import { RdxSelectTrigger } from '../src/select-trigger';
import { RdxSelectValue } from '../src/select-value';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'select-aligned-position',
    imports: [
        RdxSelectRoot,
        RdxSelectPortal,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectList,
        LucideChevronDown,
        LucideCheck,
        RdxSelectItem,
        RdxSelectGroupLabel,
        RdxSelectGroup,
        RdxSelectPopup,
        RdxSelectItemAlignedPosition,
        RdxSelectItemText,
        RdxSelectItemAlignedPositionContent,
        RdxSelectItemIndicator
    ],
    template: `
        <ng-container [value]="fruit()" [modal]="modal()" rdxSelectRoot>
            <button
                class="border-border bg-background text-foreground data-[placeholder]:text-muted-foreground hover:bg-muted focus-visible:ring-ring focus-visible:ring-offset-background inline-flex h-9 min-w-40 items-center justify-between gap-2 rounded-md border px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                aria-label="Customise options"
                rdxSelectTrigger
            >
                <span #selectedValue="rdxSelectedValue" rdxSelectValue placeholder="Select a fruit...">
                    {{ selectedValue.slotText() }}
                </span>
                <svg lucideChevronDown size="16" />
            </button>

            <div *rdxSelectPortal rdxSelectItemAlignedPosition>
                <div class="min-w-40" rdxSelectPopup>
                    <div
                        class="border-border bg-popover text-popover-foreground z-[100] min-w-40 rounded-lg border shadow-md will-change-[opacity,transform]"
                        rdxSelectItemAlignedPositionContent
                    >
                        <div class="p-1" rdxSelectList>
                            <div class="text-muted-foreground px-6 text-xs leading-6" rdxSelectGroupLabel>Fruits</div>
                            <div rdxSelectGroup>
                                @for (option of options; track option) {
                                    <div
                                        class="text-popover-foreground data-[disabled]:text-muted-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground relative flex h-7 cursor-default items-center rounded-sm pr-8 pl-6 text-sm leading-none outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                        [value]="option"
                                        rdxSelectItem
                                    >
                                        <span
                                            class="absolute left-0 inline-flex w-6 items-center justify-center"
                                            rdxSelectItemIndicator
                                        >
                                            <svg lucideCheck size="16" />
                                        </span>
                                        <span rdxSelectItemText>{{ option }}</span>
                                    </div>
                                }
                            </div>
                            <div class="bg-border mx-1 my-1 h-px"></div>
                            <div class="text-muted-foreground px-6 text-xs leading-6" rdxSelectGroupLabel>
                                Vegetables
                            </div>
                            <div rdxSelectGroup>
                                @for (vegetable of vegetables; track vegetable) {
                                    <div
                                        class="text-popover-foreground data-[disabled]:text-muted-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground relative flex h-7 cursor-default items-center rounded-sm pr-8 pl-6 text-sm leading-none outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                        [value]="vegetable"
                                        rdxSelectItem
                                    >
                                        <span
                                            class="absolute left-0 inline-flex w-6 items-center justify-center"
                                            rdxSelectItemIndicator
                                        >
                                            <svg lucideCheck size="16" />
                                        </span>
                                        <span rdxSelectItemText>{{ vegetable }}</span>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ng-container>
    `
})
export class SelectAlignedPosition {
    /** Whether the select is modal. Exposed so a story can demonstrate the non-modal item-aligned lock. */
    readonly modal = input(true, { transform: booleanAttribute });

    readonly fruit = signal('Apple');

    readonly options = ['Apple', 'Banana', 'Blueberry', 'Grapes', 'Pineapple'];
    readonly vegetables = ['Aubergine', 'Broccoli', 'Carrot', 'Courgette', 'Leek'];
}
```

### Item-aligned with scroll

Item-aligned positioning combined with a long list that overflows, showing both scroll buttons.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown, LucideChevronUp } from '@lucide/angular';
import { RdxSelectGroup } from '../src/select-group';
import { RdxSelectGroupLabel } from '../src/select-group-label';
import { RdxSelectItem } from '../src/select-item';
import { RdxSelectItemAlignedPosition } from '../src/select-item-aligned-position';
import { RdxSelectItemAlignedPositionContent } from '../src/select-item-aligned-position-content';
import { RdxSelectItemIndicator } from '../src/select-item-indicator';
import { RdxSelectItemText } from '../src/select-item-text';
import { RdxSelectList } from '../src/select-list';
import { RdxSelectPopup } from '../src/select-popup';
import { RdxSelectPortal } from '../src/select-portal';
import { RdxSelectRoot } from '../src/select-root';
import { RdxSelectScrollDownButton } from '../src/select-scroll-down-button';
import { RdxSelectScrollUpButton } from '../src/select-scroll-up-button';
import { RdxSelectTrigger } from '../src/select-trigger';
import { RdxSelectValue } from '../src/select-value';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'select-aligned-position-with-scroll',
    imports: [
        RdxSelectRoot,
        RdxSelectPortal,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectList,
        LucideChevronDown,
        LucideChevronUp,
        LucideCheck,
        RdxSelectItem,
        RdxSelectGroupLabel,
        RdxSelectGroup,
        RdxSelectPopup,
        RdxSelectItemAlignedPosition,
        RdxSelectItemText,
        RdxSelectItemAlignedPositionContent,
        RdxSelectItemIndicator,
        RdxSelectScrollDownButton,
        RdxSelectScrollUpButton
    ],
    template: `
        <ng-container [value]="fruit()" rdxSelectRoot>
            <button
                class="border-border bg-background text-foreground data-[placeholder]:text-muted-foreground hover:bg-muted focus-visible:ring-ring focus-visible:ring-offset-background inline-flex h-9 min-w-40 items-center justify-between gap-2 rounded-md border px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                aria-label="Customise options"
                rdxSelectTrigger
            >
                <span #selectedValue="rdxSelectedValue" rdxSelectValue placeholder="Select a fruit...">
                    {{ selectedValue.slotText() }}
                </span>
                <svg lucideChevronDown size="16" />
            </button>

            <div *rdxSelectPortal rdxSelectItemAlignedPosition>
                <div class="min-h-0 min-w-40 flex-1" rdxSelectPopup>
                    <div
                        class="border-border bg-popover text-popover-foreground z-[100] min-h-0 min-w-40 flex-1 overflow-hidden rounded-lg border shadow-md will-change-[opacity,transform]"
                        rdxSelectItemAlignedPositionContent
                    >
                        <div
                            class="text-muted-foreground hover:bg-muted bg-popover flex h-7 cursor-default items-center justify-center"
                            rdxSelectScrollUpButton
                        >
                            <svg lucideChevronUp size="16" />
                        </div>
                        <div class="p-1" rdxSelectList>
                            <div class="text-muted-foreground px-6 text-xs leading-6" rdxSelectGroupLabel>Fruits</div>
                            <div rdxSelectGroup>
                                @for (option of options; track option) {
                                    <div
                                        class="text-popover-foreground data-[disabled]:text-muted-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground relative flex h-7 cursor-default items-center rounded-sm pr-8 pl-6 text-sm leading-none outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                        [value]="option"
                                        rdxSelectItem
                                    >
                                        <span
                                            class="absolute left-0 inline-flex w-6 items-center justify-center"
                                            rdxSelectItemIndicator
                                        >
                                            <svg lucideCheck size="16" />
                                        </span>
                                        <span rdxSelectItemText>{{ option }}</span>
                                    </div>
                                }
                            </div>
                            <div class="bg-border mx-1 my-1 h-px"></div>
                            <div class="text-muted-foreground px-6 text-xs leading-6" rdxSelectGroupLabel>
                                Vegetables
                            </div>
                            <div rdxSelectGroup>
                                @for (vegetable of vegetables; track vegetable) {
                                    <div
                                        class="text-popover-foreground data-[disabled]:text-muted-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground relative flex h-7 cursor-default items-center rounded-sm pr-8 pl-6 text-sm leading-none outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                        [value]="vegetable"
                                        rdxSelectItem
                                    >
                                        <span
                                            class="absolute left-0 inline-flex w-6 items-center justify-center"
                                            rdxSelectItemIndicator
                                        >
                                            <svg lucideCheck size="16" />
                                        </span>
                                        <span rdxSelectItemText>{{ vegetable }}</span>
                                    </div>
                                }
                            </div>
                        </div>
                        <div
                            class="text-muted-foreground hover:bg-muted bg-popover flex h-7 cursor-default items-center justify-center"
                            rdxSelectScrollDownButton
                        >
                            <svg lucideChevronDown size="16" />
                        </div>
                    </div>
                </div>
            </div>
        </ng-container>
    `
})
export class SelectAlignedPositionWithScroll {
    readonly fruit = signal('Apple');

    readonly options = ['Apple', 'Banana', 'Blueberry', 'Grapes', 'Pineapple'];

    // Long enough to overflow the available viewport height, so the item-aligned popup scrolls
    // and the up/down scroll buttons appear.
    readonly vegetables = [
        'Aubergine',
        'Broccoli',
        'Carrot',
        'Courgette',
        'Leek',
        ...Array.from({ length: 25 }, (_, i) => `Vegetable ${i + 1}`)
    ];
}
```

## Accessibility

### Keyboard Interactions

| Key               | Description                                                                          |
| ----------------- | ------------------------------------------------------------------------------------ |
| `Enter` / `Space` | Opens the popup when the trigger is focused; selects the highlighted item when open. |
| `ArrowDown`       | Highlights the next item.                                                            |
| `ArrowUp`         | Highlights the previous item.                                                        |
| `Home`            | Highlights the first item.                                                           |
| `End`             | Highlights the last item.                                                            |
| `Escape`          | Closes the popup without changing the value.                                         |
| Character keys    | Typeahead — jumps to the first item whose text starts with the typed character.      |

Because interaction type is tracked explicitly (`openMethod`, `openInteractionType`,
`closeInteractionType`), consumers can branch on keyboard vs pointer/touch intent without guessing
from low-level DOM events. That matters for accessible UX: keyboard-only flows can preserve focus and
validation policy independently from touch and mouse dismiss/open behavior.

## API Reference

### RdxSelectRoot

The root context provider. Manages open state, selected value, dismiss/open lifecycle, and
interaction-type tracking. Its `onOpenChange` and `onValueChange` outputs are cancelable and include
reason-aware `eventDetails`, while `openMethod`, `openInteractionType`, and `closeInteractionType`
expose how the popup was opened or closed. Exposes `data-disabled` on the host.

### RdxSelectTrigger

The button that opens the popup. Must be a `<button>` element.

### RdxSelectValue

Renders the current selection inside the trigger. Reads the selected item's text from context.
Set a `placeholder` attribute for the empty state.

### RdxSelectItem

A single option in the list. Receives a `value` input and exposes `data-highlighted` (keyboard /
pointer focus) and `data-disabled`.

### RdxSelectPositioner

Wraps the popup panel when using Popper positioning. Accepts the same positioning inputs as
`rdxMenuPositioner` (`sideOffset`, `alignOffset`, `align`, `side`, `avoidCollisions`, …).

### RdxSelectItemText

Marks the text node of an item so Select can read it for the trigger display and typeahead. No
inputs.

### RdxSelectItemIndicator

Visible only when the parent `rdxSelectItem` is selected. No inputs.

### RdxSelectGroupLabel

A non-interactive label for a group. No inputs.

### RdxSelectGroup

Groups a set of related items semantically. No inputs.

### RdxSelectScrollUpButton

Renders at the top of the popup and scrolls the list up when hovered. Appears automatically when
content overflows. No inputs.

### RdxSelectScrollDownButton

Renders at the bottom of the popup and scrolls the list down when hovered. Appears automatically
when content overflows. No inputs.
