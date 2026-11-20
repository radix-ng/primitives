import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideArrowLeftRight, LucideArrowRight, LucideChevronDown } from '@lucide/angular';

@Component({
    selector: 'app-agent-workflows',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'agent-workflow-theme block' },
    imports: [LucideArrowLeftRight, LucideArrowRight, LucideChevronDown],
    templateUrl: './agent-workflows.html'
})
export class AgentWorkflows {}
