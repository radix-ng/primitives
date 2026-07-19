# Autocomplete — Grouped

> One example from the [Autocomplete](../components/autocomplete.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

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
