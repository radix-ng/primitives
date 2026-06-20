# Autocomplete

#### A text input with a list of suggestions: free-form text whose value **is** the input string, with the active option tracked via `aria-activedescendant`.

Autocomplete is headless — it ships no styles and exposes state via `data-*` attributes. It is built on
the same engine as [Combobox](?path=/docs/primitives-combobox--docs), configured for a single, free-form
string value: typing, picking a suggestion, or clearing all change one string. DOM focus stays in the
`<input>` at all times; the active option is virtual (`data-highlighted` + `aria-activedescendant`).

Use Autocomplete for free-form entry with suggestions (search boxes, command inputs); use Combobox when
the value is a chosen item (or items) rather than the typed text.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { cn, demoCombobox } from '../../storybook/styles';
import { _importsAutocomplete } from '../index';

const TAGS = [
    'feature',
    'fix',
    'bug',
    'docs',
    'internal',
    'mobile',
    'component: accordion',
    'component: alert dialog',
    'component: autocomplete',
    'component: avatar',
    'component: checkbox',
    'component: checkbox group',
    'component: collapsible',
    'component: combobox',
    'component: context menu',
    'component: dialog',
    'component: field',
    'component: fieldset',
    'component: filterable menu',
    'component: form',
    'component: input',
    'component: menu',
    'component: menubar',
    'component: meter',
    'component: navigation menu',
    'component: number field',
    'component: popover',
    'component: preview card',
    'component: progress',
    'component: radio',
    'component: scroll area',
    'component: select',
    'component: separator',
    'component: slider',
    'component: switch',
    'component: tabs',
    'component: toast',
    'component: toggle',
    'component: toggle group',
    'component: toolbar',
    'component: tooltip'
];

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'autocomplete-default',
    imports: [_importsAutocomplete],
    template: `
        <div [(value)]="value" rdxAutocompleteRoot>
            <div [class]="c.control" rdxAutocompleteInputGroup>
                <input
                    [class]="cn(c.input, 'pr-3')"
                    rdxAutocompleteInput
                    placeholder="e.g. fix"
                    aria-label="Search tags"
                />
            </div>

            <div *rdxAutocompletePortal [class]="c.positioner" rdxAutocompletePositioner>
                <div [class]="c.popup" rdxAutocompletePopup>
                    <div [class]="c.list" rdxAutocompleteList aria-label="Tags">
                        @for (tag of tags; track tag) {
                            <div [class]="c.item" rdxAutocompleteItem>{{ tag }}</div>
                        }
                    </div>
                    <div [class]="c.empty" rdxAutocompleteEmpty>No tags found.</div>
                </div>
            </div>
        </div>
    `
})
export class AutocompleteDefault {
    protected readonly c = demoCombobox;
    protected readonly cn = cn;
    readonly value = signal('');
    readonly tags = TAGS;
}
```

## Features

- ✅ The value **is** the input string — `[(value)]`, `defaultValue`, and `onValueChange` (with a `reason`: `input-change` / `item-press` / `input-clear`).
- ✅ Four `mode`s: `list` (filter), `both` (filter + inline complete), `inline` (static + inline complete), `none` (static).
- ✅ Inline autocompletion: the active item's label fills the input with the completed suffix selected.
- ✅ Built-in locale-aware filtering, a custom `filter` function, or `[filter]="null"` for external/async lists.
- ✅ `autoHighlight`: `true` (first match while typing) or `'always'` (keep first highlighted).
- ✅ Hover behavior: `highlightItemOnHover` (default `true`) and `keepHighlight` (keep the highlight when the pointer leaves the list).
- ✅ Full keyboard support: ArrowDown / ArrowUp (loop via `loopFocus`), Enter, Escape, Tab.
- ✅ Grid layout (`grid` + `rdxAutocompleteRow`) with 2D arrow navigation (Up/Down by row, Left/Right within a row).
- ✅ Inline list (command palette): render `List` directly without `Portal` / `Positioner` / `Popup` for an always-open list.
- ✅ WAI-ARIA `combobox` / `listbox` semantics with `aria-activedescendant` (focus never leaves the input).
- ✅ Optional `modal` mode: locks page scroll and makes outside content inert, with a `Backdrop` part.
- ✅ `onOpenChange` is cancellable and emits `{ open, reason, event, trigger, eventDetails }`; controlled autocomplete can inspect or reject close/open requests.
- ✅ `limit` caps how many matches show; arrow-key navigation never fights a resting mouse cursor.
- ✅ External virtualization: `virtualized` + `[items]` drives index navigation and exposes `filteredItems()`.
- ✅ Forms: `ControlValueAccessor` on the root (value = input string), plus Field integration on the input.
- ✅ Headless — state via `data-popup-open`, `data-list-empty`, `data-highlighted`, `data-selected`, `data-disabled`.

## Import

```typescript
import {
  RdxAutocompleteAnchor,
  RdxAutocompleteArrow,
  RdxAutocompleteBackdrop,
  RdxAutocompleteClear,
  RdxAutocompleteEmpty,
  RdxAutocompleteGroup,
  RdxAutocompleteGroupLabel,
  RdxAutocompleteIcon,
  RdxAutocompleteInput,
  RdxAutocompleteInputGroup,
  RdxAutocompleteItem,
  RdxAutocompleteItemIndicator,
  RdxAutocompleteLabel,
  RdxAutocompleteList,
  RdxAutocompletePopup,
  RdxAutocompletePortal,
  RdxAutocompletePositioner,
  RdxAutocompleteRoot,
  RdxAutocompleteRow,
  RdxAutocompleteStatus,
  RdxAutocompleteTrigger,
  RdxAutocompleteValue
} from '@radix-ng/primitives/autocomplete';
```

## Anatomy

The input is the popper anchor and keeps focus; suggestions live in a portalled popup and are filtered
in place (non-matching items are hidden, not destroyed).

```html
<div rdxAutocompleteRoot>
  <div rdxAutocompleteInputGroup>
    <input rdxAutocompleteInput />
    <button rdxAutocompleteClear></button>
  </div>

  <div *rdxAutocompletePortal rdxAutocompletePositioner>
    <div rdxAutocompletePopup>
      <div rdxAutocompleteList>
        <div rdxAutocompleteGroup>
          <div rdxAutocompleteGroupLabel></div>
          <div rdxAutocompleteItem>
            <span rdxAutocompleteItemIndicator></span>
          </div>
        </div>
      </div>
      <div rdxAutocompleteEmpty></div>
    </div>
  </div>
</div>
```

## Examples

### Default

Type to filter a list of suggestions; pick one to fill the input.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { cn, demoCombobox } from '../../storybook/styles';
import { _importsAutocomplete } from '../index';

const TAGS = [
    'feature',
    'fix',
    'bug',
    'docs',
    'internal',
    'mobile',
    'component: accordion',
    'component: alert dialog',
    'component: autocomplete',
    'component: avatar',
    'component: checkbox',
    'component: checkbox group',
    'component: collapsible',
    'component: combobox',
    'component: context menu',
    'component: dialog',
    'component: field',
    'component: fieldset',
    'component: filterable menu',
    'component: form',
    'component: input',
    'component: menu',
    'component: menubar',
    'component: meter',
    'component: navigation menu',
    'component: number field',
    'component: popover',
    'component: preview card',
    'component: progress',
    'component: radio',
    'component: scroll area',
    'component: select',
    'component: separator',
    'component: slider',
    'component: switch',
    'component: tabs',
    'component: toast',
    'component: toggle',
    'component: toggle group',
    'component: toolbar',
    'component: tooltip'
];

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'autocomplete-default',
    imports: [_importsAutocomplete],
    template: `
        <div [(value)]="value" rdxAutocompleteRoot>
            <div [class]="c.control" rdxAutocompleteInputGroup>
                <input
                    [class]="cn(c.input, 'pr-3')"
                    rdxAutocompleteInput
                    placeholder="e.g. fix"
                    aria-label="Search tags"
                />
            </div>

            <div *rdxAutocompletePortal [class]="c.positioner" rdxAutocompletePositioner>
                <div [class]="c.popup" rdxAutocompletePopup>
                    <div [class]="c.list" rdxAutocompleteList aria-label="Tags">
                        @for (tag of tags; track tag) {
                            <div [class]="c.item" rdxAutocompleteItem>{{ tag }}</div>
                        }
                    </div>
                    <div [class]="c.empty" rdxAutocompleteEmpty>No tags found.</div>
                </div>
            </div>
        </div>
    `
})
export class AutocompleteDefault {
    protected readonly c = demoCombobox;
    protected readonly cn = cn;
    readonly value = signal('');
    readonly tags = TAGS;
}
```

