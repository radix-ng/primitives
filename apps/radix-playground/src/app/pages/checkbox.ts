import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideCheck } from '@lucide/angular';
import {
    RdxCheckboxButtonDirective,
    RdxCheckboxIndicatorDirective,
    RdxCheckboxIndicatorPresenceDirective,
    RdxCheckboxInputDirective,
    RdxCheckboxRootDirective
} from '@radix-ng/primitives/checkbox';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { DemoPage } from '../shared/demo-page';

@Component({
    selector: 'app-checkbox',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        DemoPage,
        RdxCheckboxRootDirective,
        RdxCheckboxButtonDirective,
        RdxCheckboxIndicatorDirective,
        RdxCheckboxIndicatorPresenceDirective,
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
                <div [checked]="true" rdxCheckboxRoot>
                    <button
                        class="demo-checkbox-button demo-focus flex size-6 items-center justify-center disabled:opacity-50 aria-disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                        id="checkbox-1"
                        rdxCheckboxButton
                    >
                        <svg
                            class="text-primary flex items-center"
                            *rdxCheckboxIndicatorPresence
                            rdxCheckboxIndicator
                            size="16"
                            lucideCheck
                        ></svg>
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
export default class CheckboxPage {}
