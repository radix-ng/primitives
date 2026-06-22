# Combobox

#### A filterable select: a text input that filters a list of options, with the highlighted option tracked via `aria-activedescendant`.

Combobox is headless — it ships no styles and exposes state via `data-*` attributes. Unlike Select,
DOM focus stays in the `<input>` at all times; the active option is virtual (`data-highlighted` +
`aria-activedescendant`). It does not accept free-form text — the input always reflects the current
selection when closed. For free-form entry whose value is the typed text, reach for
[Autocomplete](?path=/docs/primitives-autocomplete--docs).

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
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

            <div *rdxComboboxPortal [class]="c.positioner" rdxComboboxPositioner>
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
- ✅ `onOpenChange` is cancellable and emits `{ open, reason, event, trigger, eventDetails }`; a controlled combobox can reject a close or keep the popup mounted during exit.
- ✅ `submitOnItemClick` to submit the form on selection; `onOpenChangeComplete` fires after the transition.
- ✅ `limit` caps how many matches show; arrow-key navigation never fights a resting mouse cursor.
- ✅ Hover behavior: `highlightItemOnHover` (default `true`) and `keepHighlight` (keep the highlight when the pointer leaves the list).
- ✅ External virtualization: `virtualized` + `[items]` drives index navigation and exposes `filteredItems()` for any virtualizer.
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

  <div *rdxComboboxPortal rdxComboboxPositioner>
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
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
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

            <div *rdxComboboxPortal [class]="c.positioner" rdxComboboxPositioner>
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
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
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

            <div *rdxComboboxPortal [class]="c.positioner" rdxComboboxPositioner>
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
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';

/** Options organized into sections with `RdxComboboxGroup` / `RdxComboboxGroupLabel`. A group hides
 * its heading automatically when all of its items are filtered out. */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
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

            <div *rdxComboboxPortal [class]="c.positioner" rdxComboboxPositioner>
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

### Grid

