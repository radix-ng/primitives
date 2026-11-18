import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    ElementRef,
    inject,
    input,
    viewChild
} from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { injectId } from '@radix-ng/primitives/core';
import { RdxInputDirective } from '@radix-ng/primitives/input';
import { AgentRuntime } from './agent-runtime';
import { registerInput } from './control-adapters';
import { ProjectDemo } from './project-demo';

@Component({
    selector: 'app-agent-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormField, RdxInputDirective],
    template: `
        <label class="text-foreground mb-2 block text-sm font-medium" [for]="inputId">{{ label() }}</label>
        <input
            class="demo-input h-9 w-full px-3"
            #element
            [id]="inputId"
            [formField]="field()"
            (onValueChange)="demo.inputChange(label(), $event)"
            rdxInput
        />
    `
})
export class AgentInput {
    readonly field = input.required<FieldTree<string>>();
    readonly label = input.required<string>();
    readonly available = input(true);
    protected readonly inputId = injectId('agent-input-');
    protected readonly demo = inject(ProjectDemo);
    private readonly primitive = viewChild.required(RdxInputDirective);
    private readonly element = viewChild.required<ElementRef<HTMLInputElement>>('element');

    constructor() {
        const runtime = inject(AgentRuntime);
        const owner = inject(DestroyRef);
        afterNextRender(() =>
            registerInput(runtime, owner, this.primitive(), this.element().nativeElement, () => this.available())
        );
    }
}
