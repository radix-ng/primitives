import { Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { demoSelect } from '../../storybook/styles';
import { _importsSelect } from '../index';

@Component({
    selector: 'select-dynamic-options',
    imports: [_importsSelect, LucideCheck, LucideChevronDown],
    host: { '(document:keydown)': 'command($event)' },
    template: `
        <div class="grid w-80 max-w-full gap-3">
            <ng-container [(value)]="value" [items]="fruits()" defaultValue="apple" rdxSelectRoot>
                <div class="text-sm font-medium" rdxSelectLabel>Live options</div>
                <button [class]="s.trigger" rdxSelectTrigger>
                    <span #display="rdxSelectedValue" rdxSelectValue placeholder="Choose a fruit">
                        {{ display.slotText() }}
                    </span>
                    <svg [class]="s.icon" lucideChevronDown size="16" aria-hidden="true" />
                </button>
                <ng-template rdxSelectPortal>
                    <div [class]="s.positioner" sideOffset="6" rdxSelectPositioner>
                        <div [class]="s.popup" rdxSelectPopup>
                            <div [class]="s.list" rdxSelectList>
                                @for (fruit of fruits(); track fruit.value) {
                                    <div [class]="s.item" [value]="fruit.value" rdxSelectItem>
                                        <span [class]="s.itemIndicator" rdxSelectItemIndicator aria-hidden="true">
                                            <svg [class]="s.icon" lucideCheck size="16" />
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
    protected readonly s = demoSelect;
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
