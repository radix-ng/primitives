import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxCollapsibleContentDirective,
    RdxCollapsibleContentPresenceDirective,
    RdxCollapsibleRootDirective,
    RdxCollapsibleTriggerDirective
} from '@radix-ng/primitives/collapsible';

@Component({
    selector: 'app-collapsible',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RdxCollapsibleRootDirective,
        RdxCollapsibleTriggerDirective,
        RdxCollapsibleContentDirective,
        RdxCollapsibleContentPresenceDirective
    ],
    template: `
        <div [open]="true" rdxCollapsibleRoot>
            <button rdxCollapsibleTrigger>Trigger</button>
            <ng-template rdxCollapsibleContentPresence>
                <div rdxCollapsibleContent>Content</div>
            </ng-template>
        </div>
    `
})
export default class Page {}