### Inline autocompletion

With `mode="both"` (filter + inline) the input is completed from the first match, with the completed
suffix selected so the next keystroke replaces it. Inline modes highlight the first match implicitly,
so no `autoHighlight` is required.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { demoCombobox } from '../../storybook/styles';
import { _importsAutocomplete } from '../index';

const TAGS = [
    'feature',
    'fix',
    'bug',
    'docs',
    'internal',
    'mobile',
    'component: accordion',
    'component: alert dialog',
    'component: autocomplete',
    'component: avatar',
    'component: checkbox',
    'component: checkbox group',
    'component: collapsible',
    'component: combobox',
    'component: context menu',
    'component: dialog',
    'component: field',
    'component: fieldset',
    'component: filterable menu',
    'component: form',
    'component: input',
    'component: menu',
    'component: menubar',
    'component: meter',
    'component: navigation menu',
    'component: number field',
    'component: popover',
    'component: preview card',
    'component: progress',
    'component: radio',
    'component: scroll area',
    'component: select',
    'component: separator',
    'component: slider',
    'component: switch',
    'component: tabs',
    'component: toast',
    'component: toggle',
    'component: toggle group',
    'component: toolbar',
    'component: tooltip'
];

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'autocomplete-inline',
    imports: [_importsAutocomplete],
    template: `
        <div [(value)]="value" mode="both" rdxAutocompleteRoot>
            <div [class]="c.control" rdxAutocompleteInputGroup>
                <input [class]="c.input" rdxAutocompleteInput placeholder="e.g. fix" aria-label="Search tags" />
            </div>

            <div *rdxAutocompletePortal [class]="c.positioner" rdxAutocompletePositioner>
                <div [class]="c.popup" rdxAutocompletePopup>
                    <div [class]="c.list" rdxAutocompleteList aria-label="Tags">
                        @for (tag of tags; track tag) {
                            <div [class]="c.item" rdxAutocompleteItem>{{ tag }}</div>
                        }
                    </div>
                    <div [class]="c.empty" rdxAutocompleteEmpty>No tags found.</div>
                </div>
            </div>
        </div>
    `
})
export class AutocompleteInline {
    protected readonly c = demoCombobox;
    readonly value = signal('');
    readonly tags = TAGS;
}
```

### Auto highlight

`autoHighlight` keeps the first match highlighted as you type, so Enter selects it immediately.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { demoCombobox } from '../../storybook/styles';
import { _importsAutocomplete } from '../index';

const TAGS = [
    'feature',
    'fix',
    'bug',
    'docs',
    'internal',
    'mobile',
    'component: accordion',
    'component: alert dialog',
    'component: autocomplete',
    'component: avatar',
    'component: checkbox',
    'component: checkbox group',
    'component: collapsible',
    'component: combobox',
    'component: context menu',
    'component: dialog',
    'component: field',
    'component: fieldset',
    'component: filterable menu',
    'component: form',
    'component: input',
    'component: menu',
    'component: menubar',
    'component: meter',
    'component: navigation menu',
    'component: number field',
    'component: popover',
    'component: preview card',
    'component: progress',
    'component: radio',
    'component: scroll area',
    'component: select',
    'component: separator',
    'component: slider',
    'component: switch',
    'component: tabs',
    'component: toast',
    'component: toggle',
    'component: toggle group',
    'component: toolbar',
    'component: tooltip'
];

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'autocomplete-auto-highlight',
    imports: [_importsAutocomplete],
    template: `
        <div [(value)]="value" autoHighlight rdxAutocompleteRoot>
            <div [class]="c.control" rdxAutocompleteInputGroup>
                <input [class]="c.input" rdxAutocompleteInput placeholder="e.g. fix" aria-label="Search tags" />
            </div>

            <div *rdxAutocompletePortal [class]="c.positioner" rdxAutocompletePositioner>
                <div [class]="c.popup" rdxAutocompletePopup>
                    <div [class]="c.list" rdxAutocompleteList aria-label="Tags">
                        @for (tag of tags; track tag) {
                            <div [class]="c.item" rdxAutocompleteItem>{{ tag }}</div>
                        }
                    </div>
                    <div [class]="c.empty" rdxAutocompleteEmpty>No tags found.</div>
                </div>
            </div>
        </div>
    `
})
export class AutocompleteAutoHighlight {
    protected readonly c = demoCombobox;
    readonly value = signal('');
    readonly tags = TAGS;
}
```

### Grouped

Group related suggestions with `rdxAutocompleteGroup` / `rdxAutocompleteGroupLabel`; an empty group
hides its heading automatically.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { demoCombobox } from '../../storybook/styles';
import { _importsAutocomplete } from '../index';