A 2D grid (`grid`): wrap items in `RdxComboboxRow` and the list becomes `role="grid"`. `ArrowUp` /
`ArrowDown` move between rows keeping the column; `ArrowLeft` / `ArrowRight` move within a row.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';
import { cn, demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';

/**
 * A 2D grid list (`grid`): `ArrowUp`/`ArrowDown` move between rows keeping the column, `ArrowLeft`/
 * `ArrowRight` move within a row. Items are wrapped in `RdxComboboxRow` and the list becomes
 * `role="grid"`.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'combobox-grid',
    imports: [_importsCombobox, LucideChevronDown],
    template: `
        <div [(value)]="value" grid rdxComboboxRoot>
            <div [class]="c.control">
                <input [class]="c.input" rdxComboboxInput placeholder="Pick a size…" aria-label="Size" />
                <button [class]="c.trigger" rdxComboboxTrigger aria-label="Open">
                    <svg lucideChevronDown size="16"></svg>
                </button>
            </div>

            <div *rdxComboboxPortal [class]="c.positioner" rdxComboboxPositioner>
                <div [class]="c.popup" rdxComboboxPopup>
                    <div [class]="list" rdxComboboxList aria-label="Sizes">
                        @for (row of rows; track $index) {
                            <div [class]="rowClass" rdxComboboxRow>
                                @for (size of row; track size) {
                                    <div [class]="cell" [value]="size" rdxComboboxItem>{{ size }}</div>
                                }
                            </div>
                        }
                    </div>
                    <div [class]="c.empty" rdxComboboxEmpty>No size found.</div>
                </div>
            </div>
        </div>
    `
})
export class ComboboxGrid {
    protected readonly c = demoCombobox;
    protected readonly list = 'flex flex-col gap-1 p-1';
    protected readonly rowClass = 'flex gap-1';
    protected readonly cell = cn(
        'flex h-9 flex-1 cursor-default items-center justify-center rounded-sm text-sm outline-none',
        'data-[highlighted]:bg-muted data-[selected]:bg-primary data-[selected]:text-primary-foreground'
    );

    readonly value = signal<string | null>(null);

    readonly rows = [
        ['XS', 'S', 'M', 'L'],
        ['XL', '2XL', '3XL', '4XL']
    ];
}
```

### Multiple

Multiple selection: picks become chips before the input, the popup stays open between selections,
and Backspace in an empty input removes the last chip.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown, LucideX } from '@lucide/angular';
import { cn, demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
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

            <div *rdxComboboxPortal [class]="c.positioner" rdxComboboxPositioner>
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

`[filter]="null"` disables built-in matching so you can drive the list yourself from a request.
Nothing loads until the user types — `RdxComboboxStatus` shows the "start typing" hint and announces
loading / counts, while the just-selected item is kept available so it survives new result streams.

```typescript
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown, LucideX } from '@lucide/angular';
import { cn, demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';

interface DirectoryUser {
    id: string;
    name: string;
    username: string;
    email: string;
    title: string;
}

/**
 * Async search backed by a remote source: results load on input changes (`[filter]="null"`, the
 * consumer owns the list), nothing is shown until the user types, and the just-selected item is kept
 * available so it survives new result streams. `RdxComboboxStatus` announces loading / counts and
 * `RdxComboboxEmpty` covers the "no matches" case — mirrors Base UI's async-single example.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'combobox-async',
    imports: [_importsCombobox, LucideChevronDown, LucideCheck, LucideX],
    template: `
        <div
            [(value)]="value"
            [items]="items()"
            [itemToStringLabel]="labelOf"
            [filter]="null"
            (onValueChange)="onValueChange()"
            (onInputValueChange)="search($event.value)"
            (onOpenChangeComplete)="onOpenChangeComplete($event)"
            isItemEqualToValue="id"
            rdxComboboxRoot
        >
            <div class="flex flex-col gap-1">
                <label class="text-foreground text-sm font-medium" for="async-reviewer">Assign reviewer</label>
                <div [class]="c.control">
                    <input id="async-reviewer" [class]="input" rdxComboboxInput placeholder="e.g. Michael" />
                    @if (value()) {
                        <button [class]="c.clear" rdxComboboxClear aria-label="Clear selection">
                            <svg lucideX size="14"></svg>
                        </button>
                    }
                    <button [class]="c.trigger" rdxComboboxTrigger aria-label="Open">
                        <svg lucideChevronDown size="16"></svg>
                    </button>
                </div>
            </div>

            <div *rdxComboboxPortal [class]="c.positioner" rdxComboboxPositioner>
                <div [class]="c.popup" [attr.aria-busy]="loading() ? 'true' : null" rdxComboboxPopup>
                    <div rdxComboboxStatus>
                        @if (loading()) {
                            <div class="text-muted-foreground flex items-center gap-2 px-2 py-1.5 text-sm">
                                <span
                                    class="inline-block size-3 animate-spin rounded-full border border-current border-r-transparent"
                                    aria-hidden="true"
                                ></span>
                                Searching…
                            </div>
                        } @else if (statusText(); as text) {
                            <div class="text-muted-foreground px-2 py-1.5 text-sm">{{ text }}</div>
                        }
                    </div>

                    @if (emptyMessage(); as message) {
                        <div [class]="c.empty" rdxComboboxEmpty>{{ message }}</div>
                    }

                    <div [class]="c.list" rdxComboboxList aria-label="People">
                        @for (user of items(); track user.id) {
                            <div [class]="item" [value]="user" [textValue]="user.name" rdxComboboxItem>
                                <span
                                    class="col-start-1 mt-0.5 flex size-3.5 items-center justify-center"
                                    rdxComboboxItemIndicator
                                >
                                    <svg lucideCheck size="14"></svg>
                                </span>
                                <span class="col-start-2 flex flex-col gap-0.5">
                                    <span class="text-foreground text-sm font-medium">{{ user.name }}</span>
                                    <span class="text-muted-foreground text-xs">{{ user.email }}</span>
                                    <span class="text-muted-foreground text-xs">
                                        {{ '@' + user.username }} · {{ user.title }}
                                    </span>
                                </span>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
export class ComboboxAsync {
    protected readonly c = demoCombobox;
    protected readonly input = cn(demoCombobox.input, 'pr-16');
    protected readonly item = cn(
        'relative grid cursor-default select-none grid-cols-[1rem_1fr] items-start gap-2 rounded-sm px-2 py-2 text-sm outline-none',
        'data-[highlighted]:bg-muted'
    );

    readonly value = signal<DirectoryUser | null>(null);

    /** Latest server results for the current query. */
    private readonly searchResults = signal<DirectoryUser[]>([]);
    /** The trimmed query text driving the search. */
    private readonly searchValue = signal('');
    readonly loading = signal(false);
    private readonly error = signal<string | null>(null);

    /** Render the selected user even when it isn't in the latest results, so it stays available. */
    readonly items = computed<DirectoryUser[]>(() => {
        const selected = this.value();
        const results = this.searchResults();
        if (!selected || results.some((user) => user.id === selected.id)) {
            return results;
        }
        return [...results, selected];
    });

    /** Non-loading status message (loading renders a spinner separately). */
    readonly statusText = computed<string | null>(() => {
        if (this.error()) {
            return this.error();
        }
        const query = this.searchValue().trim();
        if (query === '') {
            return this.value() ? null : 'Start typing to search people…';
        }
        if (this.searchResults().length === 0) {
            return `No matches for "${query}".`;
        }
        return null;
    });

    readonly emptyMessage = computed<string | null>(() => {
        const query = this.searchValue().trim();
        if (query === '' || this.loading() || this.searchResults().length > 0 || this.error()) {
            return null;
        }
        return 'Try a different search term.';
    });

    protected readonly labelOf = (user: DirectoryUser) => user.name;

    // Selecting a value writes its label back into the input, which re-emits `onInputValueChange`;
    // skip that single echo so it doesn't kick off a search for the just-selected name.
    private suppressSearch = false;
    private requestToken = 0;
    private handle: ReturnType<typeof setTimeout> | undefined;

    onValueChange(): void {
        this.searchValue.set('');
        this.error.set(null);
        // A pick writes its label back into the input (a synchronous echo) — suppress that one search.
        // Disarmed on a microtask so the deselect-on-empty `onValueChange(null)` (which has no echo)
        // doesn't leak the flag onto the next keystroke.
        this.suppressSearch = true;
        queueMicrotask(() => (this.suppressSearch = false));
    }

    onOpenChangeComplete(open: boolean): void {
        // Once closed with a selection, narrow the results to just it so reopening shows it (and
        // nothing else) until the next query streams in.
        const selected = this.value();
        if (!open && selected) {
            this.searchResults.set([selected]);
        }
    }

    search(query: string): void {
        if (this.suppressSearch) {
            this.suppressSearch = false;
            if (query.trim() === '') {
                this.searchResults.set([]);
            }
            return;
        }

        this.searchValue.set(query);

        if (query.trim() === '') {
            // Emptying the field resets the results to the pristine "start typing" state. The combobox
            // itself deselects the single value on empty (Base UI), so the demo doesn't clear it here.
            clearTimeout(this.handle);
            this.requestToken++;
            this.loading.set(false);
            this.searchResults.set([]);
            this.error.set(null);
            return;
        }

        const token = ++this.requestToken;
        this.loading.set(true);
        this.error.set(null);
        clearTimeout(this.handle);
        this.handle = setTimeout(() => {
            if (token !== this.requestToken) {
                return;
            }
            if (query.trim() === 'will_error') {
                this.searchResults.set([]);
                this.error.set('Failed to fetch people. Please try again.');
            } else {
                this.searchResults.set(this.filterUsers(query));
            }
            this.loading.set(false);
        }, 350);
    }

    private filterUsers(query: string): DirectoryUser[] {
        const q = query.trim().toLowerCase();
        return ALL_USERS.filter(
            (user) =>
                user.name.toLowerCase().includes(q) ||
                user.username.toLowerCase().includes(q) ||
                user.email.toLowerCase().includes(q) ||
                user.title.toLowerCase().includes(q)
        );
    }
}

