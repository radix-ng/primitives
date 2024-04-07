import { Component } from '@angular/core';
import { CheckboxDirective } from '../checkbox.directive';
import { CheckboxIndicatorDirective } from '../checkbox-indicator.directive';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideCheck } from '@ng-icons/lucide';
import { LabelDirective } from '../../label/label.directive';
import classNames from 'classnames';
import { NgIf } from '@angular/common';

@Component({
    selector: 'kbq-checkbox',
    styleUrls: ['style.css'],
    template: `
        <div class="radix-themes light-theme">
            <label kbqLabel>
                <button
                    class="{{ getClassnames() }}"
                    data-accent-color
                    kbqCheckbox
                    [(checked)]="checked"
                >
                    <ng-icon
                        color="white"
                        kbqCheckboxIndicator
                        class="rt-BaseCheckboxIndicator rt-CheckboxIndicator"
                        name="lucideCheck"
                    ></ng-icon>
                </button>
                <input *ngIf="isFormControl" />
                Check Item
            </label>
        </div>
    `,
    standalone: true,
    imports: [NgIf, LabelDirective, CheckboxDirective, CheckboxIndicatorDirective, NgIconComponent],
    providers: [provideIcons({ lucideCheck })]
})
export class CheckboxComponent {
    checked = false;
    isFormControl = false;

    getClassnames(): string {
        return classNames(
            'rt-reset',
            'rt-BaseCheckboxRoot',
            'rt-CheckboxRoot',
            'rt-r-size-2',
            'rt-variant-classic'
        );
    }
}
