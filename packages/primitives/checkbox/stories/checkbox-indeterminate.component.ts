import { Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { LucideAngularModule } from 'lucide-angular';
import { RdxCheckboxIndicatorDirective } from '../src/checkbox-indicator.directive';
import { RdxCheckboxInputDirective } from '../src/checkbox-input.directive';
import { RdxCheckboxDirective } from '../src/checkbox.directive';

@Component({
    selector: 'checkbox-indeterminate-example',
    imports: [
        FormsModule,
        RdxLabelDirective,
        RdxCheckboxDirective,
        RdxCheckboxIndicatorDirective,
        LucideAngularModule,
        RdxCheckboxInputDirective
    ],
    template: `
        <label class="Label" rdxLabel htmlFor="r1">
            <button class="CheckboxRoot" [(indeterminate)]="indeterminate" [(ngModel)]="checked" rdxCheckboxRoot>
                <lucide-angular class="CheckboxIndicator" [name]="iconName()" rdxCheckboxIndicator size="16" />
                <input class="Input" id="r1" rdxCheckboxInput />
            </button>
            I'm a checkbox
        </label>

        <p>
            <button
                class="rt-reset rt-BaseButton rt-r-size-2 rt-variant-solid rt-Button"
                (click)="toggleIndeterminate()"
                data-accent-color="cyan"
            >
                Toggle Indeterminate state
            </button>
        </p>
    `,
    styleUrl: 'checkbox-group.styles.scss'
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
