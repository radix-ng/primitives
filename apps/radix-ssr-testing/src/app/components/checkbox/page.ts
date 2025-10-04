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
        RdxCheckboxIndicatorPresenceDirective,
        RdxCheckboxIndicatorDirective
    ],
    template: `
        <div [checked]="true" rdxCheckboxRoot>
            <button rdxCheckboxButton>
                [
                <ng-template rdxCheckboxIndicatorPresence>
                    <span rdxCheckboxIndicator>✔</span>
                </ng-template>
                ]
            </button>
        </div>
    `
})
export default class Page {}
