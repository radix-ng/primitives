# Autocomplete — Default

> One example from the [Autocomplete](../components/autocomplete.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

Type to filter a list of suggestions; pick one to fill the input.

```typescript
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
    selector: 'autocomplete-default',
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
        <div [(value)]="value" rdxAutocompleteRoot>
            <label class="text-foreground flex flex-col items-start gap-1 text-sm font-bold">
                Search tags
                <div class="flex w-64 max-w-full data-disabled:opacity-50" rdxAutocompleteInputGroup>
                    <input class="demo-input h-8 w-full px-2 font-normal" rdxAutocompleteInput placeholder="e.g. fix" />
                </div>
            </label>

            <div
                class="z-50 data-closed:pointer-events-none"
                *rdxAutocompletePortal
                [sideOffset]="4"
                rdxAutocompletePositioner
            >
                <div class="demo-popup w-(--anchor-width) max-w-(--available-width)" rdxAutocompletePopup>
                    <div
                        class="max-h-[min(22.5rem,var(--available-height))] scroll-py-1 overflow-y-auto overscroll-contain py-1 data-empty:p-0"
                        rdxAutocompleteList
                        aria-label="Tags"
                    >
                        @for (tag of tags; track tag) {
                            <div class="demo-option relative flex items-center px-2 py-2 leading-4" rdxAutocompleteItem>
                                {{ tag }}
                            </div>
                        }
                    </div>
                    <div class="text-muted-foreground px-2 text-sm leading-4 data-empty:py-4" rdxAutocompleteEmpty>
                        No tags found.
                    </div>
                </div>
            </div>
        </div>
    `
})
export class AutocompleteDefault {
    readonly value = signal('');
    readonly tags = TAGS;
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `match-sorter`, `@tanstack/angular-virtual` when an example imports them.