interface Group {
    label: string;
    items: string[];
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'autocomplete-grouped',
    imports: [_importsAutocomplete],
    template: `
        <div [(value)]="value" rdxAutocompleteRoot>
            <div [class]="c.control" rdxAutocompleteInputGroup>
                <input [class]="c.input" rdxAutocompleteInput placeholder="e.g. fix" aria-label="Search tags" />
            </div>

            <div *rdxAutocompletePortal [class]="c.positioner" rdxAutocompletePositioner>
                <div [class]="c.popup" rdxAutocompletePopup>
                    <div [class]="c.list" rdxAutocompleteList aria-label="Tags">
                        @for (group of groups; track group.label) {
                            <div rdxAutocompleteGroup>
                                <div [class]="c.groupLabel" rdxAutocompleteGroupLabel>{{ group.label }}</div>
                                @for (item of group.items; track item) {
                                    <div [class]="c.item" rdxAutocompleteItem>{{ item }}</div>
                                }
                            </div>
                        }
                    </div>
                    <div [class]="c.empty" rdxAutocompleteEmpty>No tags found.</div>
                </div>
            </div>
        </div>
    `
})
export class AutocompleteGrouped {
    protected readonly c = demoCombobox;
    readonly value = signal('');
    readonly groups: Group[] = [
        { label: 'Type', items: ['feature', 'fix', 'bug', 'docs', 'internal', 'mobile'] },
        {
            label: 'Component',
            items: [
                'component: accordion',
                'component: alert dialog',
                'component: autocomplete',
                'component: avatar',
                'component: checkbox',
                'component: checkbox group',
                'component: collapsible',
                'component: combobox',
                'component: context menu',
                'component: dialog',
                'component: field',
                'component: fieldset',
                'component: filterable menu',
                'component: form',
                'component: input',
                'component: menu',
                'component: menubar',
                'component: meter',
                'component: navigation menu',
                'component: number field',
                'component: popover',
                'component: preview card',
                'component: progress',
                'component: radio',
                'component: scroll area',
                'component: select',
                'component: separator',
                'component: slider',
                'component: switch',
                'component: tabs',
                'component: toast',
                'component: toggle',
                'component: toggle group',
                'component: toolbar',
                'component: tooltip'
            ]
        }
    ];
}
```

### Limit

`limit` caps how many matches are shown at once.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { demoCombobox } from '../../storybook/styles';
import { _importsAutocomplete } from '../index';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'autocomplete-limit',
    imports: [_importsAutocomplete],
    template: `
        <div #ac="rdxAutocompleteRoot" [(value)]="value" [limit]="8" rdxAutocompleteRoot>
            <div [class]="c.control" rdxAutocompleteInputGroup>
                <input [class]="c.input" rdxAutocompleteInput placeholder="e.g. component" aria-label="Search tags" />
            </div>

            <div *rdxAutocompletePortal [class]="c.positioner" rdxAutocompletePositioner>
                <div [class]="c.popup" rdxAutocompletePopup>
                    <div [class]="c.list" rdxAutocompleteList aria-label="Tags">
                        @for (tag of tags; track tag) {
                            <div [class]="c.item" rdxAutocompleteItem>{{ tag }}</div>
                        }
                    </div>
                    <div [class]="c.empty" rdxAutocompleteEmpty>No tags found.</div>
                    @if (hiddenCount(ac.value()); as hidden) {
                        <div class="text-muted-foreground border-border mt-1 border-t px-2 py-1 text-xs">
                            {{ hidden }} more {{ hidden === 1 ? 'result' : 'results' }} not shown
                        </div>
                    }
                </div>
            </div>
        </div>
    `
})
export class AutocompleteLimit {
    protected readonly c = demoCombobox;
    readonly value = signal('');

    /** How many matches are hidden by the `limit` of 8, for the "N more results" hint. */
    hiddenCount(query: string): number {
        const q = query.trim().toLowerCase();
        const matches = q ? this.tags.filter((tag) => tag.toLowerCase().includes(q)).length : this.tags.length;
        return Math.max(0, matches - 8);
    }
    // Larger dataset (15 type tags + 35 component tags) so the `limit` of 8 is visible.
    readonly tags = [
        'feature',
        'fix',
        'bug',
        'docs',
        'internal',
        'mobile',
        'frontend',
        'backend',
        'performance',
        'accessibility',
        'design',
        'research',
        'testing',
        'infrastructure',
        'documentation',
        'component: accordion',
        'component: alert dialog',
        'component: autocomplete',
        'component: avatar',
        'component: checkbox',
        'component: checkbox group',
        'component: collapsible',
        'component: combobox',
        'component: context menu',
        'component: dialog',
        'component: field',
        'component: fieldset',
        'component: filterable menu',
        'component: form',
        'component: input',
        'component: menu',
        'component: menubar',
        'component: meter',
        'component: navigation menu',
        'component: number field',
        'component: popover',
        'component: preview card',
        'component: progress',
        'component: radio',
        'component: scroll area',
        'component: select',
        'component: separator',
        'component: slider',
        'component: switch',
        'component: tabs',
        'component: toast',
        'component: toggle',
        'component: toggle group',
        'component: toolbar',
        'component: tooltip'
    ];
}
```

### Fuzzy matching

A custom `filter` receives the item's text, the query, **and the item value** — so it can rank across
multiple fields. This example uses `match-sorter` over `title` / `description` / `category` and
highlights the matched text.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { matchSorter, rankings } from 'match-sorter';
import { cn, demoCombobox } from '../../storybook/styles';
import { _importsAutocomplete, AutocompleteFilter } from '../index';

interface DocItem {
    title: string;
    description: string;
    category: string;
}

/** Fuzzy, multi-field ranking with `match-sorter`. The filter receives the item value (object). */
const fuzzyFilter: AutocompleteFilter = (value, query) => {
    if (!query) {
        return true;
    }
    const item = value as DocItem;
    return (
        matchSorter([item], query, {
            keys: [
                'title',
                'description',
                'category',
                { key: 'title', threshold: rankings.CONTAINS },
                { key: 'description', threshold: rankings.WORD_STARTS_WITH }
            ]
        }).length > 0
    );
};

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'autocomplete-fuzzy',
    imports: [_importsAutocomplete],
    template: `
        <div #ac="rdxAutocompleteRoot" [(value)]="value" [filter]="fuzzy" rdxAutocompleteRoot>
            <div [class]="control" rdxAutocompleteInputGroup>
                <input [class]="c.input" rdxAutocompleteInput placeholder="e.g. React" aria-label="Documentation" />
            </div>

            <div *rdxAutocompletePortal [class]="positioner" rdxAutocompletePositioner>
                <div [class]="popup" rdxAutocompletePopup>
                    <div [class]="c.empty" rdxAutocompleteEmpty>No results found for "{{ ac.value() }}".</div>
                    <div [class]="c.list" rdxAutocompleteList aria-label="Documentation">
                        @for (item of items; track item.title) {
                            <div [class]="itemClass" [value]="item" [textValue]="item.title" rdxAutocompleteItem>
                                <span class="flex flex-col gap-0.5">
                                    <span
                                        class="text-foreground leading-5 font-semibold"
                                        [innerHTML]="highlight(item.title, ac.value())"
                                    ></span>
                                    <span
                                        class="text-muted-foreground text-xs leading-4"
                                        [innerHTML]="highlight(item.description, ac.value())"
                                    ></span>
                                </span>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
export class AutocompleteFuzzy {
    protected readonly c = demoCombobox;
    protected readonly fuzzy = fuzzyFilter;
    protected readonly control = cn(
        'border-border bg-background relative inline-flex h-9 w-80 items-center rounded-md border',
        'focus-within:ring-ring focus-within:ring-offset-background focus-within:ring-2 focus-within:ring-offset-2'
    );
    protected readonly positioner = 'w-80 data-[closed]:pointer-events-none';
    protected readonly popup = cn(
        'border-border bg-popover text-popover-foreground z-50 mt-2 max-h-72 overflow-y-auto rounded-md border p-1 shadow-md',
        'data-[closed]:hidden'
    );
    protected readonly itemClass = cn(
        'flex cursor-default select-none rounded-sm px-2 py-2 outline-none',
        'data-[highlighted]:bg-muted'
    );
    protected readonly markClass = 'text-match bg-transparent font-semibold';

    readonly value = signal('');

    readonly items: DocItem[] = [
        {
            title: 'React Hooks Guide',
            description: 'Learn how to use React Hooks like useState, useEffect, and custom hooks',
            category: 'React'
        },
        {
            title: 'JavaScript Array Methods',
            description: 'Master array methods like map, filter, reduce, and forEach in JavaScript',
            category: 'JavaScript'
        },
        {
            title: 'CSS Flexbox Layout',
            description: 'Complete guide to CSS Flexbox for responsive web design',
            category: 'CSS'
        },
        {
            title: 'TypeScript Interfaces',
            description: 'Understanding TypeScript interfaces and type definitions',
            category: 'TypeScript'
        },
        {
            title: 'React Performance Optimization',
            description: 'Tips and techniques for optimizing React application performance',
            category: 'React'
        },
        {
            title: 'HTML Semantic Elements',
            description: 'Using semantic HTML elements for better accessibility and SEO',
            category: 'HTML'
        },
        {
            title: 'Node.js Express Server',
            description: 'Building RESTful APIs with Node.js and Express framework',
            category: 'Node.js'
        },
        {
            title: 'Vue Composition API',
            description: 'Modern Vue.js development using the Composition API',
            category: 'Vue.js'
        },
        {
            title: 'Angular Components',
            description: 'Creating reusable Angular components with TypeScript',
            category: 'Angular'
        },
        {
            title: 'Python Django Framework',
            description: 'Web development with Python Django framework',
            category: 'Python'
        },
        {
            title: 'CSS Grid Layout',
            description: 'Advanced CSS Grid techniques for complex layouts',
            category: 'CSS'
        },
        {
            title: 'React Testing Library',
            description: 'Testing React components with React Testing Library',
            category: 'React'
        },
        {
            title: 'MongoDB Queries',
            description: 'Advanced MongoDB queries and aggregation pipelines',
            category: 'Database'
        },
        {
            title: 'Webpack Configuration',
            description: 'Optimizing webpack configuration for production builds',
            category: 'Build Tools'
        },
        {
            title: 'SASS/SCSS Guide',
            description: 'Writing maintainable CSS with SASS and SCSS',
            category: 'CSS'
        }
    ];

    /**
     * Wraps the query matches in `text` with `<mark>`, returning an HTML string. Built with `join('')`
     * (no template whitespace between segments) and bound via `[innerHTML]` so adjacent matched/unmatched
     * runs render contiguously — a `<mark>` interpolated in the template would gain stray spaces around it.
     * Segments are HTML-escaped; `<mark class>` survives Angular's default sanitizer, so no bypass is needed.
     */
    highlight(text: string, query: string): string {
        const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const trimmed = query.trim();
        if (!trimmed) {
            return esc(text);
        }
        const escaped = trimmed.slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escaped})`, 'gi');
        const lower = trimmed.toLowerCase();
        return text
            .split(regex)
            .filter((part) => part !== '')
            .map((part) =>
                part.toLowerCase() === lower ? `<mark class="${this.markClass}">${esc(part)}</mark>` : esc(part)
            )
            .join('');
    }
}
```

### Async

`[filter]="null"` hands filtering to you; a fake request searches the movie list (`will_error` simulates
a failure) and `RdxAutocompleteStatus` announces loading, result counts, and errors.

```typescript
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { demoCombobox } from '../../storybook/styles';
import { _importsAutocomplete } from '../index';

