import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    ElementRef,
    inject,
    input,
    model,
    viewChild
} from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import {
    RdxSelectItem,
    RdxSelectItemText,
    RdxSelectLabel,
    RdxSelectList,
    RdxSelectPopup,
    RdxSelectPortal,
    RdxSelectPositioner,
    RdxSelectRoot,
    RdxSelectTrigger,
    RdxSelectValue
} from '@radix-ng/primitives/select';
import { AgentRuntime } from './agent-runtime';
import { registerSelect } from './control-adapters';
import { ProjectDemo } from './project-demo';
import { SelectOption } from './types';

@Component({
    selector: 'app-agent-select',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        FormField,
        RdxSelectRoot,
        RdxSelectLabel,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectPortal,
        RdxSelectPositioner,
        RdxSelectPopup,
        RdxSelectList,
        RdxSelectItem,
        RdxSelectItemText
    ],
    template: `
        <ng-container
            [(open)]="open"
            [formField]="field()"
            [multiple]="false"
            [modal]="false"
            [readOnly]="field()().readonly()"
            [items]="options()"
            (onValueChange)="demo.selectChange(label(), $event)"
            (onOpenChange)="demo.selectOpen(label(), $event)"
            rdxSelectRoot
        >
            <span class="text-foreground mb-2 block text-sm font-medium" rdxSelectLabel>{{ label() }}</span>
            <button
                class="demo-select-trigger data-[placeholder]:text-muted-foreground data-[invalid]:border-destructive data-[invalid]:aria-invalid:ring-destructive/30 demo-focus inline-flex min-h-9 items-center justify-between gap-2 px-3 py-1.5 disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                #trigger
                rdxSelectTrigger
            >
                <span #display="rdxSelectedValue" rdxSelectValue>{{ display.slotText() }}</span>
            </button>
            <ng-template rdxSelectPortal>
                <div class="z-[160]" sideOffset="4" rdxSelectPositioner>
                    <div
                        class="demo-select-popup data-[open]:animate-popover-popup-in data-[starting-style]:animate-popover-popup-in data-[ending-style]:animate-popover-popup-out min-w-[var(--anchor-width,10rem)] will-change-[opacity,transform]"
                        rdxSelectPopup
                    >
                        <div class="p-1" rdxSelectList>
                            @for (option of options(); track option.value) {
                                <div
                                    class="demo-select-item data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[disabled]:text-muted-foreground relative flex min-h-7 items-center gap-2 ps-6 pe-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                    [value]="option.value"
                                    [disabled]="option.disabled ?? false"
                                    rdxSelectItem
                                >
                                    <span rdxSelectItemText>{{ option.label }}</span>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </ng-template>
        </ng-container>
    `
})
export class AgentSelect {
    readonly field = input.required<FieldTree<string>>();
    readonly options = input.required<readonly SelectOption[]>();
    readonly label = input.required<string>();
    readonly available = input(true);
    readonly open = model(false);
    protected readonly demo = inject(ProjectDemo);
    private readonly root = viewChild.required(RdxSelectRoot);
    private readonly trigger = viewChild.required<ElementRef<HTMLElement>>('trigger');

    constructor() {
        const runtime = inject(AgentRuntime);
        const owner = inject(DestroyRef);
        afterNextRender(() =>
            registerSelect(
                runtime,
                owner,
                this.root(),
                this.trigger().nativeElement,
                () => this.options(),
                () => this.available()
            )
        );
    }
}