const ALL_USERS: DirectoryUser[] = [
    {
        id: 'leslie-alexander',
        name: 'Leslie Alexander',
        username: 'leslie',
        email: 'leslie.alexander@example.com',
        title: 'Product Manager'
    },
    {
        id: 'kathryn-murphy',
        name: 'Kathryn Murphy',
        username: 'kathryn',
        email: 'kathryn.murphy@example.com',
        title: 'Marketing Lead'
    },
    {
        id: 'courtney-henry',
        name: 'Courtney Henry',
        username: 'courtney',
        email: 'courtney.henry@example.com',
        title: 'Design Systems'
    },
    {
        id: 'michael-foster',
        name: 'Michael Foster',
        username: 'michael',
        email: 'michael.foster@example.com',
        title: 'Engineering Manager'
    },
    {
        id: 'lindsay-walton',
        name: 'Lindsay Walton',
        username: 'lindsay',
        email: 'lindsay.walton@example.com',
        title: 'Product Designer'
    },
    { id: 'tom-cook', name: 'Tom Cook', username: 'tom', email: 'tom.cook@example.com', title: 'Frontend Engineer' },
    {
        id: 'whitney-francis',
        name: 'Whitney Francis',
        username: 'whitney',
        email: 'whitney.francis@example.com',
        title: 'Customer Success'
    },
    {
        id: 'jacob-jones',
        name: 'Jacob Jones',
        username: 'jacob',
        email: 'jacob.jones@example.com',
        title: 'Security Engineer'
    },
    {
        id: 'arlene-mccoy',
        name: 'Arlene McCoy',
        username: 'arlene',
        email: 'arlene.mccoy@example.com',
        title: 'Data Analyst'
    },
    {
        id: 'marvin-mckinney',
        name: 'Marvin McKinney',
        username: 'marvin',
        email: 'marvin.mckinney@example.com',
        title: 'QA Specialist'
    },
    {
        id: 'eleanor-pena',
        name: 'Eleanor Pena',
        username: 'eleanor',
        email: 'eleanor.pena@example.com',
        title: 'Operations'
    },
    {
        id: 'jerome-bell',
        name: 'Jerome Bell',
        username: 'jerome',
        email: 'jerome.bell@example.com',
        title: 'DevOps Engineer'
    }
];
```

### Async with multiple selection

External filtering combined with `multiple` — nothing loads until the user types, picks become
chips, and already-selected people stay available as new results stream in.

```typescript
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { LucideCheck, LucideX } from '@lucide/angular';
import { cn, demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';

interface DirectoryUser {
    id: string;
    name: string;
    username: string;
    email: string;
    title: string;
}

/**
 * Async search with multiple selection: results load on input changes (`[filter]="null"`, the
 * consumer owns the list), nothing shows until the user types, picks become chips, and the
 * already-selected people stay available while new results stream in. `RdxComboboxStatus` announces
 * loading / counts and `RdxComboboxEmpty` covers "no matches" — mirrors Base UI's async-multiple example.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'combobox-async-multiple',
    imports: [_importsCombobox, LucideCheck, LucideX],
    template: `
        <div
            [(value)]="value"
            [items]="items()"
            [itemToStringLabel]="labelOf"
            [filter]="null"
            (onValueChange)="onValueChange($event.value)"
            (onInputValueChange)="search($event.value)"
            (onOpenChangeComplete)="onOpenChangeComplete($event)"
            multiple
            rdxComboboxRoot
        >
            <div class="flex flex-col gap-1">
                <label class="text-foreground text-sm font-medium" for="async-reviewers">Assign reviewers</label>
                <div [class]="control" rdxComboboxAnchor>
                    @if (value().length) {
                        <div [class]="c.chips" rdxComboboxChips>
                            @for (user of value(); track user.id) {
                                <span [class]="c.chip" [value]="user" rdxComboboxChip>
                                    {{ user.name }}
                                    <button [class]="c.chipRemove" rdxComboboxChipRemove aria-label="Remove">
                                        <svg lucideX size="12"></svg>
                                    </button>
                                </span>
                            }
                        </div>
                    }
                    <input
                        id="async-reviewers"
                        [class]="c.inputInline"
                        [placeholder]="value().length ? '' : 'e.g. Michael'"
                        rdxComboboxInput
                    />
                </div>
            </div>

            <div *rdxComboboxPortal [class]="c.positioner" rdxComboboxPositioner>
                <div [class]="c.popup" [attr.aria-busy]="loading() ? 'true' : null" rdxComboboxPopup>
                    <div rdxComboboxStatus>
                        @if (loading()) {
                            <div class="text-muted-foreground flex items-center gap-2 px-2 py-1.5 text-sm">
                                <span
                                    class="inline-block size-3 animate-spin rounded-full border border-current border-r-transparent"
                                    aria-hidden="true"
                                ></span>
                                Searching…
                            </div>
                        } @else if (statusText(); as text) {
                            <div class="text-muted-foreground px-2 py-1.5 text-sm">{{ text }}</div>
                        }
                    </div>

                    @if (emptyMessage(); as message) {
                        <div [class]="c.empty" rdxComboboxEmpty>{{ message }}</div>
                    }

                    <div [class]="c.list" rdxComboboxList aria-label="People">
                        @for (user of items(); track user.id) {
                            <div [class]="item" [value]="user" [textValue]="user.name" rdxComboboxItem>
                                <span
                                    class="col-start-1 mt-0.5 flex size-3.5 items-center justify-center"
                                    rdxComboboxItemIndicator
                                >
                                    <svg lucideCheck size="14"></svg>
                                </span>
                                <span class="col-start-2 flex flex-col gap-0.5">
                                    <span class="text-foreground text-sm font-medium">{{ user.name }}</span>
                                    <span class="text-muted-foreground text-xs">{{ user.email }}</span>
                                    <span class="text-muted-foreground text-xs">
                                        {{ '@' + user.username }} · {{ user.title }}
                                    </span>
                                </span>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
export class ComboboxAsyncMultiple {
    protected readonly c = demoCombobox;
    protected readonly control = cn(demoCombobox.control, 'h-auto min-h-9 flex-wrap items-center gap-1 py-1 pl-1');
    protected readonly item = cn(
        'relative grid cursor-default select-none grid-cols-[1rem_1fr] items-start gap-2 rounded-sm px-2 py-2 text-sm outline-none',
        'data-[highlighted]:bg-muted'
    );

    /** Selected people (rendered as chips). */
    readonly value = signal<DirectoryUser[]>([]);

    /** Latest server results for the current query. */
    private readonly searchResults = signal<DirectoryUser[]>([]);
    /** The query text driving the search. */
    private readonly searchValue = signal('');
    readonly loading = signal(false);
    private readonly error = signal<string | null>(null);
    /**
     * After a pick the input clears but results stay visible for picking more — suppress the
     * "Start typing" / "No matches" status during that window (Base UI's `blockStartStatus`).
     */
    private readonly blockStartStatus = signal(false);

    /** Merge selected people into the results so picked chips stay available as results stream in. */
    readonly items = computed<DirectoryUser[]>(() => {
        const selected = this.value();
        const results = this.searchResults();
        if (selected.length === 0) {
            return results;
        }
        const merged = [...results];
        for (const user of selected) {
            if (!results.some((result) => result.id === user.id)) {
                merged.push(user);
            }
        }
        return merged;
    });

    /** Non-loading status message (loading renders a spinner separately). */
    readonly statusText = computed<string | null>(() => {
        if (this.error()) {
            return this.error();
        }
        const query = this.searchValue().trim();
        if (query === '' && !this.blockStartStatus()) {
            return this.value().length > 0 ? null : 'Start typing to search people…';
        }
        if (this.searchResults().length === 0 && !this.blockStartStatus()) {
            return `No matches for "${query}".`;
        }
        return null;
    });

    readonly emptyMessage = computed<string | null>(() => {
        const query = this.searchValue().trim();
        if (query === '' || this.loading() || this.searchResults().length > 0 || this.error()) {
            return null;
        }
        return 'Try a different search term.';
    });

    protected readonly labelOf = (user: DirectoryUser) => user.name;

    // A pick writes '' back into the input, re-emitting `onInputValueChange` synchronously. Skip that
    // echo (Base UI's `reason === 'item-press'`) so the current results stay visible for more picks.
    // Disarmed on a microtask so paths without an echo (chip remove / Backspace) don't leak it.
    private suppressEmptyEcho = false;
    private requestToken = 0;
    private handle: ReturnType<typeof setTimeout> | undefined;

    onValueChange(next: DirectoryUser[]): void {
        this.searchValue.set('');
        this.error.set(null);
        if (next.length === 0) {
            this.searchResults.set([]);
            this.blockStartStatus.set(false);
        } else {
            this.blockStartStatus.set(true);
        }
        this.suppressEmptyEcho = true;
        queueMicrotask(() => (this.suppressEmptyEcho = false));
    }

    onOpenChangeComplete(open: boolean): void {
        // Once closed, narrow the results to just the current selection so reopening shows the picks
        // (and nothing else) until the next query streams in.
        if (!open) {
            this.searchResults.set(this.value());
            this.blockStartStatus.set(false);
        }
    }

    search(query: string): void {
        this.searchValue.set(query);
        // Any input change aborts a pending request.
        const token = ++this.requestToken;
        clearTimeout(this.handle);

        if (query === '') {
            if (this.suppressEmptyEcho) {
                this.suppressEmptyEcho = false;
                this.loading.set(false);
                return;
            }
            // Genuine clear of the field: fall back to the selected people.
            this.loading.set(false);
            this.searchResults.set(this.value());
            this.error.set(null);
            this.blockStartStatus.set(false);
            return;
        }

        this.suppressEmptyEcho = false;
        this.loading.set(true);
        this.error.set(null);
        this.handle = setTimeout(() => {
            if (token !== this.requestToken) {
                return;
            }
            if (query.trim() === 'will_error') {
                this.searchResults.set([]);
                this.error.set('Failed to fetch people. Please try again.');
            } else {
                this.searchResults.set(this.filterUsers(query));
            }
            this.loading.set(false);
        }, 350);
    }

    private filterUsers(query: string): DirectoryUser[] {
        const q = query.trim().toLowerCase();
        return ALL_USERS.filter(
            (user) =>
                user.name.toLowerCase().includes(q) ||
                user.username.toLowerCase().includes(q) ||
                user.email.toLowerCase().includes(q) ||
                user.title.toLowerCase().includes(q)
        );
    }
}

