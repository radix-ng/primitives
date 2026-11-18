import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
    RdxAutocompleteEmpty,
    RdxAutocompleteGroup,
    RdxAutocompleteGroupLabel,
    RdxAutocompleteInput,
    RdxAutocompleteInputGroup,
    RdxAutocompleteItem,
    RdxAutocompleteList,
    RdxAutocompletePopup,
    RdxAutocompletePortal,
    RdxAutocompletePositioner,
    RdxAutocompleteRoot
} from '@radix-ng/primitives/autocomplete';

interface Group {
    label: string;
    items: string[];
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'autocomplete-grouped',
    imports: [
        RdxAutocompleteRoot,
        RdxAutocompleteInputGroup,
        RdxAutocompleteInput,
        RdxAutocompletePortal,
        RdxAutocompletePositioner,
        RdxAutocompletePopup,
        RdxAutocompleteList,
        RdxAutocompleteItem,
        RdxAutocompleteGroup,
        RdxAutocompleteGroupLabel,
        RdxAutocompleteEmpty
    ],
    template: `
        <div [(value)]="value" rdxAutocompleteRoot>
            <div
                class="demo-combobox-control focus-within:ring-ring focus-within:ring-offset-background relative inline-flex h-9 w-64 items-center focus-within:ring-2 focus-within:ring-offset-2 data-[disabled]:opacity-50"
                rdxAutocompleteInputGroup
            >
                <input
                    class="demo-combobox-input placeholder:text-muted-foreground h-full w-full pr-9 pl-3"
                    rdxAutocompleteInput
                    placeholder="e.g. fix"
                    aria-label="Search tags"
                />
            </div>

            <div class="z-50 w-64 data-[closed]:pointer-events-none" *rdxAutocompletePortal rdxAutocompletePositioner>
                <div
                    class="demo-combobox-popup mt-2 max-h-60 overflow-y-auto p-1 data-[closed]:hidden"
                    rdxAutocompletePopup
                >
                    <div class="flex flex-col" rdxAutocompleteList aria-label="Tags">
                        @for (group of groups; track group.label) {
                            <div rdxAutocompleteGroup>
                                <div class="demo-menu-group-label px-2 py-1.5" rdxAutocompleteGroupLabel>
                                    {{ group.label }}
                                </div>
                                @for (item of group.items; track item) {
                                    <div
                                        class="demo-menu-item data-[highlighted]:bg-muted relative flex items-center py-1.5 pr-2 pl-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[selected]:font-medium"
                                        rdxAutocompleteItem
                                    >
                                        {{ item }}
                                    </div>
                                }
                            </div>
                        }
                    </div>
                    <div class="demo-combobox-empty data-[empty]:py-6" rdxAutocompleteEmpty>No tags found.</div>
                </div>
            </div>
        </div>
    `
})
export class AutocompleteGrouped {
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
