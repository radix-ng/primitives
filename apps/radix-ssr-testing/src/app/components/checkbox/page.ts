import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxCheckboxButtonDirective,
    RdxCheckboxIndicatorDirective,
    RdxCheckboxIndicatorPresenceDirective,
    RdxCheckboxRootDirective
} from '@radix-ng/primitives/checkbox';

@Component({
    selector: 'app-checkbox',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RdxCheckboxRootDirective,
        RdxCheckboxButtonDirective,
        RdxCheckboxIndicatorDirective,
        RdxCheckboxIndicatorPresenceDirective
    ],
    template: `
        <div [checked]="true" rdxCheckboxRoot>
            <button rdxCheckboxButton>
                [
                <span *rdxCheckboxIndicatorPresence="{ keepMounted: true }" rdxCheckboxIndicator>✔</span>
                ]
            </button>
        </div>
    `
})
export default class Page {}
