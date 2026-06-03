import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxCollapsiblePanelDirective,
    RdxCollapsibleRootDirective,
    RdxCollapsibleTriggerDirective
} from '@radix-ng/primitives/collapsible';

@Component({
    selector: 'app-collapsible',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RdxCollapsibleRootDirective, RdxCollapsibleTriggerDirective, RdxCollapsiblePanelDirective],
    template: `
        <div rdxCollapsibleRoot [open]="true">
            <button rdxCollapsibleTrigger>Trigger</button>
            <div rdxCollapsiblePanel>Content</div>
        </div>
    `
})
export default class Page {}
