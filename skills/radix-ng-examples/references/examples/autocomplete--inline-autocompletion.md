# Autocomplete — Inline autocompletion

> One example from the [Autocomplete](../components/autocomplete.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

With `mode="both"` (filter + inline), keyboard highlighting displays the item's full label. The committed
`value` stays unchanged until an edit or selection, and filtering uses its trimmed text. `mode="inline"`
keeps the list unfiltered. Inline modes use the same `autoHighlight` default (`false`) as other modes.

The preview preserves native caret behavior; it does not select a completed suffix. Pointer highlighting
leaves an existing preview in place. `rdxAutocompleteValue.slotText()` reflects the displayed text,
including a temporary preview. Closing the popup, changing the value or disabling completion clears it.

With `autoHighlight`, an uncontrolled input can preview the first result during typing. A controlled
`[(value)]` input keeps the accepted edit visible; subsequent keyboard navigation displays the highlighted
label. External value changes preserve the supplied text, including surrounding spaces.

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
