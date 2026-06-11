# Combobox

#### A filterable select: a text input that filters a list of options, with the highlighted option tracked via `aria-activedescendant`.

Combobox is headless — it ships no styles and exposes state via `data-*` attributes. Unlike Select,
DOM focus stays in the `<input>` at all times; the active option is virtual (`data-highlighted` +
`aria-activedescendant`). It does not accept free-form text — the input always reflects the current
selection when closed. For free-form entry, reach for Autocomplete (planned).

```typescript
import { Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';

@Component({
    selector: 'combobox-default',
    imports: [_importsCombobox, LucideChevronDown, LucideCheck],
    template: `
        <div [(value)]="value" rdxComboboxRoot>
            <div [class]="c.control">
                <input [class]="c.input" rdxComboboxInput placeholder="Search a fruit…" aria-label="Fruit" />
                <button [class]="c.trigger" rdxComboboxTrigger aria-label="Open">
                    <svg lucideChevronDown size="16"></svg>
                </button>
            </div>

            <div rdxComboboxPortal>
                <ng-template rdxComboboxPortalPresence>
                    <div [class]="c.positioner" rdxComboboxPositioner>
                        <div [class]="c.popup" rdxComboboxPopup>
                            <div [class]="c.list" rdxComboboxList aria-label="Fruits">
                                @for (fruit of fruits; track fruit) {
                                    <div [class]="c.item" [value]="fruit" rdxComboboxItem>
                                        <span [class]="c.itemIndicator" rdxComboboxItemIndicator>
                                            <svg lucideCheck size="14"></svg>
                                        </span>
                                        {{ fruit }}
                                    </div>
                                }
                            </div>
                            <div [class]="c.empty" rdxComboboxEmpty>No fruit found.</div>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class ComboboxDefault {
    protected readonly c = demoCombobox;
    readonly value = signal<string | null>(null);
    readonly fruits = ['Apple', 'Banana', 'Blueberry', 'Grape', 'Orange', 'Pineapple', 'Strawberry'];
}
```

## Features

- ✅ Controlled / uncontrolled selection via `[(value)]` and input text via `[(inputValue)]`.
- ✅ Single and multiple selection (`multiple`) with chips.
- ✅ Built-in locale-aware filtering, a custom `filter` function, or `[filter]="null"` for external/async lists.
- ✅ `autoHighlight`: `'input-change'` (first match while typing) or `'always'` (keep first highlighted).
- ✅ `selectionMode="none"` for filter-only / command-palette UIs (no committed value).
- ✅ Full keyboard support: ArrowDown / ArrowUp (loop via `loopFocus`), Home / End, Enter, Escape, Tab, Backspace.
- ✅ WAI-ARIA `combobox` / `listbox` semantics with `aria-activedescendant` (focus never leaves the input).
- ✅ `RdxComboboxValue` renders the selection in a trigger; `onItemHighlighted` reports the active item.
- ✅ Optional `modal` mode: locks page scroll and makes outside content inert, with a `Backdrop` part.
- ✅ `submitOnItemClick` to submit the form on selection; `onOpenChangeComplete` fires after the transition.
- ✅ `limit` caps how many matches show; arrow-key navigation never fights a resting mouse cursor.
- ✅ Forms: `ControlValueAccessor` on the root, plus Field integration on the input.
- ✅ Headless — state via `data-popup-open`, `data-list-empty`, `data-placeholder`, `data-selected`, `data-highlighted`.

## Import

```typescript
import {
  RdxComboboxAnchor,
  RdxComboboxArrow,
  RdxComboboxBackdrop,
  RdxComboboxChip,
  RdxComboboxChipRemove,
  RdxComboboxChips,
  RdxComboboxClear,
  RdxComboboxEmpty,
  RdxComboboxGroup,
  RdxComboboxGroupLabel,
  RdxComboboxIcon,
  RdxComboboxInput,
  RdxComboboxItem,
  RdxComboboxItemIndicator,
  RdxComboboxLabel,
  RdxComboboxList,
  RdxComboboxPopup,
  RdxComboboxPortal,
  RdxComboboxPortalPresence,
  RdxComboboxPositioner,
  RdxComboboxRoot,
  RdxComboboxStatus,
  RdxComboboxTrigger,
  RdxComboboxValue
} from '@radix-ng/primitives/combobox';
```

## Anatomy

The input is the popper anchor and keeps focus; options live in a portalled popup and are filtered in
place (non-matching items are hidden, not destroyed).

```html
<div rdxComboboxRoot>
  <input rdxComboboxInput placeholder="Search…" />
  <button rdxComboboxClear><!-- clear icon --></button>
  <button rdxComboboxTrigger><!-- chevron icon --></button>

  <div rdxComboboxPortal>
    <ng-template rdxComboboxPortalPresence>
      <div rdxComboboxPositioner>
        <div rdxComboboxPopup>
          <div rdxComboboxList>
            <div rdxComboboxGroup>
              <div rdxComboboxGroupLabel>Group</div>
              <div value="apple" rdxComboboxItem>
                <span rdxComboboxItemIndicator><!-- check icon --></span>
                Apple
              </div>
            </div>
          </div>
          <div rdxComboboxEmpty>No results.</div>
        </div>
      </div>
    </ng-template>
  </div>
