import { Component } from '@angular/core';
import { CheckboxDirective } from '../checkbox.directive';
import { CheckboxIndicatorDirective } from '../checkbox-indicator.directive';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideCheck } from '@ng-icons/lucide';
import { LabelDirective } from '../../label/label.directive';

@Component({
    selector: 'kbq-checkbox',
    template: `
        <label kbqLabel>
            <button kbqCheckbox [(checked)]="checked">
                <input kbqCheckboxIndicator id="uniqId" />
                <ng-icon kbqCheckboxIndicator name="lucideCheck"></ng-icon>
            </button>
            Check Item
        </label>
    `,
    standalone: true,
    imports: [LabelDirective, CheckboxDirective, CheckboxIndicatorDirective, NgIconComponent],
    providers: [provideIcons({ lucideCheck })]
})
export class CheckboxComponent {
    checked = true;
}
