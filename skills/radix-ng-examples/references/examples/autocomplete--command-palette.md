# Autocomplete — Command palette

> One example from the [Autocomplete](../components/autocomplete.md) docs — imports, anatomy, and the data-attribute styling contract live there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

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
