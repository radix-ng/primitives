import { Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { LucideAngularModule } from 'lucide-angular';
import { RdxCheckboxIndicatorDirective } from '../src/checkbox-indicator.directive';
import { RdxCheckboxInputDirective } from '../src/checkbox-input.directive';
import { RdxCheckboxDirective } from '../src/checkbox.directive';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'checkbox-indeterminate-example',
    template: `
        <label class="Label" rdxLabel htmlFor="r1">
            <button class="CheckboxRoot" [(indeterminate)]="indeterminate" [(ngModel)]="checked" CheckboxRoot>
                <lucide-angular
                    class="CheckboxIndicator"
                    [name]="iconName()"
                    CheckboxIndicator
                    size="16"
                ></lucide-angular>
                <input class="Input" id="r1" CheckboxInput />
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
    styleUrl: 'checkbox-group.styles.scss',
    standalone: true,
    imports: [
        FormsModule,
        RdxLabelDirective,
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