interface Movie {
    id: string;
    title: string;
    year: number;
}

const top100Movies: Movie[] = [
    { id: '1', title: 'The Shawshank Redemption', year: 1994 },
    { id: '2', title: 'The Godfather', year: 1972 },
    { id: '3', title: 'The Dark Knight', year: 2008 },
    { id: '4', title: 'The Godfather Part II', year: 1974 },
    { id: '5', title: '12 Angry Men', year: 1957 },
    { id: '6', title: 'The Lord of the Rings: The Return of the King', year: 2003 },
    { id: '7', title: "Schindler's List", year: 1993 },
    { id: '8', title: 'Pulp Fiction', year: 1994 },
    { id: '9', title: 'The Lord of the Rings: The Fellowship of the Ring', year: 2001 },
    { id: '10', title: 'The Good, the Bad and the Ugly', year: 1966 },
    { id: '11', title: 'Forrest Gump', year: 1994 },
    { id: '12', title: 'The Lord of the Rings: The Two Towers', year: 2002 },
    { id: '13', title: 'Fight Club', year: 1999 },
    { id: '14', title: 'Inception', year: 2010 },
    { id: '15', title: 'Star Wars: Episode V – The Empire Strikes Back', year: 1980 },
    { id: '16', title: 'The Matrix', year: 1999 },
    { id: '17', title: 'Goodfellas', year: 1990 },
    { id: '18', title: 'Interstellar', year: 2014 },
    { id: '19', title: "One Flew Over the Cuckoo's Nest", year: 1975 },
    { id: '20', title: 'Se7en', year: 1995 },
    { id: '21', title: "It's a Wonderful Life", year: 1946 },
    { id: '22', title: 'The Silence of the Lambs', year: 1991 },
    { id: '23', title: 'Seven Samurai', year: 1954 },
    { id: '24', title: 'Saving Private Ryan', year: 1998 },
    { id: '25', title: 'City of God', year: 2002 },
    { id: '26', title: 'Life Is Beautiful', year: 1997 },
    { id: '27', title: 'The Green Mile', year: 1999 },
    { id: '28', title: 'Star Wars: Episode IV – A New Hope', year: 1977 },
    { id: '29', title: 'Terminator 2: Judgment Day', year: 1991 },
    { id: '30', title: 'Back to the Future', year: 1985 },
    { id: '31', title: 'Spirited Away', year: 2001 },
    { id: '32', title: 'The Pianist', year: 2002 },
    { id: '33', title: 'Psycho', year: 1960 },
    { id: '34', title: 'Parasite', year: 2019 },
    { id: '35', title: 'Gladiator', year: 2000 },
    { id: '36', title: 'Léon: The Professional', year: 1994 },
    { id: '37', title: 'American History X', year: 1998 },
    { id: '38', title: 'The Departed', year: 2006 },
    { id: '39', title: 'Whiplash', year: 2014 },
    { id: '40', title: 'The Prestige', year: 2006 },
    { id: '41', title: 'Grave of the Fireflies', year: 1988 },
    { id: '42', title: 'The Usual Suspects', year: 1995 },
    { id: '43', title: 'Casablanca', year: 1942 },
    { id: '44', title: 'Harakiri', year: 1962 },
    { id: '45', title: 'The Lion King', year: 1994 },
    { id: '46', title: 'The Intouchables', year: 2011 },
    { id: '47', title: 'Modern Times', year: 1936 },
    { id: '48', title: 'The Lives of Others', year: 2006 },
    { id: '49', title: 'Once Upon a Time in the West', year: 1968 },
    { id: '50', title: 'Rear Window', year: 1954 },
    { id: '51', title: 'Alien', year: 1979 },
    { id: '52', title: 'City Lights', year: 1931 },
    { id: '53', title: 'The Shining', year: 1980 },
    { id: '54', title: 'Cinema Paradiso', year: 1988 },
    { id: '55', title: 'Avengers: Infinity War', year: 2018 },
    { id: '56', title: 'Paths of Glory', year: 1957 },
    { id: '57', title: 'Django Unchained', year: 2012 },
    { id: '58', title: 'WALL·E', year: 2008 },
    { id: '59', title: 'Sunset Boulevard', year: 1950 },
    { id: '60', title: 'The Great Dictator', year: 1940 },
    { id: '61', title: 'The Dark Knight Rises', year: 2012 },
    { id: '62', title: 'Princess Mononoke', year: 1997 },
    { id: '63', title: 'Witness for the Prosecution', year: 1957 },
    { id: '64', title: 'Oldboy', year: 2003 },
    { id: '65', title: 'Aliens', year: 1986 },
    { id: '66', title: 'Once Upon a Time in America', year: 1984 },
    { id: '67', title: 'Coco', year: 2017 },
    { id: '68', title: 'Your Name.', year: 2016 },
    { id: '69', title: 'American Beauty', year: 1999 },
    { id: '70', title: 'Braveheart', year: 1995 },
    { id: '71', title: 'Das Boot', year: 1981 },
    { id: '72', title: '3 Idiots', year: 2009 },
    { id: '73', title: 'Toy Story', year: 1995 },
    { id: '74', title: 'Inglourious Basterds', year: 2009 },
    { id: '75', title: 'High and Low', year: 1963 },
    { id: '76', title: 'Amadeus', year: 1984 },
    { id: '77', title: 'Good Will Hunting', year: 1997 },
    { id: '78', title: 'Star Wars: Episode VI – Return of the Jedi', year: 1983 },
    { id: '79', title: 'The Hunt', year: 2012 },
    { id: '80', title: 'Capharnaüm', year: 2018 },
    { id: '81', title: 'Reservoir Dogs', year: 1992 },
    { id: '82', title: 'Eternal Sunshine of the Spotless Mind', year: 2004 },
    { id: '83', title: 'Requiem for a Dream', year: 2000 },
    { id: '84', title: 'Come and See', year: 1985 },
    { id: '85', title: 'Ikiru', year: 1952 },
    { id: '86', title: 'Vertigo', year: 1958 },
    { id: '87', title: 'Lawrence of Arabia', year: 1962 },
    { id: '88', title: 'Citizen Kane', year: 1941 },
    { id: '89', title: 'Memento', year: 2000 },
    { id: '90', title: 'North by Northwest', year: 1959 },
    { id: '91', title: 'Star Wars: Episode III – Revenge of the Sith', year: 2005 },
    { id: '92', title: '2001: A Space Odyssey', year: 1968 },
    { id: '93', title: 'Amélie', year: 2001 },
    { id: '94', title: "Singin' in the Rain", year: 1952 },
    { id: '95', title: 'Apocalypse Now', year: 1979 },
    { id: '96', title: 'Taxi Driver', year: 1976 },
    { id: '97', title: 'Downfall', year: 2004 },
    { id: '98', title: 'The Wolf of Wall Street', year: 2013 },
    { id: '99', title: 'A Clockwork Orange', year: 1971 },
    { id: '100', title: 'Double Indemnity', year: 1944 }
];

