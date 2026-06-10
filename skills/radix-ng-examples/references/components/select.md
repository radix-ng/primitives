# Select

#### A control that presents a list of options for the user to pick from, triggered by a button.

Select is headless — it ships no styles and exposes state via `data-*` attributes so you can style it
with any approach. Two positioning modes are available: **Popper** (Floating UI, anchored below the
trigger) and **Item-aligned** (the popup overlaps the trigger, aligned to the selected item, matching
native `<select>` behavior).

```typescript
import { Component, input } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { Align } from '@radix-ng/primitives/popper';
import { RdxSelectContent } from '../src/select-content';
import { RdxSelectGroup } from '../src/select-group';
import { RdxSelectItem } from '../src/select-item';
import { RdxSelectItemIndicator } from '../src/select-item-indicator';
import { RdxSelectItemText } from '../src/select-item-text';
import { RdxSelectLabel } from '../src/select-label';
import { RdxSelectPopperPositionContent } from '../src/select-popper-position-content';
import { RdxSelectPopperPositionWrapper } from '../src/select-popper-position-wrapper';
import { RdxSelectPortal } from '../src/select-portal';
import { RdxSelectPortalPresence } from '../src/select-portal-presence';
import { RdxSelectRoot } from '../src/select-root';
import { RdxSelectTrigger } from '../src/select-trigger';
import { RdxSelectValue } from '../src/select-value';
import { RdxSelectViewport } from '../src/select-viewport';

@Component({
    selector: 'select-default',
    imports: [
        RdxSelectRoot,
        RdxSelectPortal,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectPortalPresence,
        RdxSelectContent,
        RdxSelectViewport,
        LucideChevronDown,
        LucideCheck,
        RdxSelectItem,
        RdxSelectLabel,
        RdxSelectGroup,
        RdxSelectPopperPositionWrapper,
        RdxSelectPopperPositionContent,
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

            <div rdxSelectPortal>
                <ng-template rdxSelectPortalPresence>
                    <div rdxSelectContent>
                        <div
                            class="border-border bg-popover text-popover-foreground z-[100] min-w-40 rounded-lg border shadow-md will-change-[opacity,transform]"
                            [sideOffset]="sideOffset()"
                            [align]="align()"
                            rdxSelectPopperPositionWrapper
                        >
                            <div rdxSelectPopperPositionContent>
                                <div class="p-1" rdxSelectViewport>
                                    <div class="text-muted-foreground px-6 text-xs leading-6" rdxSelectLabel>
                                        Fruits
                                    </div>
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
                                    <div class="text-muted-foreground px-6 text-xs leading-6" rdxSelectLabel>
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
                </ng-template>
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
- ✅ Two positioning modes: Popper (Floating UI) and Item-aligned (native-like).
- ✅ Scroll buttons appear automatically when the list overflows the viewport.
- ✅ Typeahead: type a character to jump to matching items.
- ✅ Custom comparison function (`by`) for object values.
- ✅ Full keyboard navigation: ArrowDown / ArrowUp, Home, End, Enter / Space, Escape.
- ✅ WAI-ARIA `combobox` / `listbox` semantics with `aria-selected` and `aria-disabled`.
- ✅ Headless — state is exposed via `data-highlighted`, `data-disabled`, `data-placeholder`.

## Import

```typescript
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
  RdxSelectScrollDownButton,
  RdxSelectScrollUpButton,
  RdxSelectTrigger,
  RdxSelectValue,
  RdxSelectViewport
} from '@radix-ng/primitives/select';
```

## Anatomy

### Popper positioning (Floating UI)

The popup is anchored to the trigger and positioned with Floating UI — the same approach used by
Dropdown Menu and Popover. Use `rdxSelectPopperPositionWrapper` to configure side, align, and
offsets.

```html
<ng-container rdxSelectRoot>
  <button rdxSelectTrigger>
    <span #v="rdxSelectedValue" rdxSelectValue placeholder="Pick one…">{{ v.slotText() }}</span>
    <!-- chevron icon -->
  </button>

  <div rdxSelectPortal>
    <ng-template rdxSelectPortalPresence>
      <div rdxSelectContent>
        <div sideOffset="4" align="start" rdxSelectPopperPositionWrapper>
          <div rdxSelectPopperPositionContent>
            <!-- optional scroll-up button -->
            <div rdxSelectScrollUpButton><!-- up icon --></div>

            <div rdxSelectViewport>
              <div rdxSelectLabel>Group label</div>
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
      </div>
    </ng-template>
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

  <div rdxSelectPortal>
    <ng-template rdxSelectPortalPresence>
      <div rdxSelectContent>
        <div rdxSelectItemAlignedPosition>
          <div rdxSelectItemAlignedPositionContent>
            <div rdxSelectViewport>
              <div value="apple" rdxSelectItem>
                <span rdxSelectItemIndicator><!-- check icon --></span>
                <span rdxSelectItemText>Apple</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ng-template>
  </div>
