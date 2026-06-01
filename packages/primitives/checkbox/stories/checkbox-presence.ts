import { JsonPipe } from '@angular/common';
import { Component, model } from '@angular/core';
import { CheckedState, RdxCheckboxButtonDirective } from '@radix-ng/primitives/checkbox';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { Check, LucideAngularModule } from 'lucide-angular';
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
        LucideAngularModule,
        JsonPipe
    ],
    template: `
        <div class="flex items-center gap-3">
            <div [checked]="checked()" (onCheckedChange)="checked.set($event)" rdxCheckboxRoot>
                <button id="r1" [class]="c.button" rdxCheckboxButton>
                    <ng-template rdxCheckboxIndicatorPresence>
                        <lucide-angular [class]="c.indicator" [img]="Check" rdxCheckboxIndicator size="16" />
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
