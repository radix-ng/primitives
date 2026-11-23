import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
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

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'autocomplete-limit',
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
        <div #ac="rdxAutocompleteRoot" [(value)]="value" [limit]="8" rdxAutocompleteRoot>
            <div
                class="demo-combobox-control focus-within:ring-ring focus-within:ring-offset-background relative inline-flex h-9 w-64 items-center focus-within:ring-2 focus-within:ring-offset-2 data-[disabled]:opacity-50"
                rdxAutocompleteInputGroup
            >
                <input
                    class="demo-combobox-input placeholder:text-muted-foreground h-full w-full pr-9 pl-3"
                    rdxAutocompleteInput
                    placeholder="e.g. component"
                    aria-label="Search tags"
                />
            </div>

            <div class="z-50 w-64 data-[closed]:pointer-events-none" *rdxAutocompletePortal rdxAutocompletePositioner>
                <div
                    class="demo-combobox-popup mt-2 max-h-60 overflow-y-auto p-1 data-[closed]:hidden"
                    rdxAutocompletePopup
                >
                    <div class="flex flex-col" rdxAutocompleteList aria-label="Tags">
                        @for (tag of tags; track tag) {
                            <div
                                class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex items-center py-1.5 pr-2 pl-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[selected]:font-medium"
                                rdxAutocompleteItem
                            >
                                {{ tag }}
                            </div>
                        }
                    </div>
                    <div class="demo-combobox-empty data-[empty]:py-6" rdxAutocompleteEmpty>No tags found.</div>
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
