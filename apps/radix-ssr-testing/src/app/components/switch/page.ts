import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxSwitchModule } from '@radix-ng/primitives/switch';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'app-switch',
    imports: [RdxSwitchModule],
    template: `
        <button rdxSwitchRoot>
            <span rdxSwitchThumb>Switch</span>
        </button>
    `
})
export default class Page {}