const ALL_USERS: DirectoryUser[] = [
    {
        id: 'leslie-alexander',
        name: 'Leslie Alexander',
        username: 'leslie',
        email: 'leslie.alexander@example.com',
        title: 'Product Manager'
    },
    {
        id: 'kathryn-murphy',
        name: 'Kathryn Murphy',
        username: 'kathryn',
        email: 'kathryn.murphy@example.com',
        title: 'Marketing Lead'
    },
    {
        id: 'courtney-henry',
        name: 'Courtney Henry',
        username: 'courtney',
        email: 'courtney.henry@example.com',
        title: 'Design Systems'
    },
    {
        id: 'michael-foster',
        name: 'Michael Foster',
        username: 'michael',
        email: 'michael.foster@example.com',
        title: 'Engineering Manager'
    },
    {
        id: 'lindsay-walton',
        name: 'Lindsay Walton',
        username: 'lindsay',
        email: 'lindsay.walton@example.com',
        title: 'Product Designer'
    },
    { id: 'tom-cook', name: 'Tom Cook', username: 'tom', email: 'tom.cook@example.com', title: 'Frontend Engineer' },
    {
        id: 'whitney-francis',
        name: 'Whitney Francis',
        username: 'whitney',
        email: 'whitney.francis@example.com',
        title: 'Customer Success'
    },
    {
        id: 'jacob-jones',
        name: 'Jacob Jones',
        username: 'jacob',
        email: 'jacob.jones@example.com',
        title: 'Security Engineer'
    },
    {
        id: 'arlene-mccoy',
        name: 'Arlene McCoy',
        username: 'arlene',
        email: 'arlene.mccoy@example.com',
        title: 'Data Analyst'
    },
    {
        id: 'marvin-mckinney',
        name: 'Marvin McKinney',
        username: 'marvin',
        email: 'marvin.mckinney@example.com',
        title: 'QA Specialist'
    },
    {
        id: 'eleanor-pena',
        name: 'Eleanor Pena',
        username: 'eleanor',
        email: 'eleanor.pena@example.com',
        title: 'Operations'
    },
    {
        id: 'jerome-bell',
        name: 'Jerome Bell',
        username: 'jerome',
        email: 'jerome.bell@example.com',
        title: 'DevOps Engineer'
    }
];
```

### Creatable

Lets the user add a value that isn't in the list. When the query matches nothing, a "Create" row
appears; choosing it opens a modal dialog (prefilled with the query) to confirm the new label, which
is then added and selected — mirroring the Base UI pattern.

```typescript
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
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
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'combobox-creatable',
    imports: [_importsCombobox, ...dialogImports, LucideChevronDown, LucideCheck, LucidePlus, LucideX],
    template: `
        <div
            [(value)]="value"
            [(open)]="open"
            (onInputValueChange)="query.set($event.value)"
            (onValueChange)="onValueChange($event.value)"
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

            <div *rdxComboboxPortal [class]="c.positioner" rdxComboboxPositioner>
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
        </div>

        <div [(open)]="dialogOpen" rdxDialogRoot>
            <ng-template rdxDialogPortal>
                <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxDialogBackdrop></div>
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
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';

/**
 * A select-like pattern where the trigger shows the current value and the **search input lives inside
 * the popup**. `rdxComboboxAnchor` on the trigger anchors the popup; the input takes focus when the
 * popup opens.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
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

            <div *rdxComboboxPortal [class]="c.positioner" rdxComboboxPositioner>
                <div [class]="c.popup + ' p-0'" rdxComboboxPopup>
                    <div [class]="c.searchHeader">
                        <input [class]="c.popupInput" rdxComboboxInput placeholder="Search…" aria-label="Fruit" />
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
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideArrowRight } from '@lucide/angular';
import { demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';

/**
 * A command/search palette: `selectionMode="none"` (no value is committed — it filters and runs an
 * action) with `autoHighlight="always"` (the first match is always highlighted, so Enter runs it).
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'combobox-command',
    imports: [_importsCombobox, LucideArrowRight],
    template: `
        <div
            class="flex w-64 flex-col gap-2"
            (onValueChange)="run($event.value)"
            selectionMode="none"
            autoHighlight="always"
            rdxComboboxRoot
        >
            <div [class]="c.control">
                <input [class]="c.input" rdxComboboxInput placeholder="Run a command…" aria-label="Command" />
            </div>

            <div *rdxComboboxPortal [class]="c.positioner" rdxComboboxPositioner>
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
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';

