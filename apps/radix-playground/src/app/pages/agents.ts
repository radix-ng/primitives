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
    RdxDialogPortalMisuseGuard,
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
import { ActionName, AgentRuntimeApi, ControlKind } from '../agent-runtime/types';

@Component({
    selector: 'app-agents',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [ProjectDemo],
    imports: [
        JsonPipe,
        RouterLink,
        AgentInput,
        AgentSelect,
        RdxDialogRoot,
        RdxDialogTrigger,
        RdxDialogPortal,
        RdxDialogPortalMisuseGuard,
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
    async run(kind: ControlKind, name: string, action: ActionName, value?: string): Promise<void> {
        const found = this.runtime.query({ kind, name });
        if (found.status !== 'matched') {
            this.lastResult.set(found);
            return;
        }
        this.lastResult.set(
            await this.runtime.act({ id: found.matches[0].id, action, ...(value === undefined ? {} : { value }) })
        );
    }
    async unknown(): Promise<void> {
        this.lastResult.set(await this.runtime.act({ id: 'destroyed-instance', action: 'open' }));
    }
    saved(): void {
        this.runtime.recordEvent({ event: 'project.saved', settings: this.demo.model() });
    }
}