/**
 * Asynchronous, server-style search with `[filter]="null"`: the autocomplete does no matching of its
 * own and the result list starts **empty** — nothing is loaded until the user types. Each keystroke
 * fires a debounced fake request over `top100Movies` (by title or year); `will_error` simulates a
 * failure. The popup is hidden until there is a status to show, so pressing ArrowDown on an empty
 * input never reveals the whole catalogue. `RdxAutocompleteStatus` announces loading / counts / errors.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'autocomplete-async',
    imports: [_importsAutocomplete],
    template: `
        <div [(value)]="value" [filter]="null" (onValueChange)="search($event.value)" rdxAutocompleteRoot>
            <div [class]="c.control" rdxAutocompleteInputGroup>
                <input
                    [class]="c.input"
                    rdxAutocompleteInput
                    placeholder="e.g. Pulp Fiction or 1994"
                    aria-label="Movie"
                />
            </div>

            <div *rdxAutocompletePortal [class]="c.positioner" rdxAutocompletePositioner>
                <div [class]="c.popup" [hidden]="!status()" rdxAutocompletePopup>
                    <div class="text-muted-foreground flex items-center gap-2 px-2 py-1 text-xs" rdxAutocompleteStatus>
                        @if (loading()) {
                            <span
                                class="inline-block size-3 animate-spin rounded-full border border-current border-r-transparent"
                                aria-hidden="true"
                            ></span>
                            Searching…
                        } @else {
                            {{ status() }}
                        }
                    </div>
                    <div [class]="c.list" rdxAutocompleteList aria-label="Movies">
                        @for (movie of results(); track movie.id) {
                            <div [class]="c.item" [value]="movie.title" [textValue]="movie.title" rdxAutocompleteItem>
                                {{ movie.title }}
                                <span class="text-muted-foreground ml-1 text-xs">{{ movie.year }}</span>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
export class AutocompleteAsync {
    protected readonly c = demoCombobox;
    readonly value = signal('');
    readonly results = signal<Movie[]>([]);
    readonly loading = signal(false);
    readonly error = signal<string | null>(null);

    /** Status text shown above the list; `null` keeps the popup hidden (empty, idle input). */
    readonly status = computed<string | null>(() => {
        if (this.loading()) {
            return 'Searching…';
        }
        if (this.error()) {
            return this.error();
        }
        if (this.value() === '') {
            return null;
        }
        if (this.results().length === 0) {
            return `Movie or year "${this.value()}" does not exist in the Top 100 IMDb movies`;
        }
        const count = this.results().length;
        return `${count} result${count === 1 ? '' : 's'} found`;
    });

    private handle: ReturnType<typeof setTimeout> | undefined;
    private requestId = 0;

    /** Debounced "server" search. Empty query loads nothing; stale responses are ignored. */
    search(query: string): void {
        clearTimeout(this.handle);
        this.error.set(null);
        if (query === '') {
            this.loading.set(false);
            this.results.set([]);
            return;
        }
        this.loading.set(true);
        const requestId = ++this.requestId;
        this.handle = setTimeout(() => {
            if (requestId !== this.requestId) {
                return; // superseded by a newer keystroke
            }
            if (query === 'will_error') {
                this.results.set([]);
                this.error.set('Failed to fetch movies. Please try again.');
            } else {
                const q = query.trim().toLowerCase();
                this.results.set(
                    top100Movies.filter(
                        (movie) => movie.title.toLowerCase().includes(q) || String(movie.year).includes(q)
                    )
                );
            }
            this.loading.set(false);
        }, 350);
    }
}
```

### Command palette

An always-open, inline autocomplete (no popup — the `List` is rendered directly) inside a `Dialog`.
`autoHighlight="always"` keeps the first match highlighted; selecting a command closes the dialog
(the autocomplete's `open` is shared with the dialog via `[(open)]`).

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoCard, demoDialog } from '../../storybook/styles';
import { _importsAutocomplete } from '../index';

interface Item {
    value: string;
    label: string;
}

interface Group {
    value: string;
    items: Item[];
}

/**
 * Command palette: an always-open, inline autocomplete (no popup) inside a `Dialog`. `autoHighlight`
 * keeps the first match highlighted; selecting a command closes the dialog (the autocomplete sets
 * `open` to `false`, which is shared with the dialog via `[(open)]`).
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'autocomplete-command-palette',
    imports: [...dialogImports, _importsAutocomplete],
    template: `
        <div [(open)]="open" rdxDialogRoot>
            <button [class]="cn(b.base, b.primary, b.size.md)" rdxDialogTrigger>Open command palette</button>

            <ng-template rdxDialogPortal>
                <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxDialogBackdrop></div>

                <div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-[12vh]">
                    <div [class]="popup" rdxDialogPopup aria-label="Command palette">
                        <div [(open)]="open" autoHighlight="always" rdxAutocompleteRoot>
                            <input
                                #cmdInput
                                [class]="input"
                                rdxAutocompleteInput
                                placeholder="Search for apps and commands…"
                                aria-label="Command"
                            />

                            <div [class]="list" rdxAutocompleteList aria-label="Commands">
                                @for (group of groups; track group.value) {
                                    <div class="mb-1" rdxAutocompleteGroup>
                                        <div [class]="groupLabel" rdxAutocompleteGroupLabel>{{ group.value }}</div>
                                        @for (item of group.items; track item.value) {
                                            <div
                                                [class]="itemClass"
                                                [value]="item"
                                                [textValue]="item.label"
                                                rdxAutocompleteItem
                                            >
                                                <span class="truncate">{{ item.label }}</span>
                                                <span [class]="badge">
                                                    {{ group.value === 'Suggestions' ? 'Application' : 'Command' }}
                                                </span>
                                            </div>
                                        }
                                    </div>
                                }
                                <div [class]="empty" rdxAutocompleteEmpty>No results found.</div>
                            </div>

                            <div [class]="footer">
                                <span class="flex items-center gap-1">
                                    Activate
                                    <kbd [class]="kbd">Enter</kbd>
                                </span>
                                <span class="flex items-center gap-1">
                                    Actions
                                    <kbd [class]="kbd">Cmd</kbd>
                                    <kbd [class]="kbd">K</kbd>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class AutocompleteCommandPalette {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;

    protected readonly popup = cn(
        demoCard,
        'relative flex w-[92vw] max-w-lg flex-col overflow-hidden p-0 focus:outline-none'
    );
    protected readonly input = cn(
        'border-border bg-background text-foreground placeholder:text-muted-foreground h-12 w-full shrink-0 border-b px-4 text-sm outline-none'
    );
    protected readonly list = 'max-h-80 overflow-y-auto p-2';
    protected readonly groupLabel = 'text-muted-foreground px-2 py-1.5 text-xs font-medium';
    protected readonly itemClass = cn(
        'grid cursor-default select-none grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none',
        'data-[highlighted]:bg-muted'
    );
    protected readonly badge = 'text-muted-foreground shrink-0 text-xs';
    protected readonly empty = 'text-muted-foreground px-2 py-8 text-center text-sm';
    protected readonly footer =
        'text-muted-foreground border-border flex shrink-0 items-center justify-between border-t px-4 py-2.5 text-xs';
    protected readonly kbd =
        'border-border bg-muted inline-flex h-5 min-w-5 items-center justify-center rounded border px-1 font-mono text-[10px]';

    readonly open = signal(false);

    readonly groups: Group[] = [
        {
            value: 'Suggestions',
            items: [
                { value: 'linear', label: 'Linear' },
                { value: 'figma', label: 'Figma' },
                { value: 'slack', label: 'Slack' },
                { value: 'youtube', label: 'YouTube' },
                { value: 'raycast', label: 'Raycast' },
                { value: 'notion', label: 'Notion' },
                { value: 'github', label: 'GitHub' },
                { value: 'jira', label: 'Jira' },
                { value: 'calendar', label: 'Google Calendar' },
                { value: 'chrome', label: 'Google Chrome' },
                { value: 'mail', label: 'Apple Mail' },
                { value: 'terminal', label: 'Terminal' }
            ]
        },
        {
            value: 'Commands',
            items: [
                { value: 'clipboard-history', label: 'Clipboard History' },
                { value: 'import-extension', label: 'Import Extension' },
                { value: 'create-snippet', label: 'Create Snippet' },
                { value: 'system-preferences', label: 'System Preferences' },
                { value: 'window-management', label: 'Window Management' },
                { value: 'toggle-dark-mode', label: 'Toggle Dark Mode' },
                { value: 'new-window', label: 'New Window' },
                { value: 'new-tab', label: 'New Tab' },
                { value: 'search-docs', label: 'Search Documentation' },
                { value: 'capture-screen', label: 'Capture Screenshot' },
                { value: 'close-sidebar', label: 'Toggle Sidebar' },
                { value: 'toggle-terminal', label: 'Toggle Integrated Terminal' },
                { value: 'run-script', label: 'Run Script' }
            ]
        }
    ];
}
```

### Grid

An emoji picker: enable `grid` and wrap each row in `rdxAutocompleteRow` for two-dimensional arrow
navigation. The search input lives **inside** the popup (opened by the trigger) and auto-focuses on
open; pressing an item inserts it into the message field, and `onValueChange` is ignored when
`reason === 'item-press'` so the search box is not overwritten.

```typescript
import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChild } from '@angular/core';
import { cn, demoCombobox, demoFocusRing } from '../../storybook/styles';
import { _importsAutocomplete } from '../index';

