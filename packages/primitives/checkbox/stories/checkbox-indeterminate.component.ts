import { Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { RdxLabelRootDirective } from '@radix-ng/primitives/label';
import { LucideAngularModule } from 'lucide-angular';

import { RdxCheckboxIndicatorDirective } from '../src/checkbox-indicator.directive';
import { RdxCheckboxInputDirective } from '../src/checkbox-input.directive';
import { RdxCheckboxDirective } from '../src/checkbox.directive';

@Component({
    selector: 'checkbox-indeterminate-example',
    template: `
        <label LabelRoot class="Label" htmlFor="r1">
            <button
                CheckboxRoot
                class="CheckboxRoot"
                [(indeterminate)]="indeterminate"
                [(ngModel)]="checked"
            >
                <lucide-angular
                    CheckboxIndicator
                    class="CheckboxIndicator"
                    size="16"
                    [name]="iconName()"
                ></lucide-angular>
                <input CheckboxInput id="r1" class="Input" />
            </button>
            I'm a checkbox
        </label>

        <p>
            <button
                data-accent-color="cyan"
                class="rt-reset rt-BaseButton rt-r-size-2 rt-variant-solid rt-Button"
                (click)="toggleIndeterminate()"
            >
                Toggle Indeterminate state
            </button>
        </p>
    `,
    styleUrl: 'checkbox-group.styles.scss',
    standalone: true,
    imports: [
        FormsModule,
        RdxLabelRootDirective,
        RdxCheckboxDirective,
        RdxCheckboxIndicatorDirective,
        LucideAngularModule,
        RdxCheckboxInputDirective
    ]
})
export class CheckboxIndeterminateComponent {
    readonly indeterminate = model(false);
    readonly checked = model(false);

    readonly iconName = model('check');

    toggleIndeterminate() {
        this.indeterminate.set(!this.indeterminate());

        this.iconName() === 'check' ? this.iconName.set('minus') : this.iconName.set('check');
    }
}