/**
 * Modal combobox: while open, page scroll is locked and content outside the popup is inert. A
 * backdrop sits behind the popup; clicking it dismisses.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
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

            <ng-template rdxComboboxPortal>
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
    `
})
export class ComboboxModal {
    protected readonly c = demoCombobox;
    readonly value = signal<string | null>(null);
    readonly fruits = ['Apple', 'Banana', 'Blueberry', 'Grape', 'Orange', 'Pineapple', 'Strawberry'];
}
```

### Controlled open state

Use `[open]` + `(onOpenChange)` when the application needs to inspect or veto open-state changes.
The change payload includes `reason`, the originating DOM `event`, and `eventDetails.cancel()`.

```ts
protected readonly open = signal(false);

protected onOpenChange(change: { open: boolean; eventDetails: { cancel(): void } }) {
  if (!change.open && this.hasUnsavedSelection) {
    change.eventDetails.cancel();
    return;
  }

  this.open.set(change.open);
}
```

Live demo:

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { demoCombobox } from '../../storybook/styles';
import { _importsCombobox, RdxComboboxOpenChange } from '../index';

interface ComboboxOpenChangeLogEntry {
    label: string;
    reason: string;
    eventType: string;
    canceled: boolean;
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'combobox-open-change',
    imports: [_importsCombobox, LucideChevronDown, LucideCheck],
    template: `
        <div class="flex w-full max-w-[760px] flex-col gap-3">
            <div class="grid gap-3 md:grid-cols-[minmax(0,272px)_minmax(0,1fr)]">
                <div class="flex flex-col gap-3">
                    <div
                        #root="rdxComboboxRoot"
                        [(open)]="open"
                        [(value)]="value"
                        (onOpenChange)="handleOpenChange($event)"
                        rdxComboboxRoot
                    >
                        <div [class]="c.control">
                            <input
                                [class]="c.input"
                                rdxComboboxInput
                                placeholder="Search a framework…"
                                aria-label="Framework"
                            />
                            <button [class]="c.trigger" rdxComboboxTrigger aria-label="Open">
                                <svg lucideChevronDown size="16"></svg>
                            </button>
                        </div>

                        <div *rdxComboboxPortal [class]="c.positioner" rdxComboboxPositioner>
                            <div [class]="c.popup" rdxComboboxPopup>
                                <div [class]="c.list" rdxComboboxList aria-label="Frameworks">
                                    @for (framework of frameworks; track framework) {
                                        <div [class]="c.item" [value]="framework" rdxComboboxItem>
                                            <span [class]="c.itemIndicator" rdxComboboxItemIndicator>
                                                <svg lucideCheck size="14"></svg>
                                            </span>
                                            {{ framework }}
                                        </div>
                                    }
                                </div>
                                <div [class]="c.empty" rdxComboboxEmpty>No match found.</div>
                            </div>
                        </div>

                        <div class="grid gap-2 pt-3">
                            <button
                                class="border-border bg-background text-foreground hover:bg-muted inline-flex h-8 items-center justify-between rounded-md border px-3 text-xs"
                                (click)="cancelClose.update((value) => !value)"
                                type="button"
                            >
                                <span>Cancel close</span>
                                <span class="text-muted-foreground">{{ cancelClose() ? 'on' : 'off' }}</span>
                            </button>

                            <button
                                class="border-border bg-background text-foreground hover:bg-muted inline-flex h-8 items-center justify-between rounded-md border px-3 text-xs"
                                (click)="keepMountedOnClose.update((value) => !value)"
                                type="button"
                            >
                                <span>Keep mounted on close</span>
                                <span class="text-muted-foreground">{{ keepMountedOnClose() ? 'on' : 'off' }}</span>
                            </button>
                        </div>

                        <div
                            class="border-border bg-muted/40 mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 rounded-md border p-2.5 text-[11px]"
                        >
                            <div class="text-muted-foreground">open</div>
                            <div class="font-medium">{{ root.open() ? 'true' : 'false' }}</div>
                            <div class="text-muted-foreground">present</div>
                            <div class="font-medium">{{ root.present() ? 'true' : 'false' }}</div>
                            <div class="text-muted-foreground">cancel close</div>
                            <div class="font-medium">{{ cancelClose() ? 'on' : 'off' }}</div>
                            <div class="text-muted-foreground">keep mounted</div>
                            <div class="font-medium">{{ keepMountedOnClose() ? 'on' : 'off' }}</div>
                            <div class="text-muted-foreground">value</div>
                            <div class="truncate font-medium">{{ value() ?? 'unset' }}</div>
                        </div>
                    </div>
                </div>

                <div class="border-border bg-muted/30 flex min-h-[308px] min-w-0 flex-col rounded-lg border">
                    <div class="border-border flex items-center justify-between border-b px-3 py-2">
                        <div>
                            <div class="text-sm font-medium">Open change details</div>
                            <div class="text-muted-foreground text-xs">Inspect reasons and cancellation.</div>
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
                        <div class="flex max-h-[232px] flex-1 flex-col gap-2 overflow-y-auto pr-1">
                            @for (entry of logs(); track $index) {
                                <div
                                    class="border-border bg-background grid gap-1 rounded-md border p-2.5 text-[11px] leading-4"
                                >
                                    <div class="flex items-center justify-between gap-2">
                                        <span class="font-medium">{{ entry.label }}</span>
                                        <span class="text-muted-foreground truncate">{{ entry.reason }}</span>
                                    </div>
                                    <div class="text-foreground/80">event: {{ entry.eventType }}</div>
                                    <div class="text-muted-foreground">
                                        canceled:
                                        <span class="font-medium">{{ entry.canceled ? 'yes' : 'no' }}</span>
                                    </div>
                                </div>
                            } @empty {
                                <div class="text-muted-foreground flex flex-1 items-center justify-center text-sm">
                                    Open or close the combobox to inspect onOpenChange.
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class ComboboxOpenChange {
    protected readonly c = demoCombobox;

    readonly open = signal(false);
    readonly value = signal<string | null>(null);
    readonly cancelClose = signal(false);
    readonly keepMountedOnClose = signal(false);
    readonly logs = signal<ComboboxOpenChangeLogEntry[]>([]);

    readonly frameworks = ['Angular', 'React', 'Svelte', 'Solid', 'Vue', 'Qwik'];

    handleOpenChange(change: RdxComboboxOpenChange): void {
        if (!change.open && this.cancelClose()) {
            change.eventDetails.cancel();
        }

        if (!change.open && this.keepMountedOnClose()) {
            change.eventDetails.preventUnmountOnClose();
        }

        this.logs.update((entries) =>
            [
                {
                    label: `open -> ${change.open}`,
                    reason: change.reason,
                    eventType: change.event.type,
                    canceled: change.eventDetails.isCanceled()
                },
                ...entries
            ].slice(0, 8)
        );
    }
}
```

### Reactive forms

The root is a `ControlValueAccessor`, so it binds to a `FormControl` like any other control.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
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

                <div *rdxComboboxPortal [class]="c.positioner" rdxComboboxPositioner>
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

### Validation

Bind the control's validity to `[invalid]` so the input reflects `data-invalid` / `aria-invalid`; the
error message and submit guard follow the standard reactive-forms pattern.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { cn, demoButton, demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';

/**
 * Reactive forms with validation. The control's validity is bound to the combobox `[invalid]` input,
 * so the input reflects `data-invalid` / `aria-invalid` and the control shows a destructive ring once
 * touched. The error message and submit guard follow the standard reactive-forms pattern.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'combobox-validation',
    imports: [_importsCombobox, ReactiveFormsModule, LucideChevronDown, LucideCheck],
    template: `
        <form class="flex flex-col gap-3" (ngSubmit)="onSubmit()">
            <div [formControl]="fruit" [invalid]="showError()" rdxComboboxRoot>
                <div [class]="cn(c.control, showError() && 'border-destructive focus-within:ring-destructive')">
                    <input [class]="c.input" rdxComboboxInput placeholder="Pick a fruit…" aria-label="Fruit" />
                    <button [class]="c.trigger" rdxComboboxTrigger aria-label="Open">
                        <svg lucideChevronDown size="16"></svg>
                    </button>
                </div>

                <div *rdxComboboxPortal [class]="c.positioner" rdxComboboxPositioner>
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
            </div>

            @if (showError()) {
                <p class="text-destructive text-sm">Please pick a fruit.</p>
            }

            <button [class]="cn(b.base, b.primary, b.size.md, 'self-start')" type="submit">Submit</button>

            @if (submitted()) {
                <p class="text-muted-foreground text-sm">Submitted ✓</p>
            }
        </form>
    `
})
export class ComboboxValidation {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly c = demoCombobox;

    readonly fruit = new FormControl<string | null>(null, { validators: Validators.required });
    readonly fruits = ['Apple', 'Banana', 'Blueberry', 'Grape', 'Orange'];
    readonly submitted = signal(false);

    protected showError(): boolean {
        return this.fruit.invalid && this.fruit.touched;
    }

    onSubmit(): void {
        if (this.fruit.invalid) {
            this.fruit.markAsTouched();
            this.submitted.set(false);
            return;
        }
        this.submitted.set(true);
    }
}
```

### Empty state

`RdxComboboxEmpty` shows only when no item matches the query.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';

/**
 * `RdxComboboxEmpty` renders only when no item matches the query — type something like "zzz" to see
 * it. The input also gets `data-list-empty` so the control itself can react.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
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

            <div *rdxComboboxPortal [class]="c.positioner" rdxComboboxPositioner>
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
        </div>
    `
})
export class ComboboxEmpty {
    protected readonly c = demoCombobox;
    readonly value = signal<string | null>(null);
    readonly fruits = ['Apple', 'Banana', 'Grape'];
}
```

### Virtualized

Render very large lists efficiently by virtualizing externally. Set `virtualized` and pass the full
`[items]` to the root; it owns filtering and navigation by index and exposes the matching subset as
`filteredItems()` for a virtualization library. Give each rendered `RdxComboboxItem` its `[index]`, and
on `onItemHighlighted` call the virtualizer's `scrollToIndex(index)` so the highlighted row mounts
before `aria-activedescendant` references it. Provide `itemToStringLabel` when items are objects (it
supplies both the filter text and the selection label). Disabled items outside the rendered window are
not skipped by keyboard navigation.

Virtualizing the list requires a virtualization library. Radix NG does **not** depend on or ship one —
install it in your app. The example below uses
[`@tanstack/angular-virtual`](https://tanstack.com/virtual/latest/docs/framework/angular/angular-virtual):

```bash
npm install @tanstack/angular-virtual
```

Then drive a scroll container with `injectVirtualizer`, render only `getVirtualItems()`, and bind each
row's `[index]` to the virtual item's index — exactly as in the example's "Show code".

```typescript
import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChild } from '@angular/core';
import { LucideCheck } from '@lucide/angular';
import { injectVirtualizer } from '@tanstack/angular-virtual';
import { cn, demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';
import { ComboboxItemHighlightedDetails, RdxComboboxRoot } from '../src/combobox-root';

/**
 * Externally virtualized list of 10,000 items. The combobox owns filtering and index navigation
 * (`virtualized` + `[items]`); `@tanstack/angular-virtual` renders only the visible window. On each
 * keyboard/programmatic highlight change the demo scrolls the target index into view so the
 * highlighted row mounts before `aria-activedescendant` references it.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'combobox-virtualized-example',
    imports: [_importsCombobox, LucideCheck],
    template: `
        <div
            #cmb="rdxComboboxRoot"
            [(value)]="value"
            [items]="items"
            (onItemHighlighted)="onHighlight($event)"
            virtualized
            rdxComboboxRoot
        >
            <div [class]="c.control">
                <input [class]="c.input" rdxComboboxInput placeholder="Search 10,000 items…" aria-label="Item" />
            </div>

            <div *rdxComboboxPortal [class]="c.positioner" rdxComboboxPositioner>
                <div [class]="popup" rdxComboboxPopup>
                    <div [class]="c.empty" rdxComboboxEmpty>No items found.</div>
                    <div [class]="c.list" rdxComboboxList aria-label="Items">
                        <div #scroll [class]="scroller">
                            <div [class]="spacer" [style.height.px]="virtualizer.getTotalSize()">
                                @for (row of virtualizer.getVirtualItems(); track row.key) {
                                    <div
                                        [class]="item"
                                        [value]="cmb.filteredItems()[row.index]"
                                        [index]="row.index"
                                        [style.height.px]="row.size"
                                        [style.transform]="'translateY(' + row.start + 'px)'"
                                        rdxComboboxItem
                                    >
                                        <span [class]="c.itemIndicator" rdxComboboxItemIndicator>
                                            <svg lucideCheck size="14"></svg>
                                        </span>
                                        {{ cmb.filteredItems()[row.index] }}
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class ComboboxVirtualizedExample {
    protected readonly c = demoCombobox;
    // The inner `#scroll` div owns scrolling + max-height, so the popup must NOT add its own (the
    // shared `demoCombobox.popup` bakes in `max-h-60 overflow-y-auto`, which would be a second scrollbar).
    protected readonly popup = cn(
        'z-50 mt-2 rounded-md border border-border bg-popover text-popover-foreground shadow-md',
        'data-[closed]:hidden'
    );
    protected readonly scroller = 'max-h-60 overflow-auto overscroll-contain p-1';
    protected readonly spacer = 'relative w-full';
    // Absolutely positioned rows (no `relative` from `demoCombobox.item`) translated by the virtualizer.
    protected readonly item = cn(
        'absolute left-0 top-0 flex w-full cursor-default select-none items-center rounded-sm pl-8 pr-2 text-sm outline-none',
        'data-[highlighted]:bg-muted data-[selected]:font-medium'
    );

    readonly value = signal<string | null>(null);

    /** 10,000 string items — labels double as filter text, so no `itemToStringLabel` is needed here. */
    protected readonly items = Array.from(
        { length: 10000 },
        (_, index) => `Item ${String(index + 1).padStart(5, '0')}`
    );

    private readonly root = viewChild(RdxComboboxRoot);
    private readonly scrollEl = viewChild<ElementRef<HTMLDivElement>>('scroll');

    protected readonly virtualizer = injectVirtualizer(() => ({
        count: this.root()?.filteredItems().length ?? 0,
        estimateSize: () => 36,
        overscan: 12,
        getItemKey: (index: number) => index,
        scrollElement: this.scrollEl()
    }));

    /**
     * Keep the highlighted index in view. Pointer hover never scrolls; keyboard navigation and
     * programmatic highlights (`reason: 'none'`) scroll the (possibly unmounted) row into view with
     * minimal movement so its element mounts before `aria-activedescendant` points at it.
     */
    onHighlight(details: ComboboxItemHighlightedDetails): void {
        if (details.index < 0 || details.reason === 'pointer') {
            return;
        }
        queueMicrotask(() => this.virtualizer.scrollToIndex(details.index, { align: 'auto' }));
    }
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

