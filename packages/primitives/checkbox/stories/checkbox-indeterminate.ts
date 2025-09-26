import { JsonPipe } from '@angular/common';
import { Component, model, signal } from '@angular/core';
import { CheckedState, RdxCheckboxButtonDirective } from '@radix-ng/primitives/checkbox';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { LucideAngularModule } from 'lucide-angular';
import { RdxCheckboxIndicatorDirective } from '../src/checkbox-indicator';
import { RdxCheckboxInputDirective } from '../src/checkbox-input';
import { RdxCheckboxRootDirective } from '../src/checkbox-root';

@Component({
    selector: 'checkbox-indeterminate-example',
    imports: [
        RdxLabelDirective,
        RdxCheckboxRootDirective,
        RdxCheckboxButtonDirective,
        RdxCheckboxIndicatorDirective,
        LucideAngularModule,
        RdxCheckboxInputDirective,
        JsonPipe
    ],
    styleUrl: 'checkbox.css',
    template: `
        <div style="display: flex; align-items: center;">
            <div [checked]="checked()" (onCheckedChange)="checked.set($event)" rdxCheckboxRoot>
                <button class="CheckboxButton" id="r1" rdxCheckboxButton>
                    <lucide-angular class="CheckboxIndicator" [name]="iconName()" rdxCheckboxIndicator size="16" />
                </button>
                <input rdxCheckboxInput />
            </div>
            <label class="Label" rdxLabel htmlFor="r1">I'm a checkbox</label>
        </div>

        <section style="color: white">
            <p>checked state:&nbsp;{{ checked() | json }}</p>
        </section>

        <button
            class="rt-reset rt-BaseButton rt-r-size-2 rt-variant-solid rt-Button"
            (click)="toggleIndeterminate()"
            data-accent-color="cyan"
        >
            Toggle Indeterminate state
        </button>
    `
})
export class CheckboxIndeterminate {
    readonly checked = model<CheckedState>(false);

    readonly iconName = signal('check');

    toggleIndeterminate() {
        this.checked() === 'indeterminate' ? this.checked.set(false) : this.checked.set('indeterminate');

        this.iconName() === 'check' ? this.iconName.set('minus') : this.iconName.set('check');
    }
}
