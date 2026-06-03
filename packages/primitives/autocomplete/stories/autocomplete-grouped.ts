import { demoCombobox } from '../../storybook/styles';
import { _importsAutocomplete } from '../index';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

interface Group {
    label: string;
    items: string[];
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'autocomplete-grouped',
    imports: [_importsAutocomplete],
    template: `
        <div rdxAutocompleteRoot [(value)]="value">
            <div rdxAutocompleteInputGroup [class]="c.control">
                <input rdxAutocompleteInput placeholder="e.g. fix" aria-label="Search tags" [class]="c.input" />
            </div>

            <div *rdxAutocompletePortal rdxAutocompletePositioner [class]="c.positioner">
                <div rdxAutocompletePopup [class]="c.popup">
                    <div rdxAutocompleteList aria-label="Tags" [class]="c.list">
                        @for (group of groups; track group.label) {
                            <div rdxAutocompleteGroup>
                                <div rdxAutocompleteGroupLabel [class]="c.groupLabel">{{ group.label }}</div>
                                @for (item of group.items; track item) {
                                    <div rdxAutocompleteItem [class]="c.item">{{ item }}</div>
                                }
                            </div>
                        }
                    </div>
                    <div rdxAutocompleteEmpty [class]="c.empty">No tags found.</div>
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
