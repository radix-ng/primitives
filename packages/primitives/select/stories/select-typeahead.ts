import { Component, input, signal } from '@angular/core';
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
    selector: 'select-typeahead',
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
    template: `
        <div class="grid w-80 max-w-full gap-3">
            <ng-container [(value)]="value" [items]="cities" rdxSelectRoot>
                <div class="text-sm font-medium" rdxSelectLabel>Destination</div>
                <button
                    class="demo-select-trigger data-[placeholder]:text-muted-foreground data-[invalid]:border-destructive data-[invalid]:aria-invalid:ring-destructive/30 demo-focus inline-flex min-h-9 items-center justify-between gap-2 px-3 py-1.5 disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                    rdxSelectTrigger
                >
                    <span #display="rdxSelectedValue" rdxSelectValue>{{ display.slotText() }}</span>
                    <svg class="size-4 shrink-0" lucideChevronDown size="16" aria-hidden="true" />
                </button>
                <ng-template [keepMounted]="keepMounted()" rdxSelectPortal>
                    <div class="z-[100]" sideOffset="6" rdxSelectPositioner>
                        <div
                            class="demo-select-popup min-w-[var(--anchor-width,10rem)] will-change-[opacity,transform]"
                            rdxSelectPopup
                        >
                            <div class="max-h-64 overflow-y-auto p-1" rdxSelectList>
                                @for (city of cities; track city.value) {
                                    <div
                                        class="demo-select-item data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[disabled]:text-muted-foreground relative flex min-h-7 items-center gap-2 ps-6 pe-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                        [value]="city.value"
                                        [disabled]="city.disabled ?? false"
                                        rdxSelectItem
                                    >
                                        <span
                                            class="absolute start-0 inline-flex w-6 items-center justify-center"
                                            rdxSelectItemIndicator
                                            aria-hidden="true"
                                        >
                                            <svg class="size-4 shrink-0" lucideCheck size="16" aria-hidden="true" />
                                        </span>
                                        <span rdxSelectItemText>{{ city.label }}</span>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
            <p class="text-muted-foreground text-sm">
                Focus the button and type “new y” to select New York without opening. Press B repeatedly to cycle
                through Berlin and Bern.
            </p>
            <p class="text-muted-foreground text-sm">
                In the open list, typing only highlights a destination; Enter selects it. Pause briefly to start a new
                search. Tokyo is unavailable.
            </p>
            <output class="text-muted-foreground font-mono text-xs" data-testid="typeahead-value">
                Selected: {{ value() }}
            </output>
        </div>
    `
})
export class SelectTypeahead {
    readonly keepMounted = input(false);
    readonly value = signal<string | null | undefined>('amsterdam');
    readonly cities: readonly { value: string; label: string; disabled?: boolean }[] = [
        { value: 'amsterdam', label: 'Amsterdam' },
        { value: 'athens', label: 'Athens' },
        { value: 'austin', label: 'Austin' },
        { value: 'berlin', label: 'Berlin' },
        { value: 'bern', label: 'Bern' },
        { value: 'new-york', label: 'New York' },
        { value: 'newark', label: 'Newark' },
        { value: 'new-delhi', label: 'New Delhi' },
        { value: 'san-francisco', label: 'San Francisco' },
        { value: 'santa-fe', label: 'Santa Fe' },
        { value: 'tokyo', label: 'Tokyo', disabled: true }
    ];
}
