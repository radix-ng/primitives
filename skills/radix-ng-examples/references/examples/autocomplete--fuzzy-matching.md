# Autocomplete — Fuzzy matching

> One example from the [Autocomplete](../components/autocomplete.md) docs — imports, anatomy, and the data-attribute styling contract live there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

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
