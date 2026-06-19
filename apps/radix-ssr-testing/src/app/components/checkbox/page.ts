import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxCheckboxButtonDirective,
    RdxCheckboxIndicatorDirective,
    RdxCheckboxRootDirective
} from '@radix-ng/primitives/checkbox';

@Component({
    selector: 'app-checkbox',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RdxCheckboxRootDirective, RdxCheckboxButtonDirective, RdxCheckboxIndicatorDirective],
    template: `
        <div [checked]="true" rdxCheckboxRoot>
            <button rdxCheckboxButton>
                [
                <span keepMounted rdxCheckboxIndicator>✔</span>
                ]
            </button>
        </div>
    `
})
export default class Page {}
