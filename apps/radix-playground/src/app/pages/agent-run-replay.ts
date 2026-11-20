import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

// Curated from the successful live Codex rename run recorded on 2026-11-14 (rename-0vDbCS).
// The displayed values come from its snapshot and independent form observations.
const steps = [
    {
        tool: 'snapshot',
        description: 'Codex read the form and found the project name and visibility controls.',
        name: 'Radix project',
        visibility: 'Private'
    },
    {
        tool: 'act · set-value',
        description: 'Codex changed the project name to Agent workspace. The form recorded the change.',
        name: 'Agent workspace',
        visibility: 'Private'
    },
    {
        tool: 'act · select-option',
        description: 'Codex changed Visibility to Public. The run verified both values in the form and the runtime.',
        name: 'Agent workspace',
        visibility: 'Public'
    }
] as const;

@Component({
    selector: 'app-agent-run-replay',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'block' },
    template: `
        <p class="text-muted-foreground text-sm">Recorded run · 14 November 2026</p>
        <p class="mt-2 text-sm">Rename the project to Agent workspace and change its Visibility to Public.</p>

        <div class="border-border bg-muted/30 mt-4 rounded-md border p-4">
            <div role="status">
                <p class="text-muted-foreground text-xs">Step {{ position() + 1 }} of {{ stepCount }}</p>
                <p class="mt-1 font-mono text-sm font-medium">{{ step().tool }}</p>
                <p class="mt-1 text-sm">{{ step().description }}</p>
                <dl class="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                        <dt class="text-muted-foreground">Recorded project name</dt>
                        <dd class="font-medium">{{ step().name }}</dd>
                    </div>
                    <div>
                        <dt class="text-muted-foreground">Recorded visibility</dt>
                        <dd class="font-medium">{{ step().visibility }}</dd>
                    </div>
                </dl>
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
                <button
                    class="demo-button demo-button-outline h-8 px-3 text-xs"
                    [disabled]="position() === 0"
                    (click)="previousStep()"
                    type="button"
                >
                    Previous step
                </button>
                <button class="demo-button demo-button-primary h-8 px-3 text-xs" (click)="advance()" type="button">
                    {{ position() === stepCount - 1 ? 'Replay from start' : 'Next step' }}
                </button>
            </div>
        </div>
    `
})
export class AgentRunReplay {
    protected readonly stepCount = steps.length;
    protected readonly position = signal(0);
    protected readonly step = computed(() => steps[this.position()]);

    protected previousStep(): void {
        this.position.update((index) => Math.max(0, index - 1));
    }

    protected advance(): void {
        this.position.update((index) => (index + 1) % this.stepCount);
    }
}
