import { DOCUMENT, JsonPipe } from '@angular/common';
import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    ElementRef,
    inject,
    signal,
    viewChild
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
    createRdxDialogHandle,
    RdxDialogBackdrop,
    RdxDialogClose,
    RdxDialogDescription,
    RdxDialogPopup,
    RdxDialogPortal,
    RdxDialogRoot,
    RdxDialogTitle,
    RdxDialogTrigger
} from '@radix-ng/primitives/dialog';
import { RdxFormRoot } from '@radix-ng/primitives/form';
import { RdxSignalForm } from '@radix-ng/primitives/signal-forms';
import { AgentInput } from '../agent-runtime/agent-input';
import { AgentRuntime } from '../agent-runtime/agent-runtime';
import { AgentSelect } from '../agent-runtime/agent-select';
import { registerDialog } from '../agent-runtime/control-adapters';
import { ProjectDemo } from '../agent-runtime/project-demo';
import { ActionName, ActResult, AgentRuntimeApi, ControlKind } from '../agent-runtime/types';
import { AgentRunReplay } from './agent-run-replay';
import { AgentWorkflows } from './agent-workflows';

@Component({
    selector: 'app-agents',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [ProjectDemo],
    imports: [
        JsonPipe,
        RouterLink,
        AgentRunReplay,
        AgentWorkflows,
        AgentInput,
        AgentSelect,
        RdxDialogRoot,
        RdxDialogTrigger,
        RdxDialogPortal,
        RdxDialogBackdrop,
        RdxDialogPopup,
        RdxDialogTitle,
        RdxDialogDescription,
        RdxDialogClose,
        RdxFormRoot,
        RdxSignalForm
    ],
    templateUrl: './agents.html'
})
export default class AgentsPage {
    readonly runtime = inject(AgentRuntime);
    readonly demo = inject(ProjectDemo);
    protected readonly dialog = createRdxDialogHandle();
    protected readonly lastResult = signal<unknown>(null);
    protected readonly renameMessage = signal('');
    protected readonly formState = computed(() => ({
        valid: this.demo.fields().valid(),
        dirty: this.demo.fields().dirty(),
        touched: this.demo.fields().touched(),
        dialogOpen: this.demo.dialogOpen(),
        visibilityOpen: this.demo.visibilityOpen(),
        environmentOpen: this.demo.environmentOpen()
    }));
    private readonly dialogRoot = viewChild.required(RdxDialogRoot);
    private readonly dialogTrigger = viewChild.required<ElementRef<HTMLButtonElement>>('dialogTrigger');
    private readonly dialogPopup = viewChild<ElementRef<HTMLElement>>('dialogPopup');

    constructor() {
        const owner = inject(DestroyRef);
        const window = inject(DOCUMENT).defaultView as (Window & { radixAgentRuntime?: AgentRuntimeApi }) | null;
        this.runtime.clearJournal();
        afterNextRender(() => {
            registerDialog(
                this.runtime,
                owner,
                this.dialogRoot(),
                this.dialog,
                this.dialogTrigger().nativeElement,
                () => this.dialogPopup()?.nativeElement
            );
            if (window) window.radixAgentRuntime = this.runtime.api;
        });
        owner.onDestroy(() => {
            if (window?.radixAgentRuntime === this.runtime.api) delete window.radixAgentRuntime;
        });
    }

    inspect(): void {
        this.lastResult.set(this.runtime.snapshot());
    }
    findInput(): void {
        this.lastResult.set(this.runtime.query({ kind: 'input', name: 'Project name' }));
    }
    async run(kind: ControlKind, name: string, action: ActionName, value?: string): Promise<ActResult | undefined> {
        const found = this.runtime.query({ kind, name });
        if (found.status !== 'matched') {
            this.lastResult.set(found);
            return;
        }
        const result = await this.runtime.act({
            id: found.matches[0].id,
            action,
            ...(value === undefined ? {} : { value })
        });
        this.lastResult.set(result);
        return result;
    }

    protected async renameProject(): Promise<void> {
        const result = await this.run('input', 'Project name', 'set-value', 'Agent project');
        switch (result?.status) {
            case 'applied':
                this.renameMessage.set('Project name changed.');
                break;
            case 'unchanged':
                this.renameMessage.set('The project already has this name.');
                break;
            default:
                this.renameMessage.set(result?.message ?? 'The project name field is unavailable.');
        }
    }
    async unknown(): Promise<void> {
        this.lastResult.set(await this.runtime.act({ id: 'destroyed-instance', action: 'open' }));
    }
    saved(): void {
        this.runtime.recordEvent({ event: 'project.saved', settings: this.demo.model() });
    }
}
