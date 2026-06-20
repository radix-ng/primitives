import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { RdxSwitchInput, RdxSwitchRoot, RdxSwitchThumb } from '@radix-ng/primitives/switch';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'switch-disabled-example',
    imports: [RdxLabelDirective, RdxSwitchRoot, RdxSwitchInput, RdxSwitchThumb],
    template: `
        <label
            class="text-foreground flex items-center gap-3 text-sm font-medium"
            rdxLabel
            htmlFor="airplane-mode-disabled"
        >
            Airplane mode
            <button
                class="bg-muted data-[checked]:bg-primary focus-visible:ring-ring relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-0 p-0 shadow-sm transition-colors outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                id="airplane-mode-disabled"
                rdxSwitchRoot
                disabled
            >
                <input rdxSwitchInput />
                <span
                    class="bg-background pointer-events-none block size-5 translate-x-0.5 rounded-full shadow-sm transition-transform data-[checked]:translate-x-[22px]"
                    rdxSwitchThumb
                ></span>
            </button>
        </label>
    `
})
export class SwitchDisabledExample {}