</ng-container>
```

## Examples

### Default

A grouped list (Fruits / Vegetables) with Popper positioning. Click the trigger to open the popup.

```typescript
import { Component, input } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { Align } from '@radix-ng/primitives/popper';
import { RdxSelectContent } from '../src/select-content';
import { RdxSelectGroup } from '../src/select-group';
import { RdxSelectItem } from '../src/select-item';
import { RdxSelectItemIndicator } from '../src/select-item-indicator';
import { RdxSelectItemText } from '../src/select-item-text';
import { RdxSelectLabel } from '../src/select-label';
import { RdxSelectPopperPositionContent } from '../src/select-popper-position-content';
import { RdxSelectPopperPositionWrapper } from '../src/select-popper-position-wrapper';
import { RdxSelectPortal } from '../src/select-portal';
import { RdxSelectPortalPresence } from '../src/select-portal-presence';
import { RdxSelectRoot } from '../src/select-root';
import { RdxSelectTrigger } from '../src/select-trigger';
import { RdxSelectValue } from '../src/select-value';
import { RdxSelectViewport } from '../src/select-viewport';

@Component({
    selector: 'select-default',
    imports: [
        RdxSelectRoot,
        RdxSelectPortal,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectPortalPresence,
        RdxSelectContent,
        RdxSelectViewport,
        LucideChevronDown,
        LucideCheck,
        RdxSelectItem,
        RdxSelectLabel,
        RdxSelectGroup,
        RdxSelectPopperPositionWrapper,
        RdxSelectPopperPositionContent,
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

            <div rdxSelectPortal>
                <ng-template rdxSelectPortalPresence>
                    <div rdxSelectContent>
                        <div
                            class="border-border bg-popover text-popover-foreground z-[100] min-w-40 rounded-lg border shadow-md will-change-[opacity,transform]"
                            [sideOffset]="sideOffset()"
                            [align]="align()"
                            rdxSelectPopperPositionWrapper
                        >
                            <div rdxSelectPopperPositionContent>
                                <div class="p-1" rdxSelectViewport>
                                    <div class="text-muted-foreground px-6 text-xs leading-6" rdxSelectLabel>
                                        Fruits
                                    </div>
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
                                    <div class="text-muted-foreground px-6 text-xs leading-6" rdxSelectLabel>
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
                </ng-template>
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

### With scroll buttons

When the list is taller than the available viewport, `rdxSelectScrollUpButton` and
`rdxSelectScrollDownButton` appear automatically at the top and bottom of the popup.

```typescript
import { Component } from '@angular/core';
import { LucideCheck, LucideChevronDown, LucideChevronUp } from '@lucide/angular';
import { RdxSelectContent } from '../src/select-content';
import { RdxSelectGroup } from '../src/select-group';
import { RdxSelectItem } from '../src/select-item';
import { RdxSelectItemIndicator } from '../src/select-item-indicator';
import { RdxSelectItemText } from '../src/select-item-text';
import { RdxSelectLabel } from '../src/select-label';
import { RdxSelectPopperPositionContent } from '../src/select-popper-position-content';
import { RdxSelectPopperPositionWrapper } from '../src/select-popper-position-wrapper';
import { RdxSelectPortal } from '../src/select-portal';
import { RdxSelectPortalPresence } from '../src/select-portal-presence';
import { RdxSelectRoot } from '../src/select-root';
import { RdxSelectScrollDownButton } from '../src/select-scroll-down-button';
import { RdxSelectScrollUpButton } from '../src/select-scroll-up-button';
import { RdxSelectTrigger } from '../src/select-trigger';
import { RdxSelectValue } from '../src/select-value';
import { RdxSelectViewport } from '../src/select-viewport';

@Component({
    selector: 'select-with-scroll',
    imports: [
        RdxSelectRoot,
        RdxSelectPortal,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectPortalPresence,
        RdxSelectContent,
        RdxSelectViewport,
        LucideChevronDown,
        LucideChevronUp,
        LucideCheck,
        RdxSelectItem,
        RdxSelectLabel,
        RdxSelectGroup,
        RdxSelectPopperPositionWrapper,
        RdxSelectPopperPositionContent,
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

            <div rdxSelectPortal>
                <ng-template rdxSelectPortalPresence>
                    <div rdxSelectContent>
                        <div
                            class="border-border bg-popover text-popover-foreground z-[100] min-w-40 overflow-auto rounded-lg border shadow-md will-change-[opacity,transform]"
                            [sideOffset]="5"
                            align="start"
                            rdxSelectPopperPositionWrapper
                        >
                            <div rdxSelectPopperPositionContent>
                                <div
                                    class="text-muted-foreground hover:bg-muted bg-popover flex h-7 cursor-default items-center justify-center"
                                    rdxSelectScrollUpButton
                                >
                                    <svg lucideChevronUp size="16" />
                                </div>
                                <div class="h-[230px] p-1" rdxSelectViewport>
                                    <div class="text-muted-foreground px-6 text-xs leading-6" rdxSelectLabel>
                                        Fruits
                                    </div>
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
                                    <div class="text-muted-foreground px-6 text-xs leading-6" rdxSelectLabel>
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
                </ng-template>
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
import { Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { RdxSelectContent } from '../src/select-content';
import { RdxSelectGroup } from '../src/select-group';
import { RdxSelectItem } from '../src/select-item';
import { RdxSelectItemAlignedPosition } from '../src/select-item-aligned-position';
import { RdxSelectItemAlignedPositionContent } from '../src/select-item-aligned-position-content';
import { RdxSelectItemIndicator } from '../src/select-item-indicator';
import { RdxSelectItemText } from '../src/select-item-text';
import { RdxSelectLabel } from '../src/select-label';
import { RdxSelectPortal } from '../src/select-portal';
import { RdxSelectPortalPresence } from '../src/select-portal-presence';
import { RdxSelectRoot } from '../src/select-root';
import { RdxSelectTrigger } from '../src/select-trigger';
import { RdxSelectValue } from '../src/select-value';
import { RdxSelectViewport } from '../src/select-viewport';

@Component({
    selector: 'select-aligned-position',
    imports: [
        RdxSelectRoot,
        RdxSelectPortal,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectPortalPresence,
        RdxSelectViewport,
        LucideChevronDown,
        LucideCheck,
        RdxSelectItem,
        RdxSelectLabel,
        RdxSelectGroup,
        RdxSelectContent,
        RdxSelectItemAlignedPosition,
        RdxSelectItemText,
        RdxSelectItemAlignedPositionContent,
        RdxSelectItemIndicator
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

            <div rdxSelectPortal>
                <ng-template rdxSelectPortalPresence>
                    <div class="min-w-40" rdxSelectContent>
                        <div rdxSelectItemAlignedPosition>
                            <div
                                class="border-border bg-popover text-popover-foreground z-[100] min-w-40 rounded-lg border shadow-md will-change-[opacity,transform]"
                                rdxSelectItemAlignedPositionContent
                            >
                                <div class="p-1" rdxSelectViewport>
                                    <div class="text-muted-foreground px-6 text-xs leading-6" rdxSelectLabel>
                                        Fruits
                                    </div>
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
                                    <div class="text-muted-foreground px-6 text-xs leading-6" rdxSelectLabel>
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
                </ng-template>
            </div>
        </ng-container>
    `
})
export class SelectAlignedPosition {
    readonly fruit = signal('Apple');

    readonly options = ['Apple', 'Banana', 'Blueberry', 'Grapes', 'Pineapple'];
    readonly vegetables = ['Aubergine', 'Broccoli', 'Carrot', 'Courgette', 'Leek'];
}
```

### Item-aligned with scroll

Item-aligned positioning combined with a long list that overflows, showing both scroll buttons.

```typescript
import { Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown, LucideChevronUp } from '@lucide/angular';
import { RdxSelectContent } from '../src/select-content';
import { RdxSelectGroup } from '../src/select-group';
import { RdxSelectItem } from '../src/select-item';
import { RdxSelectItemAlignedPosition } from '../src/select-item-aligned-position';
import { RdxSelectItemAlignedPositionContent } from '../src/select-item-aligned-position-content';
import { RdxSelectItemIndicator } from '../src/select-item-indicator';
import { RdxSelectItemText } from '../src/select-item-text';
import { RdxSelectLabel } from '../src/select-label';
import { RdxSelectPortal } from '../src/select-portal';
import { RdxSelectPortalPresence } from '../src/select-portal-presence';
import { RdxSelectRoot } from '../src/select-root';
import { RdxSelectScrollDownButton } from '../src/select-scroll-down-button';
import { RdxSelectScrollUpButton } from '../src/select-scroll-up-button';
import { RdxSelectTrigger } from '../src/select-trigger';
import { RdxSelectValue } from '../src/select-value';
import { RdxSelectViewport } from '../src/select-viewport';

@Component({
    selector: 'select-aligned-position-with-scroll',
    imports: [
        RdxSelectRoot,
        RdxSelectPortal,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectPortalPresence,
        RdxSelectViewport,
        LucideChevronDown,
        LucideChevronUp,
        LucideCheck,
        RdxSelectItem,
        RdxSelectLabel,
        RdxSelectGroup,
        RdxSelectContent,
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

            <div rdxSelectPortal>
                <ng-template rdxSelectPortalPresence>
                    <div class="min-w-40" rdxSelectContent>
                        <div rdxSelectItemAlignedPosition>
                            <div
                                class="border-border bg-popover text-popover-foreground z-[100] min-w-40 overflow-hidden rounded-lg border shadow-md will-change-[opacity,transform]"
                                rdxSelectItemAlignedPositionContent
                            >
                                <div
                                    class="text-muted-foreground hover:bg-muted bg-popover flex h-7 cursor-default items-center justify-center"
                                    rdxSelectScrollUpButton
                                >
                                    <svg lucideChevronUp size="16" />
                                </div>
                                <div class="p-1" rdxSelectViewport>
                                    <div class="text-muted-foreground px-6 text-xs leading-6" rdxSelectLabel>
                                        Fruits
                                    </div>
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
                                    <div class="text-muted-foreground px-6 text-xs leading-6" rdxSelectLabel>
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
                </ng-template>
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

## API Reference

### RdxSelectRoot

The root context provider. Manages open state, selected value, and keyboard interaction. Exposes
`data-disabled` on the host.

### RdxSelectTrigger

The button that opens the popup. Must be a `<button>` element.

### RdxSelectValue

Renders the current selection inside the trigger. Reads the selected item's text from context.
Set a `placeholder` attribute for the empty state.

### RdxSelectItem

A single option in the list. Receives a `value` input and exposes `data-highlighted` (keyboard /
pointer focus) and `data-disabled`.

### RdxSelectPopperPositionWrapper

Wraps the popup panel when using Popper positioning. Accepts the same positioning inputs as
`rdxMenuPositioner` (`sideOffset`, `alignOffset`, `align`, `side`, `avoidCollisions`, …).

### RdxSelectItemText

Marks the text node of an item so Select can read it for the trigger display and typeahead. No
inputs.

### RdxSelectItemIndicator

Visible only when the parent `rdxSelectItem` is selected. No inputs.

### RdxSelectLabel

A non-interactive label for a group. No inputs.

### RdxSelectGroup

Groups a set of related items semantically. No inputs.

### RdxSelectScrollUpButton

Renders at the top of the popup and scrolls the list up when hovered. Appears automatically when
content overflows. No inputs.

### RdxSelectScrollDownButton

Renders at the bottom of the popup and scrolls the list down when hovered. Appears automatically
when content overflows. No inputs.