`onValueChange` emits `{ value, reason, eventDetails }` and `onInputValueChange` emits
`{ value, eventDetails }`; both are cancelable via `eventDetails.cancel()`. The root host exposes
`data-disabled`.

### RdxComboboxInput

The text input. Carries `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-autocomplete`,
and `aria-activedescendant`, and inherits Field state.

**Data attributes**

| Attribute          | Present when                          |
| ------------------ | ------------------------------------- |
| `data-popup-open`  | The popup is open.                    |
| `data-list-empty`  | No options match the query.           |
| `data-placeholder` | No value is selected.                 |
| `data-filled`      | A value is selected.                  |
| `data-disabled`    | The input is disabled.                |
| `data-invalid` / `data-valid` | Validity state (via `Field`). |
| `data-required`    | The control is required.              |
| `data-focused`     | The input is focused (via `Field`).   |

### RdxComboboxItem

A selectable option. Receives a `value`, an optional `textValue` (defaults to its text content,
excluding the indicator), and `disabled`.

**Data attributes**

| Attribute          | Present when                                         |
| ------------------ | --------------------------------------------------- |
| `data-selected`    | The item is selected.                               |
| `data-highlighted` | The item is highlighted (keyboard / hover).         |
| `data-disabled`    | The item is disabled.                               |
| `data-hidden`      | The item is filtered out (a deliberate Radix extra).|

