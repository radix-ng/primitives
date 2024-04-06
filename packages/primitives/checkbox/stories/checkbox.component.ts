import { Component } from '@angular/core';
import { CheckboxDirective } from '../checkbox.directive';
import { CheckboxIndicatorDirective } from '../checkbox-indicator.directive';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideCheck } from '@ng-icons/lucide';
import { LabelDirective } from '../../label/label.directive';

@Component({
    selector: 'kbq-checkbox',
    styles: `
        button {
            all: unset;
        }

        .CheckboxRoot {
            background-color: white;
            width: 25px;
            height: 25px;
            border-radius: 4px;

            box-shadow: 0 2px 10px color(display-p3 0 0 0/0.5);
        }
        .CheckboxRoot:hover {
            background-color: color(display-p3 0.417 0.341 0.784);
        }
        .CheckboxRoot:focus {
            box-shadow: 0 0 0 2px black;
        }
    `,
    template: `
        <label kbqLabel>
            <button class="CheckboxRoot" kbqCheckbox [(checked)]="checked">
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
