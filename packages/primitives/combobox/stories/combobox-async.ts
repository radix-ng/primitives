import { Component, computed, signal } from '@angular/core';
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
    selector: 'combobox-async',
    imports: [_importsCombobox, LucideChevronDown, LucideCheck, LucideX],
    template: `
        <div
            [(value)]="value"
            [items]="items()"
            [itemToStringLabel]="labelOf"
            [filter]="null"
            (onValueChange)="onValueChange()"
            (onInputValueChange)="search($event)"
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
