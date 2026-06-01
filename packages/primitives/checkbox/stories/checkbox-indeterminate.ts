import { JsonPipe } from '@angular/common';
import { Component, model, signal } from '@angular/core';
import { CheckedState, RdxCheckboxButtonDirective } from '@radix-ng/primitives/checkbox';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { LucideAngularModule } from 'lucide-angular';
import { cn, demoButton, demoCheckbox } from '../../storybook/styles';
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
    template: `
        <div class="flex items-center gap-3">
            <div [checked]="checked()" (onCheckedChange)="checked.set($event)" rdxCheckboxRoot>
                <button id="r1" [class]="c.button" rdxCheckboxButton>
                    <lucide-angular [class]="c.indicator" [name]="iconName()" rdxCheckboxIndicator size="16" />
                </button>
                <input rdxCheckboxInput />
            </div>
            <label class="text-foreground flex items-center text-sm font-medium" rdxLabel htmlFor="r1">
                I'm a checkbox
            </label>
        </div>

        <section class="text-muted-foreground mt-3 text-sm">
            <p>checked state:&nbsp;{{ checked() | json }}</p>
        </section>

        <button [class]="cn(b.base, b.primary, b.size.md, 'mt-3')" (click)="toggleIndeterminate()" type="button">
            Toggle Indeterminate state
        </button>
    `
})
export class CheckboxIndeterminate {
    readonly checked = model<CheckedState>(false);

    readonly iconName = signal('check');

    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly c = demoCheckbox;

    toggleIndeterminate() {
        this.checked() === 'indeterminate' ? this.checked.set(false) : this.checked.set('indeterminate');

        this.iconName() === 'check' ? this.iconName.set('minus') : this.iconName.set('check');
    }
}
