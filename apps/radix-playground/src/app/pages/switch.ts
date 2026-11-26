import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxSwitchRoot, RdxSwitchThumb } from '@radix-ng/primitives/switch';
import { DemoPage } from '../shared/demo-page';

@Component({
    selector: 'app-switch',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [DemoPage, RdxSwitchRoot, RdxSwitchThumb],
    template: `
        <demo-page title="Switch" description="A control that toggles between an on and off state.">
            <label class="text-foreground flex items-center gap-3 text-sm font-medium" for="airplane-mode">
                Airplane mode
                <button
                    class="bg-muted focus-visible:ring-ring data-[checked]:bg-primary relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-0 p-0 shadow-sm transition-colors outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                    id="airplane-mode"
                    rdxSwitchRoot
                    defaultChecked
                >
                    <span
                        class="bg-background pointer-events-none block size-5 translate-x-0.5 rounded-full shadow-sm transition-transform data-[checked]:translate-x-[22px]"
                        rdxSwitchThumb
                    ></span>
                </button>
            </label>
        </demo-page>
    `
})
export default class SwitchPage {}
