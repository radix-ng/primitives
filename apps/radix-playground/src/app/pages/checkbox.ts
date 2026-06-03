import { DemoPage } from '../shared/demo-page';
import { demoCheckbox } from '../shared/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideCheck } from '@lucide/angular';
import {
    RdxCheckboxButtonDirective,
    RdxCheckboxIndicatorDirective,
    RdxCheckboxInputDirective,
    RdxCheckboxRootDirective
} from '@radix-ng/primitives/checkbox';
import { RdxLabelDirective } from '@radix-ng/primitives/label';

@Component({
    selector: 'app-checkbox',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        DemoPage,
        RdxCheckboxRootDirective,
        RdxCheckboxButtonDirective,
        RdxCheckboxIndicatorDirective,
        RdxCheckboxInputDirective,
        RdxLabelDirective,
        LucideCheck
    ],
    template: `
        <demo-page
            title="Checkbox"
            description="A control that allows the user to toggle between checked and not checked."
        >
            <div class="flex items-center gap-3">
                <div rdxCheckboxRoot [checked]="true">
                    <button id="checkbox-1" rdxCheckboxButton [class]="c.button">
                        <svg rdxCheckboxIndicator size="16" lucideCheck [class]="c.indicator"></svg>
                    </button>
                    <input rdxCheckboxInput />
                </div>
                <label class="text-foreground flex items-center text-sm font-medium" rdxLabel htmlFor="checkbox-1">
                    Accept terms and conditions.
                </label>
            </div>
        </demo-page>
    `
})
export default class CheckboxPage {
    protected readonly c = demoCheckbox;
}
