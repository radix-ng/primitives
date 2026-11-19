# Combobox — Async with multiple selection

> One example from the [Combobox](../components/combobox.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

External filtering combined with `multiple` — nothing loads until the user types, picks become
chips, and already-selected people stay available as new results stream in.

```typescript
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { LucideCheck, LucideX } from '@lucide/angular';
import {
    type ComboboxValue,
    RdxComboboxAnchor,
    RdxComboboxChip,
    RdxComboboxChipRemove,
    RdxComboboxChips,
    RdxComboboxEmpty,
    RdxComboboxInput,
    RdxComboboxItem,
    RdxComboboxItemIndicator,
    RdxComboboxList,
    RdxComboboxPopup,
    RdxComboboxPortal,
    RdxComboboxPositioner,
    RdxComboboxRoot,
    RdxComboboxStatus
} from '@radix-ng/primitives/combobox';

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
    imports: [
        RdxComboboxRoot,
        RdxComboboxAnchor,
        RdxComboboxInput,
        RdxComboboxPortal,
        RdxComboboxPositioner,
        RdxComboboxPopup,
        RdxComboboxList,
        RdxComboboxItem,
        RdxComboboxItemIndicator,
        RdxComboboxEmpty,
        RdxComboboxStatus,
        RdxComboboxChips,
        RdxComboboxChip,
        RdxComboboxChipRemove,
        LucideCheck,
        LucideX
    ],
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
                <div
                    class="demo-combobox-control focus-within:ring-ring focus-within:ring-offset-background relative inline-flex h-9 h-auto min-h-9 w-64 flex-wrap items-center gap-1 py-1 pl-1 focus-within:ring-2 focus-within:ring-offset-2 data-[disabled]:opacity-50"
                    rdxComboboxAnchor
                >
                    @if (value().length) {
                        <div class="contents" rdxComboboxChips>
                            @for (user of value(); track user.id) {
                                <span
                                    class="demo-combobox-chip inline-flex items-center gap-1 px-1.5 py-0.5"
                                    [value]="user"
                                    rdxComboboxChip
                                >
                                    {{ user.name }}
                                    <button
                                        class="hover:bg-border inline-flex size-3.5 items-center justify-center rounded-full"
                                        rdxComboboxChipRemove
                                        aria-label="Remove"
                                    >
                                        <svg lucideX size="12"></svg>
                                    </button>
                                </span>
                            }
                        </div>
                    }
                    <input
                        class="demo-combobox-input-inline placeholder:text-muted-foreground min-w-24 flex-1"
                        id="async-reviewers"
                        [placeholder]="value().length ? '' : 'e.g. Michael'"
                        rdxComboboxInput
                    />
                </div>
            </div>

            <div class="z-50 w-64 data-[closed]:pointer-events-none" *rdxComboboxPortal rdxComboboxPositioner>
                <div
                    class="demo-combobox-popup mt-2 max-h-60 overflow-y-auto p-1 data-[closed]:hidden"
                    [attr.aria-busy]="loading() ? 'true' : null"
                    rdxComboboxPopup
                >
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
                        <div class="demo-combobox-empty data-[empty]:py-6" rdxComboboxEmpty>{{ message }}</div>
                    }

                    <div class="flex flex-col" rdxComboboxList aria-label="People">
                        @for (user of items(); track user.id) {
                            <div
                                class="data-[highlighted]:bg-muted relative grid cursor-default grid-cols-[1rem_1fr] items-start gap-2 rounded-sm px-2 py-2 text-sm outline-none select-none"
                                [value]="user"
                                [textValue]="user.name"
                                rdxComboboxItem
                            >
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

    protected readonly labelOf = (user: unknown) =>
        user && typeof user === 'object' && 'name' in user ? String(user.name) : '';

    // A pick writes '' back into the input, re-emitting `onInputValueChange` synchronously. Skip that
    // echo (Base UI's `reason === 'item-press'`) so the current results stay visible for more picks.
    // Disarmed on a microtask so paths without an echo (chip remove / Backspace) don't leak it.
    private suppressEmptyEcho = false;
    private requestToken = 0;
    private handle: ReturnType<typeof setTimeout> | undefined;

    onValueChange(next: ComboboxValue): void {
        this.searchValue.set('');
        this.error.set(null);
        if (!Array.isArray(next) || next.length === 0) {
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

## Setup and shared files

These examples use Angular standalone components and Tailwind CSS v4. Install
`@radix-ng/primitives` and `@lucide/angular`, `@tanstack/angular-virtual`. Copy the component from **Show code** and any shared files below,
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
