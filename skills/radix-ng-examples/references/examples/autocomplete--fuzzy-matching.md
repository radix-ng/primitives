# Autocomplete — Fuzzy matching

> One example from the [Autocomplete](../components/autocomplete.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

A custom `filter` receives the item's text, the query, **and the item value** — so it can rank across
multiple fields. This example uses `match-sorter` over `title` / `description` / `category` and
highlights the matched text.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
    AutocompleteFilter,
    RdxAutocompleteEmpty,
    RdxAutocompleteInput,
    RdxAutocompleteInputGroup,
    RdxAutocompleteItem,
    RdxAutocompleteList,
    RdxAutocompletePopup,
    RdxAutocompletePortal,
    RdxAutocompletePositioner,
    RdxAutocompleteRoot
} from '@radix-ng/primitives/autocomplete';

import { matchSorter, rankings } from 'match-sorter';

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
    imports: [
        RdxAutocompleteRoot,
        RdxAutocompleteInputGroup,
        RdxAutocompleteInput,
        RdxAutocompletePortal,
        RdxAutocompletePositioner,
        RdxAutocompletePopup,
        RdxAutocompleteList,
        RdxAutocompleteItem,
        RdxAutocompleteEmpty
    ],
    template: `
        <div #ac="rdxAutocompleteRoot" [(value)]="value" [filter]="fuzzy" rdxAutocompleteRoot>
            <div
                class="border-border bg-background focus-within:ring-ring focus-within:ring-offset-background relative inline-flex h-9 w-80 items-center rounded-md border focus-within:ring-2 focus-within:ring-offset-2"
                rdxAutocompleteInputGroup
            >
                <input
                    class="demo-combobox-input placeholder:text-muted-foreground h-full w-full pr-9 pl-3"
                    rdxAutocompleteInput
                    placeholder="e.g. React"
                    aria-label="Documentation"
                />
            </div>

            <div class="w-80 data-[closed]:pointer-events-none" *rdxAutocompletePortal rdxAutocompletePositioner>
                <div
                    class="border-border bg-popover text-popover-foreground z-50 mt-2 max-h-72 overflow-y-auto rounded-md border p-1 shadow-md data-[closed]:hidden"
                    rdxAutocompletePopup
                >
                    <div class="demo-combobox-empty data-[empty]:py-6" rdxAutocompleteEmpty>
                        No results found for "{{ ac.value() }}".
                    </div>
                    <div class="flex flex-col" rdxAutocompleteList aria-label="Documentation">
                        @for (item of items; track item.title) {
                            <div
                                class="data-[highlighted]:bg-muted flex cursor-default rounded-sm px-2 py-2 outline-none select-none"
                                [value]="item"
                                [textValue]="item.title"
                                rdxAutocompleteItem
                            >
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
    protected readonly fuzzy = fuzzyFilter;
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

## Setup and shared files

These examples use Angular standalone components and Tailwind CSS v4. Install
`@radix-ng/primitives` and `match-sorter`, `@tanstack/angular-virtual`. Copy the component from **Show code** and any shared files below,
preserving their relative import paths. Import the example component in its parent and use its selector.

Install `tailwindcss`, `@tailwindcss/postcss` and `postcss`. Configure the PostCSS plugin:

```json
{ "plugins": { "@tailwindcss/postcss": {} } }
```

Save the CSS below as `demo-styles.css` next to your global stylesheet. Import Tailwind first,
then the demo styles. Both Storybook and Playground use this same CSS through `main.css`.

```css
@import 'tailwindcss';
@import './demo-styles.css';
```

The shared file supplies theme values, light/dark tokens, common classes and animation keyframes.
Set `data-theme="dark"` on `<html>` for the dark theme; the default is light. The font stacks have
system fallbacks; Inter and JetBrains Mono can be self-hosted for the Storybook typography.

<details>
<summary>demo-styles.css</summary>

[Download demo-styles.css](../demo-styles.css)

</details>
