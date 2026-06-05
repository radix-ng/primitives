import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxCollapsiblePanelDirective,
    RdxCollapsiblePanelPresenceDirective,
    RdxCollapsibleRootDirective,
    RdxCollapsibleTriggerDirective
} from '@radix-ng/primitives/collapsible';

@Component({
    selector: 'app-collapsible',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RdxCollapsibleRootDirective,
        RdxCollapsibleTriggerDirective,
        RdxCollapsiblePanelDirective,
        RdxCollapsiblePanelPresenceDirective
    ],
    template: `
        <div [open]="true" rdxCollapsibleRoot>
            <button rdxCollapsibleTrigger>Trigger</button>
            <ng-template rdxCollapsiblePanelPresence>
                <div rdxCollapsiblePanel>Content</div>
            </ng-template>
        </div>
    `
})
export default class Page {}