### RdxComboboxPositioner

Positions the popup relative to the input. Accepts the popper positioning inputs (`side`,
`sideOffset`, `align`, `avoidCollisions`, …).

**Data attributes**: `data-side`, `data-align`, `data-anchor-hidden`.

**CSS variables**

| Variable                                   | Description                                          |
| ------------------------------------------ | --------------------------------------------------- |
| `--anchor-width` / `--anchor-height`       | Size of the anchor (input), for matching popup width. |
| `--available-width` / `--available-height` | Space before the collision boundary.                |
| `--transform-origin`                       | Origin to scale/zoom the popup from.                |

### RdxComboboxPopup

The popup surface (composes the popper content + dismissable layer). Does not trap focus.

**Data attributes**

| Attribute             | Present when                                          |
| --------------------- | ---------------------------------------------------- |
| `data-open`           | The popup is open.                                   |
| `data-closed`         | The popup is closed.                                 |
| `data-empty`          | No options match the query.                          |
| `data-side`           | Resolved side — `top` / `right` / `bottom` / `left`. |
| `data-align`          | Resolved alignment — `start` / `center` / `end`.     |
| `data-starting-style` | The enter transition is about to run.               |
| `data-ending-style`   | The exit transition is running.                     |

### RdxComboboxValue

Renders the current selection's label(s) — typically inside the trigger. Set `placeholder` for the
empty state; read `slotText()` (or `selectedLabels()`) in the template. Exposes `data-placeholder`
while nothing is selected.

### RdxComboboxChip

A selected-value chip in `multiple` mode. Provide its `value`.

### Parts without inputs

`RdxComboboxAnchor`, `RdxComboboxInputGroup` (optional wrapper mirroring state via `data-*`),
`RdxComboboxLabel` (registers an `aria-labelledby` target), `RdxComboboxTrigger`, `RdxComboboxClear`
(also takes a `disabled` input), `RdxComboboxIcon`, `RdxComboboxPortal` (structural; re-exposes
`container`), `RdxComboboxBackdrop` (modal overlay; `data-open` / `data-closed`),
`RdxComboboxArrow` (re-exposes `width` / `height`), `RdxComboboxList` (exposes `data-empty` while no
options match, `role="grid"` when the root has `grid`), `RdxComboboxRow` (`role="row"` for grid lists),
`RdxComboboxItemIndicator`,
`RdxComboboxGroup`, `RdxComboboxGroupLabel`, `RdxComboboxSeparator` (`role="separator"`),
`RdxComboboxEmpty` / `RdxComboboxStatus` (polite atomic live regions), `RdxComboboxChips`
(`role="toolbar"`), and `RdxComboboxChipRemove` read everything from context and take no inputs of their own.