interface Emoji {
    emoji: string;
    name: string;
}

interface EmojiGroup {
    label: string;
    rows: Emoji[][];
}

const COLUMNS = 5;

function chunk<T>(items: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < items.length; i += size) {
        result.push(items.slice(i, i + size));
    }
    return result;
}

/**
 * Grid layout (an emoji picker). `grid` enables two-dimensional arrow navigation — Up/Down by row
 * (keeping the column), Left/Right within a row. The search `Input` lives **inside** the `Popup`
 * (opened by the `Trigger`) and auto-focuses on open. Pressing an emoji inserts it into the message
 * field; `onValueChange` is ignored when `reason === 'item-press'` so the search box is not overwritten.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'autocomplete-grid',
    imports: [_importsAutocomplete],
    template: `
        <div class="relative flex w-64">
            <input
                class="border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring relative -mr-px h-9 flex-1 rounded-l-md border px-2 text-sm outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset"
                #message
                placeholder="Message…"
                aria-label="Message"
            />

            <div
                [(open)]="open"
                [value]="search()"
                (onValueChange)="onSearch($event)"
                (onOpenChangeComplete)="onOpenComplete($event)"
                grid
                rdxAutocompleteRoot
            >
                <button [class]="trigger" rdxAutocompleteTrigger rdxAutocompleteAnchor aria-label="Choose emoji">
                    😀
                </button>

                <div *rdxAutocompletePortal [class]="c.positioner" rdxAutocompletePositioner align="end">
                    <div [class]="popup" rdxAutocompletePopup>
                        <input
                            [class]="input"
                            rdxAutocompleteInput
                            placeholder="Search emojis…"
                            aria-label="Search emojis"
                        />
                        <div class="max-h-64 overflow-auto p-1">
                            @for (group of groups; track group.label) {
                                <div rdxAutocompleteGroup>
                                    <div [class]="c.groupLabel" rdxAutocompleteGroupLabel>
                                        {{ group.label }}
                                    </div>
                                    @for (row of group.rows; track $index) {
                                        <div class="grid grid-cols-5" rdxAutocompleteRow>
                                            @for (item of row; track item.emoji) {
                                                <div [class]="cell" [textValue]="item.name" rdxAutocompleteItem>
                                                    {{ item.emoji }}
                                                </div>
                                            }
                                        </div>
                                    }
                                </div>
                            }
                        </div>
                        <div [class]="c.empty" rdxAutocompleteEmpty>No emoji found.</div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class AutocompleteGrid {
    protected readonly c = demoCombobox;
    protected readonly trigger = cn(
        'border-border bg-background text-foreground relative inline-flex size-9 items-center justify-center rounded-r-md border text-lg',
        'hover:bg-muted data-[popup-open]:bg-muted',
        // The trigger is the focusable control here (`tabindex="0"`), so it carries the focus ring
        // itself; `z-10` lifts it above the adjoining message input so the ring isn't clipped.
        'focus-visible:z-10',
        demoFocusRing
    );
    protected readonly popup = cn(
        'border-border bg-popover text-popover-foreground z-50 mt-2 w-64 rounded-md border shadow-md',
        'data-[closed]:hidden'
    );
    protected readonly input = cn(
        'border-border bg-background text-foreground placeholder:text-muted-foreground h-9 w-full rounded-t-md border-b px-2 text-sm',
        // Inset ring (no offset) so the search field's focus stays crisp against the popup's top edge.
        'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset'
    );
    protected readonly cell = cn(
        'flex h-10 cursor-default items-center justify-center rounded-sm text-xl outline-none',
        'data-[highlighted]:bg-muted data-[disabled]:opacity-50'
    );

    protected readonly message = viewChild<ElementRef<HTMLInputElement>>('message');

    readonly search = signal('');
    readonly open = signal(false);

    readonly groups: EmojiGroup[] = [
        {
            label: 'Smileys & Emotion',
            rows: chunk(
                [
                    { emoji: '😀', name: 'grinning face' },
                    { emoji: '😃', name: 'grinning face with big eyes' },
                    { emoji: '😄', name: 'grinning face with smiling eyes' },
                    { emoji: '😁', name: 'beaming face with smiling eyes' },
                    { emoji: '😆', name: 'grinning squinting face' },
                    { emoji: '😅', name: 'grinning face with sweat' },
                    { emoji: '🤣', name: 'rolling on the floor laughing' },
                    { emoji: '😂', name: 'face with tears of joy' },
                    { emoji: '🙂', name: 'slightly smiling face' },
                    { emoji: '🙃', name: 'upside-down face' },
                    { emoji: '😉', name: 'winking face' },
                    { emoji: '😊', name: 'smiling face with smiling eyes' },
                    { emoji: '😇', name: 'smiling face with halo' },
                    { emoji: '🥰', name: 'smiling face with hearts' },
                    { emoji: '😍', name: 'smiling face with heart-eyes' },
                    { emoji: '🤩', name: 'star-struck' },
                    { emoji: '😘', name: 'face blowing a kiss' },
                    { emoji: '😗', name: 'kissing face' },
                    { emoji: '☺️', name: 'smiling face' },
                    { emoji: '😚', name: 'kissing face with closed eyes' },
                    { emoji: '😙', name: 'kissing face with smiling eyes' },
                    { emoji: '🥲', name: 'smiling face with tear' },
                    { emoji: '😋', name: 'face savoring food' },
                    { emoji: '😛', name: 'face with tongue' },
                    { emoji: '😜', name: 'winking face with tongue' },
                    { emoji: '🤪', name: 'zany face' },
                    { emoji: '😝', name: 'squinting face with tongue' },
                    { emoji: '🤑', name: 'money-mouth face' },
                    { emoji: '🤗', name: 'hugging face' },
                    { emoji: '🤭', name: 'face with hand over mouth' }
                ],
                COLUMNS
            )
        },
        {
            label: 'Animals & Nature',
            rows: chunk(
                [
                    { emoji: '🐶', name: 'dog face' },
                    { emoji: '🐱', name: 'cat face' },
                    { emoji: '🐭', name: 'mouse face' },
                    { emoji: '🐹', name: 'hamster' },
                    { emoji: '🐰', name: 'rabbit face' },
                    { emoji: '🦊', name: 'fox' },
                    { emoji: '🐻', name: 'bear' },
                    { emoji: '🐼', name: 'panda' },
                    { emoji: '🐨', name: 'koala' },
                    { emoji: '🐯', name: 'tiger face' },
                    { emoji: '🦁', name: 'lion' },
                    { emoji: '🐮', name: 'cow face' },
                    { emoji: '🐷', name: 'pig face' },
                    { emoji: '🐽', name: 'pig nose' },
                    { emoji: '🐸', name: 'frog' },
                    { emoji: '🐵', name: 'monkey face' },
                    { emoji: '🙈', name: 'see-no-evil monkey' },
                    { emoji: '🙉', name: 'hear-no-evil monkey' },
                    { emoji: '🙊', name: 'speak-no-evil monkey' },
                    { emoji: '🐒', name: 'monkey' },
                    { emoji: '🐔', name: 'chicken' },
                    { emoji: '🐧', name: 'penguin' },
                    { emoji: '🐦', name: 'bird' },
                    { emoji: '🐤', name: 'baby chick' },
                    { emoji: '🐣', name: 'hatching chick' },
                    { emoji: '🐥', name: 'front-facing baby chick' },
                    { emoji: '🦆', name: 'duck' },
                    { emoji: '🦅', name: 'eagle' },
                    { emoji: '🦉', name: 'owl' },
                    { emoji: '🦇', name: 'bat' }
                ],
                COLUMNS
            )
        },
        {
            label: 'Food & Drink',
            rows: chunk(
                [
                    { emoji: '🍎', name: 'red apple' },
                    { emoji: '🍏', name: 'green apple' },
                    { emoji: '🍊', name: 'tangerine' },
                    { emoji: '🍋', name: 'lemon' },
                    { emoji: '🍌', name: 'banana' },
                    { emoji: '🍉', name: 'watermelon' },
                    { emoji: '🍇', name: 'grapes' },
                    { emoji: '🍓', name: 'strawberry' },
                    { emoji: '🫐', name: 'blueberries' },
                    { emoji: '🍈', name: 'melon' },
                    { emoji: '🍒', name: 'cherries' },
                    { emoji: '🍑', name: 'peach' },
                    { emoji: '🥭', name: 'mango' },
                    { emoji: '🍍', name: 'pineapple' },
                    { emoji: '🥥', name: 'coconut' },
                    { emoji: '🥝', name: 'kiwi fruit' },
                    { emoji: '🍅', name: 'tomato' },
                    { emoji: '🍆', name: 'eggplant' },
                    { emoji: '🥑', name: 'avocado' },
                    { emoji: '🥦', name: 'broccoli' },
                    { emoji: '🥬', name: 'leafy greens' },
                    { emoji: '🥒', name: 'cucumber' },
                    { emoji: '🌶️', name: 'hot pepper' },
                    { emoji: '🫑', name: 'bell pepper' },
                    { emoji: '🌽', name: 'ear of corn' },
                    { emoji: '🥕', name: 'carrot' },
                    { emoji: '🫒', name: 'olive' },
                    { emoji: '🧄', name: 'garlic' },
                    { emoji: '🧅', name: 'onion' },
                    { emoji: '🥔', name: 'potato' }
                ],
                COLUMNS
            )
        }
    ];

    private readonly emojiByName = new Map(
        this.groups.flatMap((group) => group.rows.flat()).map((item) => [item.name, item.emoji])
    );

    /** On selection (`item-press`) insert the emoji; otherwise update the search query. */
    onSearch(details: { value: string; reason: string }): void {
        if (details.reason === 'item-press') {
            const emoji = this.emojiByName.get(details.value);
            if (emoji) {
                this.insert(emoji);
            }
            return;
        }
        this.search.set(details.value);
    }

    private insert(emoji: string): void {
        const input = this.message()?.nativeElement;
        if (!input) {
            return;
        }
        const start = input.selectionStart ?? input.value.length;
        const end = input.selectionEnd ?? input.value.length;
        input.value = input.value.slice(0, start) + emoji + input.value.slice(end);
        const caret = start + emoji.length;
        input.setSelectionRange(caret, caret);
        // Focus the message field synchronously inside the `onValueChange` callback. The autocomplete
        // detects that the consumer moved focus and skips its own restoration, so this just works.
        input.focus();
        this.open.set(false);
    }

    /** Reset the search query once the popup has fully closed. */
    onOpenComplete(open: boolean): void {
        if (!open) {
            this.search.set('');
        }
    }
}
```

### Controlled open state

When the app owns `open`, listen to `(onOpenChange)` instead of treating it like a plain boolean
output. Popup primitives emit a change object with `reason`, `event`, and cancellable
`eventDetails`.

```ts
protected readonly open = signal(false);

