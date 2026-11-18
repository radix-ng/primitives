import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
    RdxAutocompleteEmpty,
    RdxAutocompleteGroup,
    RdxAutocompleteGroupLabel,
    RdxAutocompleteInput,
    RdxAutocompleteItem,
    RdxAutocompleteList,
    RdxAutocompleteRoot
} from '@radix-ng/primitives/autocomplete';
import {
    RdxDialogBackdrop,
    RdxDialogPopup,
    RdxDialogPortal,
    RdxDialogRoot,
    RdxDialogTrigger
} from '@radix-ng/primitives/dialog';

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
    imports: [
        RdxDialogRoot,
        RdxDialogTrigger,
        RdxDialogPortal,
        RdxDialogBackdrop,
        RdxDialogPopup,
        RdxAutocompleteRoot,
        RdxAutocompleteInput,
        RdxAutocompleteList,
        RdxAutocompleteItem,
        RdxAutocompleteGroup,
        RdxAutocompleteGroupLabel,
        RdxAutocompleteEmpty
    ],
    template: `
        <div [(open)]="open" rdxDialogRoot>
            <button class="demo-button demo-button-primary h-9 px-4" rdxDialogTrigger>Open command palette</button>

            <ng-template rdxDialogPortal>
                <div
                    class="bg-foreground/50 data-[open]:animate-dialog-overlay-in data-[closed]:animate-dialog-overlay-out fixed inset-0 z-50"
                    rdxDialogBackdrop
                ></div>

                <div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-[12vh]">
                    <div
                        class="demo-surface relative flex w-[92vw] max-w-lg flex-col overflow-hidden p-0 focus:outline-none"
                        rdxDialogPopup
                        aria-label="Command palette"
                    >
                        <div [(open)]="open" autoHighlight="always" rdxAutocompleteRoot>
                            <input
                                class="border-border bg-background text-foreground placeholder:text-muted-foreground h-12 w-full shrink-0 border-b px-4 text-sm outline-none"
                                #cmdInput
                                rdxAutocompleteInput
                                placeholder="Search for apps and commands…"
                                aria-label="Command"
                            />

                            <div class="max-h-80 overflow-y-auto p-2" rdxAutocompleteList aria-label="Commands">
                                @for (group of groups; track group.value) {
                                    <div class="mb-1" rdxAutocompleteGroup>
                                        <div
                                            class="text-muted-foreground px-2 py-1.5 text-xs font-medium"
                                            rdxAutocompleteGroupLabel
                                        >
                                            {{ group.value }}
                                        </div>
                                        @for (item of group.items; track item.value) {
                                            <div
                                                class="data-[highlighted]:bg-muted grid cursor-default grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none select-none"
                                                [value]="item"
                                                [textValue]="item.label"
                                                rdxAutocompleteItem
                                            >
                                                <span class="truncate">{{ item.label }}</span>
                                                <span class="text-muted-foreground shrink-0 text-xs">
                                                    {{ group.value === 'Suggestions' ? 'Application' : 'Command' }}
                                                </span>
                                            </div>
                                        }
                                    </div>
                                }
                                <div class="text-muted-foreground px-2 py-8 text-center text-sm" rdxAutocompleteEmpty>
                                    No results found.
                                </div>
                            </div>

                            <div
                                class="text-muted-foreground border-border flex shrink-0 items-center justify-between border-t px-4 py-2.5 text-xs"
                            >
                                <span class="flex items-center gap-1">
                                    Activate
                                    <kbd
                                        class="border-border bg-muted inline-flex h-5 min-w-5 items-center justify-center rounded border px-1 font-mono text-[10px]"
                                    >
                                        Enter
                                    </kbd>
                                </span>
                                <span class="flex items-center gap-1">
                                    Actions
                                    <kbd
                                        class="border-border bg-muted inline-flex h-5 min-w-5 items-center justify-center rounded border px-1 font-mono text-[10px]"
                                    >
                                        Cmd
                                    </kbd>
                                    <kbd
                                        class="border-border bg-muted inline-flex h-5 min-w-5 items-center justify-center rounded border px-1 font-mono text-[10px]"
                                    >
                                        K
                                    </kbd>
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
