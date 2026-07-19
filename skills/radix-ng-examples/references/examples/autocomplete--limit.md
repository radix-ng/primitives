# Autocomplete — Limit

> One example from the [Autocomplete](../components/autocomplete.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.1` — if the installed version differs, verify the API against the installed package.

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