protected onOpenChange(change: { open: boolean; eventDetails: { cancel(): void } }) {
  if (!change.open && this.shouldStayOpenWhileLoading) {
    change.eventDetails.cancel();
    return;
  }

  this.open.set(change.open);
}
```

### Virtualized

`virtualized` + `[items]` drives index-based navigation over a large data source while a virtualizer
renders only the visible window.

```typescript
import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChild } from '@angular/core';
import { injectVirtualizer } from '@tanstack/angular-virtual';
import { cn, demoCombobox } from '../../storybook/styles';
import { _importsAutocomplete, AutocompleteItemHighlightedDetails, RdxAutocompleteRoot } from '../index';

/**
 * Externally virtualized list of 10,000 items. The autocomplete owns filtering and index navigation
 * (`virtualized` + `[items]`); `@tanstack/angular-virtual` renders only the visible window. On each
 * keyboard/programmatic highlight change the demo scrolls the target index into view so the
 * highlighted row mounts before `aria-activedescendant` references it.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'autocomplete-virtualized-example',
    imports: [_importsAutocomplete],
    template: `
        <div
            #ac="rdxAutocompleteRoot"
            [(value)]="value"
            [items]="items"
            (onItemHighlighted)="onHighlight($event)"
            virtualized
            rdxAutocompleteRoot
        >
            <div [class]="c.control" rdxAutocompleteInputGroup>
                <input [class]="c.input" rdxAutocompleteInput placeholder="Search 10,000 items…" aria-label="Item" />
            </div>

            <div *rdxAutocompletePortal [class]="c.positioner" rdxAutocompletePositioner>
                <div [class]="popup" rdxAutocompletePopup>
                    <div [class]="c.empty" rdxAutocompleteEmpty>No items found.</div>
                    <div [class]="c.list" rdxAutocompleteList aria-label="Items">
                        <div #scroll [class]="scroller">
                            <div [class]="spacer" [style.height.px]="virtualizer.getTotalSize()">
                                @for (row of virtualizer.getVirtualItems(); track row.key) {
                                    <div
                                        [class]="item"
                                        [value]="ac.filteredItems()[row.index]"
                                        [index]="row.index"
                                        [style.height.px]="row.size"
                                        [style.transform]="'translateY(' + row.start + 'px)'"
                                        rdxAutocompleteItem
                                    >
                                        {{ ac.filteredItems()[row.index] }}
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
export class AutocompleteVirtualizedExample {
    protected readonly c = demoCombobox;
    protected readonly popup = cn(
        'z-50 mt-2 rounded-md border border-border bg-popover text-popover-foreground shadow-md',
        'data-[closed]:hidden'
    );
    protected readonly scroller = 'max-h-60 overflow-auto overscroll-contain p-1';
    protected readonly spacer = 'relative w-full';
    protected readonly item = cn(
        'absolute left-0 top-0 flex w-full cursor-default select-none items-center rounded-sm px-2 text-sm outline-none',
        'data-[highlighted]:bg-muted data-[selected]:font-medium'
    );

    readonly value = signal('');

    /** 10,000 string items — labels double as filter text, so no `itemToStringValue` is needed here. */
    protected readonly items = Array.from(
        { length: 10000 },
        (_, index) => `Item ${String(index + 1).padStart(5, '0')}`
    );

    private readonly scrollEl = viewChild<ElementRef<HTMLDivElement>>('scroll');
    private readonly root = viewChild(RdxAutocompleteRoot);

    protected readonly virtualizer = injectVirtualizer(() => ({
        count: this.root()?.filteredItems().length ?? 0,
        estimateSize: () => 36,
        overscan: 12,
        getItemKey: (index: number) => index,
        scrollElement: this.scrollEl()
    }));

    onHighlight(details: AutocompleteItemHighlightedDetails): void {
        if (details.index < 0 || details.reason === 'pointer') {
            return;
        }
        queueMicrotask(() => this.virtualizer.scrollToIndex(details.index, { align: 'auto' }));
    }
}
```

### Reactive forms

The form value is the input string. Bind `[formControl]` to the root.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { demoCombobox } from '../../storybook/styles';
import { _importsAutocomplete } from '../index';

/**
 * Reactive forms: the form value **is** the input string (typed or selected). Bind `[formControl]`
 * directly to the root.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'autocomplete-reactive-forms',
    imports: [_importsAutocomplete, ReactiveFormsModule],
    template: `
        <div class="flex flex-col gap-3">
            <div [formControl]="fruit" rdxAutocompleteRoot>
                <div [class]="c.control" rdxAutocompleteInputGroup>
                    <input [class]="c.input" rdxAutocompleteInput placeholder="Search a fruit…" aria-label="Fruit" />
                </div>

                <div *rdxAutocompletePortal [class]="c.positioner" rdxAutocompletePositioner>
                    <div [class]="c.popup" rdxAutocompletePopup>
                        <div [class]="c.list" rdxAutocompleteList aria-label="Fruits">
                            @for (item of fruits; track item) {
                                <div [class]="c.item" rdxAutocompleteItem>{{ item }}</div>
                            }
                        </div>
                        <div [class]="c.empty" rdxAutocompleteEmpty>No fruit found.</div>
                    </div>
                </div>
            </div>

            <p class="text-muted-foreground text-sm">Value: {{ fruit.value || '—' }}</p>
        </div>
    `
})
export class AutocompleteReactiveForms {
    protected readonly c = demoCombobox;
    readonly fruit = new FormControl('Banana');
    readonly fruits = ['Apple', 'Banana', 'Blueberry', 'Grape', 'Orange'];
}
```

