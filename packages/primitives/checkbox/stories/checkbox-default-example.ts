import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideCheck } from '@lucide/angular';
import {
    RdxCheckboxButtonDirective,
    RdxCheckboxIndicatorDirective,
    RdxCheckboxIndicatorPresenceDirective,
    RdxCheckboxRootDirective
} from '@radix-ng/primitives/checkbox';

@Component({
    host: { class: 'contents' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'rdx-checkbox-default-example',
    imports: [
        LucideCheck,

        RdxCheckboxButtonDirective,
        RdxCheckboxIndicatorDirective,
        RdxCheckboxIndicatorPresenceDirective,
        RdxCheckboxRootDirective
    ],
    template: `
        <div class="flex items-center gap-2">
            <div [readOnly]="readOnly()" [disabled]="disabled()" [checked]="true" rdxCheckboxRoot>
                <button class="demo-choice size-4" id="checkbox-1" rdxCheckboxButton>
                    <svg
                        class="flex items-center"
                        *rdxCheckboxIndicatorPresence
                        rdxCheckboxIndicator
                        size="12"
                        lucideCheck
                    />
                </button>
            </div>
            <label class="text-foreground flex items-center text-sm" for="checkbox-1">
                Accept terms and conditions.
            </label>
        </div>
    `
})
export class CheckboxDefaultStory {
    readonly readOnly = input(false);
    readonly disabled = input(false);
}
