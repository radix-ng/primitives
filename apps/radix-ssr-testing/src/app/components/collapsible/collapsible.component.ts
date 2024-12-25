import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxCollapsibleContentDirective,
    RdxCollapsibleRootDirective,
    RdxCollapsibleTriggerDirective
} from '@radix-ng/primitives/collapsible';

@Component({
    selector: 'app-collapsible',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RdxCollapsibleRootDirective,
        RdxCollapsibleTriggerDirective,
        RdxCollapsibleContentDirective
    ],
    template: `
        <div [open]="true" rdxCollapsibleRoot>
            <button rdxCollapsibleTrigger>Trigger</button>
            <div rdxCollapsibleContent>Content</div>
        </div>
    `
})
export default class CollapsibleComponent {}
