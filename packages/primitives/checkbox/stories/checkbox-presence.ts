import { JsonPipe } from '@angular/common';
import { Component, model } from '@angular/core';
import { LucideCheck as Check, LucideDynamicIcon } from '@lucide/angular';
import { CheckedState, RdxCheckboxButtonDirective } from '@radix-ng/primitives/checkbox';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { demoCheckbox } from '../../storybook/styles';
import { RdxCheckboxIndicatorDirective } from '../src/checkbox-indicator';
import { RdxCheckboxIndicatorPresenceDirective } from '../src/checkbox-indicator-presence';
import { RdxCheckboxInputDirective } from '../src/checkbox-input';
import { RdxCheckboxRootDirective } from '../src/checkbox-root';

@Component({
    selector: 'checkbox-presence-example',
    imports: [
        RdxLabelDirective,
        RdxCheckboxRootDirective,
        RdxCheckboxButtonDirective,
        RdxCheckboxIndicatorDirective,
        RdxCheckboxInputDirective,
        RdxCheckboxIndicatorPresenceDirective,
        LucideDynamicIcon,
        JsonPipe
    ],
    template: `
        <div class="flex items-center gap-3">
            <div [checked]="checked()" (onCheckedChange)="checked.set($event)" rdxCheckboxRoot>
                <button id="r1" [class]="c.button" rdxCheckboxButton>
                    <ng-template rdxCheckboxIndicatorPresence>
                        <svg [class]="c.indicator" [lucideIcon]="Check" rdxCheckboxIndicator size="16" />
                    </ng-template>
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
export class CheckboxPresence {
    readonly checked = model<CheckedState>(false);
    protected readonly Check = Check;
    protected readonly c = demoCheckbox;
}
