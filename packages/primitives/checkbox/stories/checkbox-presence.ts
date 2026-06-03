import { demoCheckbox } from '../../storybook/styles';
import { RdxCheckboxIndicatorDirective } from '../src/checkbox-indicator';
import { RdxCheckboxInputDirective } from '../src/checkbox-input';
import { RdxCheckboxRootDirective } from '../src/checkbox-root';
import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { LucideCheck as Check, LucideDynamicIcon } from '@lucide/angular';
import { RdxCheckboxButtonDirective } from '@radix-ng/primitives/checkbox';
import { RdxLabelDirective } from '@radix-ng/primitives/label';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'checkbox-keep-mounted-example',
    imports: [
        RdxLabelDirective,
        RdxCheckboxRootDirective,
        RdxCheckboxButtonDirective,
        RdxCheckboxIndicatorDirective,
        RdxCheckboxInputDirective,
        LucideDynamicIcon,
        JsonPipe
    ],
    template: `
        <div class="flex items-center gap-3">
            <div rdxCheckboxRoot [checked]="checked()" (onCheckedChange)="checked.set($event.checked)">
                <button id="r1" rdxCheckboxButton [class]="c.button">
                    <svg keepMounted rdxCheckboxIndicator size="16" [class]="c.indicator" [lucideIcon]="Check" />
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
    `
})
export class CheckboxKeepMountedExample {
    readonly checked = model<boolean>(false);
    protected readonly Check = Check;
    protected readonly c = demoCheckbox;
}
