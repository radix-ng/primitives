import { Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import {
    RdxSelectItem,
    RdxSelectItemIndicator,
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

@Component({
    selector: 'select-dynamic-options',
    imports: [
        RdxSelectRoot,
        RdxSelectPortal,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectPopup,
        RdxSelectList,
        RdxSelectLabel,
        RdxSelectItemIndicator,
        RdxSelectItem,
        RdxSelectItemText,
        RdxSelectPositioner,
        LucideCheck,
        LucideChevronDown
    ],
    host: { '(document:keydown)': 'command($event)' },
    template: `
        <div class="grid w-80 max-w-full gap-3">
            <ng-container [(value)]="value" [items]="fruits()" defaultValue="apple" rdxSelectRoot>
                <div class="text-sm font-medium" rdxSelectLabel>Live options</div>
                <button
                    class="demo-select-trigger data-[placeholder]:text-muted-foreground data-[invalid]:border-destructive data-[invalid]:aria-invalid:ring-destructive/30 demo-focus inline-flex min-h-9 items-center justify-between gap-2 px-3 py-1.5 disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                    rdxSelectTrigger
                >
                    <span #display="rdxSelectedValue" rdxSelectValue placeholder="Choose a fruit">
                        {{ display.slotText() }}
                    </span>
                    <svg class="size-4 shrink-0" lucideChevronDown size="16" aria-hidden="true" />
                </button>
                <ng-template rdxSelectPortal>
                    <div class="z-[100]" sideOffset="6" rdxSelectPositioner>
                        <div
                            class="demo-select-popup min-w-[var(--anchor-width,10rem)] will-change-[opacity,transform]"
                            rdxSelectPopup
                        >
                            <div class="p-1" rdxSelectList>
                                @for (fruit of fruits(); track fruit.value) {
                                    <div
                                        class="demo-select-item data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[disabled]:text-muted-foreground relative flex min-h-7 items-center gap-2 ps-6 pe-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                        [value]="fruit.value"
                                        rdxSelectItem
                                    >
                                        <span
                                            class="absolute start-0 inline-flex w-6 items-center justify-center"
                                            rdxSelectItemIndicator
                                            aria-hidden="true"
                                        >
                                            <svg class="size-4 shrink-0" lucideCheck size="16" />
                                        </span>
                                        <span rdxSelectItemText>{{ fruit.label }}</span>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
            <p class="text-muted-foreground text-sm">
                While the list is open: F2 adds Apricot, F3 removes the selected fruit, F6 reverses the order.
            </p>
            <button
                class="border-border rounded-md border px-3 py-2 text-sm shadow-sm"
                (click)="restore()"
                type="button"
            >
                Restore options
            </button>
            <output class="text-muted-foreground font-mono text-xs" data-testid="dynamic-value">
                Selected: {{ value() ?? 'none' }}
            </output>
        </div>
    `
})
export class SelectDynamicOptions {
    readonly value = signal<string | null | undefined>('apple');
    private readonly initial = [
        { value: 'apple', label: 'Apple' },
        { value: 'banana', label: 'Banana' },
        { value: 'cherry', label: 'Cherry' }
    ];
    readonly fruits = signal(this.initial);
    command(event: KeyboardEvent) {
        // Commands belong to the demo. They only change application data; Select owns all interaction state.
        if (!['F2', 'F3', 'F6'].includes(event.key)) return;
        event.preventDefault();
        if (event.key === 'F2' && !this.fruits().some((fruit) => fruit.value === 'apricot'))
            this.fruits.update((fruits) => {
                const apricot = { value: 'apricot', label: 'Apricot' };
                return fruits.length ? [fruits[0], apricot, ...fruits.slice(1)] : [apricot];
            });
        if (event.key === 'F3') this.fruits.update((fruits) => fruits.filter((fruit) => fruit.value !== this.value()));
        if (event.key === 'F6') this.fruits.update((fruits) => [...fruits].reverse());
    }
    restore() {
        this.fruits.set(this.initial);
    }
}