</div>
```

By default the **input is the popup anchor**, which is ideal when the input fills the control. When
the control wraps more than the input — e.g. chips in `multiple` mode — put `rdxComboboxAnchor` on
the wrapping element so the popup aligns to the whole control instead of the inline input:

```html
<div rdxComboboxAnchor>
  <div rdxComboboxChips>
    <span value="apple" rdxComboboxChip>
      Apple
      <button rdxComboboxChipRemove><!-- × --></button>
    </span>
  </div>
  <input rdxComboboxInput />
</div>
```

## Examples

### Default

Single selection with built-in substring filtering. Type to filter, ArrowDown / Enter to pick.

```typescript
import { Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';

@Component({
    selector: 'combobox-default',
    imports: [_importsCombobox, LucideChevronDown, LucideCheck],
    template: `
        <div [(value)]="value" rdxComboboxRoot>
            <div [class]="c.control">
                <input [class]="c.input" rdxComboboxInput placeholder="Search a fruit…" aria-label="Fruit" />
                <button [class]="c.trigger" rdxComboboxTrigger aria-label="Open">
                    <svg lucideChevronDown size="16"></svg>
                </button>
            </div>

            <div rdxComboboxPortal>
                <ng-template rdxComboboxPortalPresence>
                    <div [class]="c.positioner" rdxComboboxPositioner>
                        <div [class]="c.popup" rdxComboboxPopup>
                            <div [class]="c.list" rdxComboboxList aria-label="Fruits">
                                @for (fruit of fruits; track fruit) {
                                    <div [class]="c.item" [value]="fruit" rdxComboboxItem>
                                        <span [class]="c.itemIndicator" rdxComboboxItemIndicator>
                                            <svg lucideCheck size="14"></svg>
                                        </span>
                                        {{ fruit }}
                                    </div>
                                }
                            </div>
                            <div [class]="c.empty" rdxComboboxEmpty>No fruit found.</div>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class ComboboxDefault {
    protected readonly c = demoCombobox;
    readonly value = signal<string | null>(null);
    readonly fruits = ['Apple', 'Banana', 'Blueberry', 'Grape', 'Orange', 'Pineapple', 'Strawberry'];
}
```

### Disabled

The whole control is disabled and won't open.

```typescript
import { Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';

@Component({
    selector: 'combobox-disabled',
    imports: [_importsCombobox, LucideChevronDown, LucideCheck],
    template: `
        <div [(value)]="value" disabled rdxComboboxRoot>
            <div [class]="c.control">
                <input [class]="c.input" rdxComboboxInput placeholder="Search a fruit…" aria-label="Fruit" />
                <button [class]="c.trigger" rdxComboboxTrigger aria-label="Open">
                    <svg lucideChevronDown size="16"></svg>
                </button>
            </div>

            <div rdxComboboxPortal>
                <ng-template rdxComboboxPortalPresence>
                    <div [class]="c.positioner" rdxComboboxPositioner>
                        <div [class]="c.popup" rdxComboboxPopup>
                            <div [class]="c.list" rdxComboboxList aria-label="Fruits">
                                @for (fruit of fruits; track fruit) {
                                    <div [class]="c.item" [value]="fruit" rdxComboboxItem>
                                        <span [class]="c.itemIndicator" rdxComboboxItemIndicator>
                                            <svg lucideCheck size="14"></svg>
                                        </span>
                                        {{ fruit }}
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class ComboboxDisabled {
    protected readonly c = demoCombobox;
    readonly value = signal<string | null>('Apple');
    readonly fruits = ['Apple', 'Banana', 'Blueberry', 'Grape'];
}
```

### Grouped

Options organized into sections with `RdxComboboxGroup` / `RdxComboboxGroupLabel`. A group hides its
heading automatically once all of its items are filtered out.

```typescript
import { Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';

/** Options organized into sections with `RdxComboboxGroup` / `RdxComboboxGroupLabel`. A group hides
 * its heading automatically when all of its items are filtered out. */
@Component({
    selector: 'combobox-grouped',
    imports: [_importsCombobox, LucideChevronDown, LucideCheck],
    template: `
        <div [(value)]="value" rdxComboboxRoot>
            <div [class]="c.control">
                <input [class]="c.input" rdxComboboxInput placeholder="Search produce…" aria-label="Produce" />
                <button [class]="c.trigger" rdxComboboxTrigger aria-label="Open">
                    <svg lucideChevronDown size="16"></svg>
                </button>
            </div>

            <div rdxComboboxPortal>
                <ng-template rdxComboboxPortalPresence>
                    <div [class]="c.positioner" rdxComboboxPositioner>
                        <div [class]="c.popup" rdxComboboxPopup>
                            <div [class]="c.list" rdxComboboxList aria-label="Produce">
                                <div rdxComboboxGroup>
                                    <div [class]="c.groupLabel" rdxComboboxGroupLabel>Fruits</div>
                                    @for (fruit of fruits; track fruit) {
                                        <div [class]="c.item" [value]="fruit" rdxComboboxItem>
                                            <span [class]="c.itemIndicator" rdxComboboxItemIndicator>
                                                <svg lucideCheck size="14"></svg>
                                            </span>
                                            {{ fruit }}
                                        </div>
                                    }
                                </div>
                                <div rdxComboboxGroup>
                                    <div [class]="c.groupLabel" rdxComboboxGroupLabel>Vegetables</div>
                                    @for (vegetable of vegetables; track vegetable) {
                                        <div [class]="c.item" [value]="vegetable" rdxComboboxItem>
                                            <span [class]="c.itemIndicator" rdxComboboxItemIndicator>
                                                <svg lucideCheck size="14"></svg>
                                            </span>
                                            {{ vegetable }}
                                        </div>
                                    }
                                </div>
                            </div>
                            <div [class]="c.empty" rdxComboboxEmpty>No produce found.</div>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class ComboboxGrouped {
    protected readonly c = demoCombobox;
    readonly value = signal<string | null>(null);
    readonly fruits = ['Apple', 'Banana', 'Grape', 'Orange'];
    readonly vegetables = ['Broccoli', 'Carrot', 'Leek', 'Spinach'];
}
```

### Multiple

Multiple selection: picks become chips before the input, the popup stays open between selections,
and Backspace in an empty input removes the last chip.

```typescript
import { Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown, LucideX } from '@lucide/angular';
import { cn, demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';

@Component({
    selector: 'combobox-multiple',
    imports: [_importsCombobox, LucideChevronDown, LucideCheck, LucideX],
    template: `
        <div [(value)]="value" multiple rdxComboboxRoot>
            <div [class]="control" rdxComboboxAnchor>
                @if (value().length) {
                    <div [class]="c.chips" rdxComboboxChips>
                        @for (fruit of value(); track fruit) {
                            <span [class]="c.chip" [value]="fruit" rdxComboboxChip>
                                {{ fruit }}
                                <button [class]="c.chipRemove" rdxComboboxChipRemove aria-label="Remove">
                                    <svg lucideX size="12"></svg>
                                </button>
                            </span>
                        }
                    </div>
                }
                <input
                    [class]="c.inputInline"
                    [placeholder]="value().length ? '' : 'Add fruits…'"
                    rdxComboboxInput
                    aria-label="Fruits"
                />
                <button [class]="c.trigger" rdxComboboxTrigger aria-label="Open">
                    <svg lucideChevronDown size="16"></svg>
                </button>
            </div>

            <div rdxComboboxPortal>
                <ng-template rdxComboboxPortalPresence>
                    <div [class]="c.positioner" rdxComboboxPositioner>
                        <div [class]="c.popup" rdxComboboxPopup>
                            <div [class]="c.list" rdxComboboxList aria-label="Fruits">
                                @for (fruit of fruits; track fruit) {
                                    <div [class]="c.item" [value]="fruit" rdxComboboxItem>
                                        <span [class]="c.itemIndicator" rdxComboboxItemIndicator>
                                            <svg lucideCheck size="14"></svg>
                                        </span>
                                        {{ fruit }}
                                    </div>
                                }
                            </div>
                            <div [class]="c.empty" rdxComboboxEmpty>No fruit found.</div>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class ComboboxMultiple {
    protected readonly c = demoCombobox;
    protected readonly control = cn(demoCombobox.control, 'h-auto min-h-9 flex-wrap items-center gap-1 py-1 pl-1');
    readonly value = signal<string[]>(['Apple']);
    readonly fruits = ['Apple', 'Banana', 'Blueberry', 'Grape', 'Orange', 'Pineapple', 'Strawberry'];
}
```

### Async / external filtering

`[filter]="null"` disables built-in matching so you can drive the list yourself (e.g. from a
request). `RdxComboboxStatus` announces loading and result counts.

```typescript
import { Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';

const ALL = ['Angular', 'Astro', 'Ember', 'Lit', 'Preact', 'Qwik', 'React', 'Solid', 'Svelte', 'Vue'];

/**
 * External filtering with `[filter]="null"`: the combobox does no matching of its own; the consumer
 * owns the rendered list. Here a fake async request populates results, and `RdxComboboxStatus`
 * announces loading / counts to assistive technology.
 */
@Component({
    selector: 'combobox-async',
    imports: [_importsCombobox, LucideChevronDown, LucideCheck],
    template: `
        <div [(value)]="value" [filter]="null" (onInputValueChange)="search($event)" rdxComboboxRoot>
            <div [class]="c.control">
                <input [class]="c.input" rdxComboboxInput placeholder="Search frameworks…" aria-label="Framework" />
                <button [class]="c.trigger" rdxComboboxTrigger aria-label="Open">
                    <svg lucideChevronDown size="16"></svg>
                </button>
            </div>

            <div rdxComboboxPortal>
                <ng-template rdxComboboxPortalPresence>
                    <div [class]="c.positioner" rdxComboboxPositioner>
                        <div [class]="c.popup" rdxComboboxPopup>
                            <div class="text-muted-foreground px-2 py-1 text-xs" rdxComboboxStatus>
                                @if (loading()) {
                                    Loading…
                                } @else {
                                    {{ results().length }} results
                                }
                            </div>
                            <div [class]="c.list" rdxComboboxList aria-label="Frameworks">
                                @for (item of results(); track item) {
                                    <div [class]="c.item" [value]="item" rdxComboboxItem>
                                        <span [class]="c.itemIndicator" rdxComboboxItemIndicator>
                                            <svg lucideCheck size="14"></svg>
                                        </span>
                                        {{ item }}
                                    </div>
                                }
                            </div>
                            @if (!loading() && results().length === 0) {
                                <div [class]="c.empty" rdxComboboxEmpty>Nothing found.</div>
                            }
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class ComboboxAsync {
    protected readonly c = demoCombobox;
    readonly value = signal<string | null>(null);
    readonly results = signal<string[]>(ALL);
    readonly loading = signal(false);

    private handle: ReturnType<typeof setTimeout> | undefined;

    search(query: string): void {
        this.loading.set(true);
        clearTimeout(this.handle);
        this.handle = setTimeout(() => {
            const q = query.trim().toLowerCase();
            this.results.set(q ? ALL.filter((item) => item.toLowerCase().includes(q)) : ALL);
            this.loading.set(false);
        }, 300);
    }
}
```

### Async with multiple selection

External filtering combined with `multiple` — results load asynchronously and picks become chips.

```typescript
import { Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown, LucideX } from '@lucide/angular';
import { cn, demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';

const ALL = ['Angular', 'Astro', 'Ember', 'Lit', 'Preact', 'Qwik', 'React', 'Solid', 'Svelte', 'Vue'];

/** External filtering (`[filter]="null"`) combined with multiple selection: results load
 * asynchronously and picks become chips, while `RdxComboboxStatus` announces loading / counts. */
@Component({
    selector: 'combobox-async-multiple',
    imports: [_importsCombobox, LucideChevronDown, LucideCheck, LucideX],
    template: `
        <div [(value)]="value" [filter]="null" (onInputValueChange)="search($event)" multiple rdxComboboxRoot>
            <div [class]="control" rdxComboboxAnchor>
                @if (value().length) {
                    <div [class]="c.chips" rdxComboboxChips>
                        @for (item of value(); track item) {
                            <span [class]="c.chip" [value]="item" rdxComboboxChip>
                                {{ item }}
                                <button [class]="c.chipRemove" rdxComboboxChipRemove aria-label="Remove">
                                    <svg lucideX size="12"></svg>
                                </button>
                            </span>
                        }
                    </div>
                }
                <input
                    [class]="c.inputInline"
                    [placeholder]="value().length ? '' : 'Add frameworks…'"
                    rdxComboboxInput
                    aria-label="Frameworks"
                />
                <button [class]="c.trigger" rdxComboboxTrigger aria-label="Open">
                    <svg lucideChevronDown size="16"></svg>
                </button>
            </div>

            <div rdxComboboxPortal>
                <ng-template rdxComboboxPortalPresence>
                    <div [class]="c.positioner" rdxComboboxPositioner>
                        <div [class]="c.popup" rdxComboboxPopup>
                            <div class="text-muted-foreground px-2 py-1 text-xs" rdxComboboxStatus>
                                @if (loading()) {
                                    Loading…
                                } @else {
                                    {{ results().length }} results
                                }
                            </div>
                            <div [class]="c.list" rdxComboboxList aria-label="Frameworks">
                                @for (item of results(); track item) {
                                    <div [class]="c.item" [value]="item" rdxComboboxItem>
                                        <span [class]="c.itemIndicator" rdxComboboxItemIndicator>
                                            <svg lucideCheck size="14"></svg>
                                        </span>
                                        {{ item }}
                                    </div>
                                }
                            </div>
                            @if (!loading() && results().length === 0) {
                                <div [class]="c.empty" rdxComboboxEmpty>Nothing found.</div>
                            }
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class ComboboxAsyncMultiple {
    protected readonly c = demoCombobox;
    protected readonly control = cn(demoCombobox.control, 'h-auto min-h-9 flex-wrap items-center gap-1 py-1 pl-1');
    readonly value = signal<string[]>([]);
    readonly results = signal<string[]>(ALL);
    readonly loading = signal(false);

    private handle: ReturnType<typeof setTimeout> | undefined;

    search(query: string): void {
        this.loading.set(true);
        clearTimeout(this.handle);
        this.handle = setTimeout(() => {
            const q = query.trim().toLowerCase();
            this.results.set(q ? ALL.filter((item) => item.toLowerCase().includes(q)) : ALL);
            this.loading.set(false);
        }, 300);
    }
}
```

### Creatable

Lets the user add a value that isn't in the list. When the query matches nothing, a "Create" row
appears; choosing it opens a modal dialog (prefilled with the query) to confirm the new label, which
is then added and selected — mirroring the Base UI pattern.

```typescript
import { Component, computed, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown, LucidePlus, LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoCombobox, demoDialog } from '../../storybook/styles';
import { _importsCombobox } from '../index';

/** Sentinel value for the "create" row, intercepted in `onValueChange`. */
const CREATE = '__rdx_create__';

/**
 * Creatable multiselect. When the query matches nothing, a "Create" row appears; choosing it opens a
 * modal dialog (prefilled with the query) to confirm the new label, which is then added and selected.
 * Mirrors the Base UI Creatable example.
 */
@Component({
    selector: 'combobox-creatable',
    imports: [_importsCombobox, ...dialogImports, LucideChevronDown, LucideCheck, LucidePlus, LucideX],
    template: `
        <div
            [(value)]="value"
            [(open)]="open"
            (onInputValueChange)="query.set($event)"
            (onValueChange)="onValueChange($event)"
            multiple
            rdxComboboxRoot
        >
            <div [class]="control" rdxComboboxAnchor>
                @if (value().length) {
                    <div [class]="c.chips" rdxComboboxChips>
                        @for (label of value(); track label) {
                            <span [class]="c.chip" [value]="label" rdxComboboxChip>
                                {{ label }}
                                <button [class]="c.chipRemove" rdxComboboxChipRemove aria-label="Remove">
                                    <svg lucideX size="12"></svg>
                                </button>
                            </span>
                        }
                    </div>
                }
                <input
                    [class]="c.inputInline"
                    [placeholder]="value().length ? '' : 'e.g. bug'"
                    rdxComboboxInput
                    aria-label="Labels"
                />
                <button [class]="c.trigger" rdxComboboxTrigger aria-label="Open">
                    <svg lucideChevronDown size="16"></svg>
                </button>
            </div>

            <div rdxComboboxPortal>
                <ng-template rdxComboboxPortalPresence>
                    <div [class]="c.positioner" rdxComboboxPositioner>
                        <div [class]="c.popup" rdxComboboxPopup>
                            <div [class]="c.list" rdxComboboxList aria-label="Labels">
                                @for (label of options(); track label) {
                                    <div [class]="c.item" [value]="label" rdxComboboxItem>
                                        <span [class]="c.itemIndicator" rdxComboboxItemIndicator>
                                            <svg lucideCheck size="14"></svg>
                                        </span>
                                        {{ label }}
                                    </div>
                                }
                                @if (showCreate()) {
                                    <div [class]="c.item" [value]="CREATE" [textValue]="query()" rdxComboboxItem>
                                        <span [class]="c.itemIndicator">
                                            <svg lucidePlus size="14"></svg>
                                        </span>
                                        Create "{{ query().trim() }}"
                                    </div>
                                }
                            </div>
                            <div [class]="c.empty" rdxComboboxEmpty>No labels found.</div>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>

        <div [(open)]="dialogOpen" rdxDialogRoot>
            <ng-template rdxDialogPortalPresence>
                <div [class]="d.portalAnimated" rdxDialogPortal>
                    <div [class]="d.backdrop" rdxDialogBackdrop></div>
                    <div [class]="cn(d.popup, d.popupAnimated)" rdxDialogPopup>
                        <h2 [class]="d.title" rdxDialogTitle>Create new label</h2>
                        <p [class]="d.description" rdxDialogDescription>Add a new label to select.</p>
                        <form (submit)="confirmCreate($event)">
                            <input
                                [class]="dialogInput"
                                [value]="newLabel()"
                                (input)="newLabel.set($any($event.target).value)"
                                placeholder="Label name"
                                aria-label="Label name"
                            />
                            <div [class]="d.footer">
                                <button [class]="cn(b.base, b.outline, b.size.sm)" type="button" rdxDialogClose>
                                    Cancel
                                </button>
                                <button [class]="cn(b.base, b.primary, b.size.sm)" type="submit">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class ComboboxCreatable {
    protected readonly c = demoCombobox;
    protected readonly d = demoDialog;
    protected readonly b = demoButton;
    protected readonly cn = cn;
    protected readonly CREATE = CREATE;
    protected readonly control = cn(demoCombobox.control, 'h-auto min-h-9 flex-wrap items-center gap-1 py-1 pl-1');
    protected readonly dialogInput = cn(
        'h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none',
        'placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring'
    );

    readonly value = signal<string[]>([]);
    readonly open = signal(false);
    readonly query = signal('');
    readonly options = signal<string[]>(['bug', 'documentation', 'enhancement', 'help wanted', 'good first issue']);

    readonly dialogOpen = signal(false);
    readonly newLabel = signal('');

    readonly showCreate = computed(() => {
        const q = this.query().trim().toLowerCase();
        return q !== '' && !this.options().some((label) => label.toLowerCase() === q);
    });

    onValueChange(next: unknown): void {
        const arr = (next as string[]) ?? [];
        if (arr.includes(CREATE)) {
            // Don't add the sentinel — open the create dialog prefilled with the current query.
            this.value.set(arr.filter((v) => v !== CREATE));
            this.newLabel.set(this.query().trim());
            this.open.set(false);
            this.dialogOpen.set(true);
        }
    }

    confirmCreate(event: Event): void {
        event.preventDefault();
        const label = this.newLabel().trim();
        if (!label) {
            return;
        }
        if (!this.options().some((l) => l.toLowerCase() === label.toLowerCase())) {
            this.options.update((options) => [...options, label]);
        }
        if (!this.value().includes(label)) {
            this.value.update((value) => [...value, label]);
        }
        this.dialogOpen.set(false);
        this.query.set('');
    }
}
```

### Input inside the popup

A select-like pattern where the trigger shows the current value and the search input lives inside the
popup. Put `rdxComboboxAnchor` on the trigger so the popup anchors to it; the input takes focus when
the popup opens.

```typescript
import { Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';

/**
 * A select-like pattern where the trigger shows the current value and the **search input lives inside
 * the popup**. `rdxComboboxAnchor` on the trigger anchors the popup; the input takes focus when the
 * popup opens.
 */
@Component({
    selector: 'combobox-input-in-popup',
    imports: [_importsCombobox, LucideChevronDown, LucideCheck],
    template: `
        <div class="flex flex-col items-start gap-1" [(value)]="value" rdxComboboxRoot>
            <span class="text-foreground text-sm font-medium" rdxComboboxLabel>Fruit</span>
            <button [class]="c.selectTrigger" rdxComboboxTrigger rdxComboboxAnchor>
                <span #selectedValue="rdxComboboxValue" rdxComboboxValue placeholder="Select a fruit">
                    {{ selectedValue.slotText() }}
                </span>
                <svg lucideChevronDown size="16"></svg>
            </button>

            <div rdxComboboxPortal>
                <ng-template rdxComboboxPortalPresence>
                    <div [class]="c.positioner" rdxComboboxPositioner>
                        <div [class]="c.popup + ' p-0'" rdxComboboxPopup>
                            <div [class]="c.searchHeader">
                                <input
                                    [class]="c.popupInput"
                                    rdxComboboxInput
                                    placeholder="Search…"
                                    aria-label="Fruit"
                                />
                            </div>
                            <div [class]="c.list + ' p-1'" rdxComboboxList aria-label="Fruits">
                                @for (fruit of fruits; track fruit) {
                                    <div [class]="c.item" [value]="fruit" rdxComboboxItem>
                                        <span [class]="c.itemIndicator" rdxComboboxItemIndicator>
                                            <svg lucideCheck size="14"></svg>
                                        </span>
                                        {{ fruit }}
                                    </div>
                                }
                                <div [class]="c.empty" rdxComboboxEmpty>No fruit found.</div>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class ComboboxInputInPopup {
    protected readonly c = demoCombobox;
    readonly value = signal<string | null>(null);
    readonly fruits = ['Apple', 'Banana', 'Blueberry', 'Grape', 'Orange', 'Pineapple', 'Strawberry'];
}
```

### Command palette

`selectionMode="none"` filters without committing a value — selecting an item emits `onValueChange`
as an activation signal and (by default) fills the input. Paired with `autoHighlight="always"` so the
first match is always ready for `Enter`.

```typescript
import { Component, signal } from '@angular/core';
import { LucideArrowRight } from '@lucide/angular';
import { demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';

/**
 * A command/search palette: `selectionMode="none"` (no value is committed — it filters and runs an
 * action) with `autoHighlight="always"` (the first match is always highlighted, so Enter runs it).
 */
@Component({
    selector: 'combobox-command',
    imports: [_importsCombobox, LucideArrowRight],
    template: `
        <div
            class="flex w-64 flex-col gap-2"
            (onValueChange)="run($event)"
            selectionMode="none"
            autoHighlight="always"
            rdxComboboxRoot
        >
            <div [class]="c.control">
                <input [class]="c.input" rdxComboboxInput placeholder="Run a command…" aria-label="Command" />
            </div>

            <div rdxComboboxPortal>
                <ng-template rdxComboboxPortalPresence>
                    <div [class]="c.positioner" rdxComboboxPositioner>
                        <div [class]="c.popup" rdxComboboxPopup>
                            <div [class]="c.list" rdxComboboxList aria-label="Commands">
                                @for (command of commands; track command) {
                                    <div [class]="c.item" [value]="command" rdxComboboxItem>
                                        <span [class]="c.itemIndicator">
                                            <svg lucideArrowRight size="14"></svg>
                                        </span>
                                        {{ command }}
                                    </div>
                                }
                            </div>
                            <div [class]="c.empty" rdxComboboxEmpty>No commands.</div>
                        </div>
                    </div>
                </ng-template>
            </div>

            <p class="text-muted-foreground text-sm">
                Last run:
                <code>{{ lastRun() ?? '—' }}</code>
            </p>
        </div>
    `
})
export class ComboboxCommand {
    protected readonly c = demoCombobox;
    readonly lastRun = signal<string | null>(null);
    readonly commands = ['New File', 'Open Folder', 'Save All', 'Toggle Terminal', 'Find in Files'];

    run(command: unknown): void {
        this.lastRun.set(typeof command === 'string' ? command : null);
    }
}
```

### Modal

With `modal`, page scroll is locked and content outside the popup is inert while open. Add a
`rdxComboboxBackdrop` (styled `position: fixed; inset: 0; pointer-events: auto`) behind the popup;
clicking it dismisses.

```typescript
import { Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';

/**
 * Modal combobox: while open, page scroll is locked and content outside the popup is inert. A
 * backdrop sits behind the popup; clicking it dismisses.
 */
@Component({
    selector: 'combobox-modal',
    imports: [_importsCombobox, LucideChevronDown, LucideCheck],
    template: `
        <div [(value)]="value" modal rdxComboboxRoot>
            <div [class]="c.control">
                <input [class]="c.input" rdxComboboxInput placeholder="Search a fruit…" aria-label="Fruit" />
                <button [class]="c.trigger" rdxComboboxTrigger aria-label="Open">
                    <svg lucideChevronDown size="16"></svg>
                </button>
            </div>

            <div rdxComboboxPortal>
                <ng-template rdxComboboxPortalPresence>
                    <div [class]="c.backdrop" rdxComboboxBackdrop></div>
                    <div [class]="c.positioner" rdxComboboxPositioner>
                        <div [class]="c.popup" rdxComboboxPopup>
                            <div [class]="c.list" rdxComboboxList aria-label="Fruits">
                                @for (fruit of fruits; track fruit) {
                                    <div [class]="c.item" [value]="fruit" rdxComboboxItem>
                                        <span [class]="c.itemIndicator" rdxComboboxItemIndicator>
                                            <svg lucideCheck size="14"></svg>
                                        </span>
                                        {{ fruit }}
                                    </div>
                                }
                            </div>
                            <div [class]="c.empty" rdxComboboxEmpty>No fruit found.</div>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class ComboboxModal {
    protected readonly c = demoCombobox;
    readonly value = signal<string | null>(null);
    readonly fruits = ['Apple', 'Banana', 'Blueberry', 'Grape', 'Orange', 'Pineapple', 'Strawberry'];
}
```

### Reactive forms

The root is a `ControlValueAccessor`, so it binds to a `FormControl` like any other control.

```typescript
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';

@Component({
    selector: 'combobox-reactive-forms',
    imports: [_importsCombobox, ReactiveFormsModule, LucideChevronDown, LucideCheck],
    template: `
        <form class="flex flex-col gap-3">
            <div [formControl]="fruit" rdxComboboxRoot>
                <div [class]="c.control">
                    <input [class]="c.input" rdxComboboxInput placeholder="Pick a fruit…" aria-label="Fruit" />
                    <button [class]="c.trigger" rdxComboboxTrigger aria-label="Open">
                        <svg lucideChevronDown size="16"></svg>
                    </button>
                </div>

                <div rdxComboboxPortal>
                    <ng-template rdxComboboxPortalPresence>
                        <div [class]="c.positioner" rdxComboboxPositioner>
                            <div [class]="c.popup" rdxComboboxPopup>
                                <div [class]="c.list" rdxComboboxList aria-label="Fruits">
                                    @for (f of fruits; track f) {
                                        <div [class]="c.item" [value]="f" rdxComboboxItem>
                                            <span [class]="c.itemIndicator" rdxComboboxItemIndicator>
                                                <svg lucideCheck size="14"></svg>
                                            </span>
                                            {{ f }}
                                        </div>
                                    }
                                </div>
                                <div [class]="c.empty" rdxComboboxEmpty>No fruit found.</div>
                            </div>
                        </div>
                    </ng-template>
                </div>
            </div>

            <p class="text-muted-foreground text-sm">
                Value:
                <code>{{ fruit.value ?? 'null' }}</code>
            </p>
        </form>
    `
})
export class ComboboxReactiveForms {
    protected readonly c = demoCombobox;
    readonly fruit = new FormControl<string | null>('Banana');
    readonly fruits = ['Apple', 'Banana', 'Blueberry', 'Grape', 'Orange'];
}
```

### Empty state

`RdxComboboxEmpty` shows only when no item matches the query.

```typescript
import { Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';

/**
 * `RdxComboboxEmpty` renders only when no item matches the query — type something like "zzz" to see
 * it. The input also gets `data-list-empty` so the control itself can react.
 */
@Component({
    selector: 'combobox-empty',
    imports: [_importsCombobox, LucideChevronDown, LucideCheck],
    template: `
        <div [(value)]="value" rdxComboboxRoot>
            <div [class]="c.control">
                <input [class]="c.input" rdxComboboxInput placeholder="Try typing 'zzz'…" aria-label="Fruit" />
                <button [class]="c.trigger" rdxComboboxTrigger aria-label="Open">
                    <svg lucideChevronDown size="16"></svg>
                </button>
            </div>

            <div rdxComboboxPortal>
                <ng-template rdxComboboxPortalPresence>
                    <div [class]="c.positioner" rdxComboboxPositioner>
                        <div [class]="c.popup" rdxComboboxPopup>
                            <div [class]="c.list" rdxComboboxList aria-label="Fruits">
                                @for (fruit of fruits; track fruit) {
                                    <div [class]="c.item" [value]="fruit" rdxComboboxItem>
                                        <span [class]="c.itemIndicator" rdxComboboxItemIndicator>
                                            <svg lucideCheck size="14"></svg>
                                        </span>
                                        {{ fruit }}
                                    </div>
                                }
                            </div>
                            <div [class]="c.empty" rdxComboboxEmpty>No fruit matches your search.</div>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class ComboboxEmpty {
    protected readonly c = demoCombobox;
    readonly value = signal<string | null>(null);
    readonly fruits = ['Apple', 'Banana', 'Grape'];
}
```

## Accessibility

### Keyboard Interactions

| Key                        | Description                                                                       |
| -------------------------- | --------------------------------------------------------------------------------- |
| Character keys             | Filter the list; open the popup if closed.                                        |
| `ArrowDown`                | Open and highlight the first item, or move the highlight down.                     |
| `ArrowUp`                  | Open and highlight the last item, or move the highlight up.                        |
| `Home` / `End`             | Move the text caret to the start / end of the input (standard text editing).      |
| `Enter`                    | Select the highlighted item; with none highlighted, close the popup (and submit). |
| `Escape`                   | Close the popup (reverting the in-progress query); the selection is preserved.     |
| `Tab`                      | Close the popup and move focus.                                                   |
| `Backspace`                | In `multiple` mode with an empty input, remove the last selected value.           |
| `ArrowLeft` (input start)  | In `multiple` mode, move focus from the input into the chips.                     |
| `ArrowLeft` / `ArrowRight` | Move focus between chips; `ArrowRight` past the last chip returns to the input.    |
| `Delete` / `Backspace`     | On a focused chip, remove it and focus an adjacent chip (or the input).           |

Modifier combinations (`Ctrl` / `Cmd` / `Alt`, or `Shift` for range selection) are left to the
browser so text editing keeps working. IME composition is respected — the list doesn't filter or
select mid-composition. Focus stays on the input throughout; the highlighted option is communicated
via `aria-activedescendant` and `data-highlighted`.

## API Reference

### RdxComboboxRoot

The context provider. Owns selection, input text, open state, filtering, and navigation, and
implements `ControlValueAccessor`.

### RdxComboboxInput

The text input. Carries `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-autocomplete`,
and `aria-activedescendant`, and inherits Field state. Exposes `data-popup-open`, `data-list-empty`,
and `data-placeholder`.

### RdxComboboxItem

A selectable option. Receives a `value`, an optional `textValue` (defaults to its text content,
excluding the indicator), and `disabled`. Exposes `data-selected`, `data-highlighted`, `data-disabled`.

### RdxComboboxPositioner

Positions the popup relative to the input. Accepts the popper positioning inputs (`side`,
`sideOffset`, `align`, `avoidCollisions`, …).

### RdxComboboxValue

Renders the current selection's label(s) — typically inside the trigger. Set `placeholder` for the
empty state; read `slotText()` (or `selectedLabels()`) in the template. Exposes `data-placeholder`
while nothing is selected.

### RdxComboboxChip

A selected-value chip in `multiple` mode. Provide its `value`.

### Parts without inputs

`RdxComboboxAnchor`, `RdxComboboxLabel` (registers an `aria-labelledby` target), `RdxComboboxTrigger`,
`RdxComboboxClear`, `RdxComboboxIcon`, `RdxComboboxPortal` (re-exposes `container`),
`RdxComboboxPortalPresence`, `RdxComboboxBackdrop` (modal overlay), `RdxComboboxPopup`,
`RdxComboboxArrow` (re-exposes `width` / `height`), `RdxComboboxList`, `RdxComboboxItemIndicator`,
`RdxComboboxGroup`, `RdxComboboxGroupLabel`,
`RdxComboboxEmpty`, `RdxComboboxStatus`, `RdxComboboxChips`, and `RdxComboboxChipRemove` read
everything from context and take no inputs of their own.