### Template-driven forms

`[(ngModel)]` binds the input string two-way.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { demoCombobox } from '../../storybook/styles';
import { _importsAutocomplete } from '../index';

/**
 * Template-driven forms: `[(ngModel)]` binds the input string two-way.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'autocomplete-template-forms',
    imports: [_importsAutocomplete, FormsModule],
    template: `
        <div class="flex flex-col gap-3">
            <div [(ngModel)]="value" rdxAutocompleteRoot>
                <div [class]="c.control" rdxAutocompleteInputGroup>
                    <input [class]="c.input" rdxAutocompleteInput placeholder="Search a fruit…" aria-label="Fruit" />
                </div>

                <div *rdxAutocompletePortal [class]="c.positioner" rdxAutocompletePositioner>
                    <div [class]="c.popup" rdxAutocompletePopup>
                        <div [class]="c.list" rdxAutocompleteList aria-label="Fruits">
                            @for (item of fruits; track item) {
                                <div [class]="c.item" rdxAutocompleteItem>{{ item }}</div>
                            }
                        </div>
                        <div [class]="c.empty" rdxAutocompleteEmpty>No fruit found.</div>
                    </div>
                </div>
            </div>

            <p class="text-muted-foreground text-sm">Value: {{ value() || '—' }}</p>
        </div>
    `
})
export class AutocompleteTemplateForms {
    protected readonly c = demoCombobox;
    readonly value = signal('');
    readonly fruits = ['Apple', 'Banana', 'Blueberry', 'Grape', 'Orange'];
}
```

### Disabled

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { demoCombobox } from '../../storybook/styles';
import { _importsAutocomplete } from '../index';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'autocomplete-disabled',
    imports: [_importsAutocomplete],
    template: `
        <div [(value)]="value" disabled rdxAutocompleteRoot>
            <div [class]="c.control" rdxAutocompleteInputGroup>
                <input [class]="c.input" rdxAutocompleteInput placeholder="Disabled" aria-label="Fruit" />
            </div>

            <div *rdxAutocompletePortal [class]="c.positioner" rdxAutocompletePositioner>
                <div [class]="c.popup" rdxAutocompletePopup>
                    <div [class]="c.list" rdxAutocompleteList aria-label="Fruits">
                        @for (fruit of fruits; track fruit) {
                            <div [class]="c.item" rdxAutocompleteItem>{{ fruit }}</div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
export class AutocompleteDisabled {
    protected readonly c = demoCombobox;
    readonly value = signal('Apple');
    readonly fruits = ['Apple', 'Banana', 'Grape'];
}
```

## Accessibility

Implements the WAI-ARIA [combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) pattern. DOM
focus stays on the input; the active option is referenced with `aria-activedescendant`.

### Keyboard interactions

| Key                  | Behavior                                                                              |
| -------------------- | ------------------------------------------------------------------------------------- |
| `ArrowDown`          | Open the popup (highlighting the first item), or move the highlight to the next item. |
| `ArrowUp`            | Open the popup (highlighting the last item), or move the highlight to the previous item. |
| `ArrowLeft` / `ArrowRight` | In `grid` mode, move within / across cells. Otherwise move the text caret.       |
| `Enter`              | Select the highlighted item, or close the popup and submit the form.                  |
| `Escape`            | Close the popup.                                                                       |
| `Tab`                | Close the popup and move focus to the next element.                                   |

## API Reference

### RdxAutocompleteRoot

The root. Owns the value (the input string), open state, filtering, inline completion, and navigation.

### RdxAutocompleteInput

The text input. Holds focus; in `both` / `inline` modes it shows the inline completion.

### RdxAutocompleteItem

A selectable suggestion. `value` is optional and defaults to the option's text.

### RdxAutocompletePositioner

Positions the popup against the input anchor via the popper engine.

### RdxAutocompleteValue

Renders the current value as text (with a `placeholder` when empty).

Other parts (`Portal` (structural), `Backdrop`, `Popup`, `List`, `Row`, `Group`, `GroupLabel`,
`ItemIndicator`, `Empty`, `Status`, `Trigger`, `Icon`, `Clear`, `Label`, `Anchor`, `InputGroup`) read
everything from context and take no inputs of their own.
