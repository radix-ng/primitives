import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { RdxSwitchRoot, RdxSwitchThumb } from '@radix-ng/primitives/switch';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'switch-disabled-example',
    imports: [RdxLabelDirective, RdxSwitchRoot, RdxSwitchThumb],
    template: `
        <label class="text-foreground flex items-center gap-2 text-sm" rdxLabel htmlFor="airplane-mode-disabled">
            Airplane mode
            <button class="demo-switch h-5 w-9 p-0.5" id="airplane-mode-disabled" rdxSwitchRoot disabled>
                <span
                    class="demo-switch-thumb size-3.5 data-checked:translate-x-4 rtl:data-checked:-translate-x-4"
                    rdxSwitchThumb
                ></span>
            </button>
        </label>
    `
})
export class SwitchDisabledExample {}
