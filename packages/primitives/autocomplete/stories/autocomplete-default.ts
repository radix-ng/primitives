import { Component, signal } from '@angular/core';
import { cn, demoCombobox } from '../../storybook/styles';
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
    selector: 'autocomplete-default',
    imports: [_importsAutocomplete],
    template: `
        <div [(value)]="value" rdxAutocompleteRoot>
            <div [class]="c.control" rdxAutocompleteInputGroup>
                <input
                    [class]="cn(c.input, 'pr-3')"
                    rdxAutocompleteInput
                    placeholder="e.g. fix"
                    aria-label="Search tags"
                />
            </div>

            <div rdxAutocompletePortal>
                <ng-template rdxAutocompletePortalPresence>
                    <div [class]="c.positioner" rdxAutocompletePositioner>
                        <div [class]="c.popup" rdxAutocompletePopup>
                            <div [class]="c.list" rdxAutocompleteList aria-label="Tags">
                                @for (tag of tags; track tag) {
                                    <div [class]="c.item" rdxAutocompleteItem>{{ tag }}</div>
                                }
                            </div>
                            <div [class]="c.empty" rdxAutocompleteEmpty>No tags found.</div>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class AutocompleteDefault {
    protected readonly c = demoCombobox;
    protected readonly cn = cn;
    readonly value = signal('');
    readonly tags = TAGS;
}
