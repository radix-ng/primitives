import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideCheck } from '@lucide/angular';
import {
    RdxCheckboxButtonDirective,
    RdxCheckboxIndicatorDirective,
    RdxCheckboxIndicatorPresenceDirective,
    RdxCheckboxRootDirective
} from '@radix-ng/primitives/checkbox';
import { RdxLabelDirective } from '@radix-ng/primitives/label';

@Component({
    host: { class: 'contents' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'rdx-checkbox-default-example',
    imports: [
        LucideCheck,
        RdxLabelDirective,
        RdxCheckboxButtonDirective,
        RdxCheckboxIndicatorDirective,
        RdxCheckboxIndicatorPresenceDirective,
        RdxCheckboxRootDirective
    ],
    template: `
        <div class="flex items-center gap-3">
            <div [readOnly]="readOnly()" [disabled]="disabled()" [checked]="true" rdxCheckboxRoot>
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
                    />
                </button>
            </div>
            <label class="text-foreground flex items-center text-sm font-medium" rdxLabel htmlFor="checkbox-1">
                Accept terms and conditions.
            </label>
        </div>
    `
})
export class CheckboxDefaultStory {
    readonly readOnly = input(false);
    readonly disabled = input(false);
}
