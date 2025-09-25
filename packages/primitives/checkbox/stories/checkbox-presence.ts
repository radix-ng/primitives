import { JsonPipe } from '@angular/common';
import { Component, model } from '@angular/core';
import { CheckedState, RdxCheckboxButtonDirective } from '@radix-ng/primitives/checkbox';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { Check, LucideAngularModule } from 'lucide-angular';
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
    styleUrl: 'checkbox.css',
    template: `
        <div style="display: flex; align-items: center;">
            <div [checked]="checked()" (onCheckedChange)="checked.set($event)" rdxCheckboxRoot>
                <button class="CheckboxButton" id="r1" rdxCheckboxButton>
                    <ng-template rdxCheckboxIndicatorPresence>
                        <lucide-angular class="CheckboxIndicator" [img]="Check" rdxCheckboxIndicator size="16" />
                    </ng-template>
                </button>
                <input rdxCheckboxInput />
            </div>
            <label class="Label" rdxLabel htmlFor="r1">I'm a checkbox</label>
        </div>

        <section style="color: white">
            <p>checked state:&nbsp;{{ checked() | json }}</p>
        </section>
    `
})
export class CheckboxPresence {
    readonly checked = model<CheckedState>(false);
    protected readonly Check = Check;
}
