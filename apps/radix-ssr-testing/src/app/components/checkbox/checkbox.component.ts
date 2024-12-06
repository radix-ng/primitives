import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxCheckboxButtonDirective,
    RdxCheckboxDirective,
    RdxCheckboxInputDirective
} from '@radix-ng/primitives/checkbox';

@Component({
    selector: 'app-avatar',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RdxCheckboxDirective, RdxCheckboxInputDirective, RdxCheckboxButtonDirective],
    template: `
        <div rdxCheckboxRoot>
            <button rdxCheckboxButton>
                [
                <span rdxCheckboxInput>✔</span>
                ]
            </button>
        </div>
    `
})
export default class CheckboxComponent {}
