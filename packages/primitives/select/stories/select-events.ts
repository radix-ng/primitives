import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { demoSelect } from '../../storybook/styles';
import {
    RdxSelectItem,
    RdxSelectItemIndicator,
    RdxSelectItemText,
    RdxSelectList,
    RdxSelectOpenChangeEvent,
    RdxSelectPopup,
    RdxSelectPortal,
    RdxSelectPositioner,
    RdxSelectRoot,
    RdxSelectTrigger,
    RdxSelectValue,
    RdxSelectValueChangeEvent
} from '../index';

interface SelectEventLogEntry {
    label: string;
    reason: string;
    payload: string;
    canceled: boolean;
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'select-events',
    imports: [
        RdxSelectRoot,
        RdxSelectPortal,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectPopup,
        RdxSelectList,
        RdxSelectPositioner,
        RdxSelectItem,
        RdxSelectItemText,
        RdxSelectItemIndicator,
        LucideChevronDown,
        LucideCheck
    ],
    template: `
        <div class="flex w-full max-w-[720px] flex-col gap-3">
            <div class="grid gap-3 sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
                <div class="flex flex-col gap-2">
                    <ng-container
                        #root="rdxSelectRoot"
                        [(open)]="open"
                        [(value)]="value"
                        (onOpenChange)="handleOpenChange($event)"
                        (onValueChange)="handleValueChange($event)"
                        rdxSelectRoot
                    >
                        <button class="w-full" [class]="s.trigger" aria-label="Select a framework" rdxSelectTrigger>
                            <span #selectedValue="rdxSelectedValue" rdxSelectValue placeholder="Select a framework">
                                {{ selectedValue.slotText() }}
                            </span>
                            <svg [class]="s.icon" lucideChevronDown size="16" aria-hidden="true" />
                        </button>

                        <div *rdxSelectPortal [class]="s.positioner" sideOffset="6" rdxSelectPositioner>
                            <div [class]="s.popup" rdxSelectPopup>
                                <div [class]="s.list" rdxSelectList>
                                    @for (option of options; track option.value) {
                                        <div [class]="s.item" [value]="option.value" rdxSelectItem>
                                            <span [class]="s.itemIndicator" rdxSelectItemIndicator>
                                                <svg [class]="s.icon" lucideCheck size="16" aria-hidden="true" />
                                            </span>
                                            <span rdxSelectItemText>{{ option.label }}</span>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>

                        <div class="grid gap-2 pt-1">
                            <button
                                class="border-border bg-background text-foreground hover:bg-muted inline-flex h-7 items-center justify-between rounded-md border px-3 text-xs"
                                (click)="cancelNextOpen.update((value) => !value)"
                                type="button"
                            >
                                <span>Cancel next open</span>
                                <span class="text-muted-foreground">{{ cancelNextOpen() ? 'armed' : 'off' }}</span>
                            </button>

                            <button
                                class="border-border bg-background text-foreground hover:bg-muted inline-flex h-7 items-center justify-between rounded-md border px-3 text-xs"
                                (click)="cancelNextValue.update((value) => !value)"
                                type="button"
                            >
                                <span>Cancel next value</span>
                                <span class="text-muted-foreground">{{ cancelNextValue() ? 'armed' : 'off' }}</span>
                            </button>

                            <div
                                class="border-border bg-muted/40 grid grid-cols-2 gap-x-3 gap-y-1.5 rounded-md border p-2.5 text-[11px]"
                            >
                                <div class="text-muted-foreground">openMethod</div>
                                <div class="font-medium">{{ root.openMethod() ?? 'null' }}</div>
                                <div class="text-muted-foreground">openInteraction</div>
                                <div class="font-medium">{{ root.openInteractionType() ?? 'null' }}</div>
                                <div class="text-muted-foreground">closeInteraction</div>
                                <div class="font-medium">{{ root.closeInteractionType() ?? 'null' }}</div>
                                <div class="text-muted-foreground">value</div>
                                <div class="truncate font-medium">{{ value() ?? 'unset' }}</div>
                            </div>
                        </div>
                    </ng-container>
                </div>

                <div class="border-border bg-muted/30 flex min-h-[280px] min-w-0 flex-col rounded-lg border">
                    <div class="border-border flex items-center justify-between border-b px-3 py-2">
                        <div>
                            <div class="text-sm font-medium">Change details</div>
                            <div class="text-muted-foreground text-xs">Reasons, payload, and cancel state.</div>
                        </div>
                        <button
                            class="text-muted-foreground hover:text-foreground inline-flex h-7 items-center rounded-md px-2 text-xs"
                            (click)="logs.set([])"
                            type="button"
                        >
                            Clear
                        </button>
                    </div>

                    <div class="flex min-h-0 flex-1 flex-col p-2.5">
                        <div class="flex max-h-[240px] flex-1 flex-col gap-2 overflow-y-auto pr-1">
                            @for (entry of logs(); track $index) {
                                <div
                                    class="border-border bg-background grid gap-1 rounded-md border p-2.5 text-[11px] leading-4"
                                >
                                    <div class="flex items-center justify-between gap-2">
                                        <span class="font-medium">{{ entry.label }}</span>
                                        <span class="text-muted-foreground truncate">{{ entry.reason }}</span>
                                    </div>
                                    <div class="text-foreground/80 break-words">{{ entry.payload }}</div>
                                    <div class="text-muted-foreground">
                                        canceled:
                                        <span class="font-medium">{{ entry.canceled ? 'yes' : 'no' }}</span>
                                    </div>
                                </div>
                            } @empty {
                                <div class="text-muted-foreground flex flex-1 items-center justify-center text-sm">
                                    Interact with the select to inspect change details.
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class SelectEvents {
    protected readonly s = demoSelect;

    readonly open = signal(false);
    readonly value = signal<string | undefined>(undefined);
    readonly cancelNextOpen = signal(false);
    readonly cancelNextValue = signal(false);
    readonly logs = signal<SelectEventLogEntry[]>([]);

    readonly options = [
        { value: 'angular', label: 'Angular' },
        { value: 'react', label: 'React' },
        { value: 'vue', label: 'Vue' },
        { value: 'svelte', label: 'Svelte' }
    ];

    handleOpenChange(event: RdxSelectOpenChangeEvent): void {
        if (event.open && this.cancelNextOpen()) {
            event.eventDetails.cancel();
            this.cancelNextOpen.set(false);
        }

        this.record({
            label: `open -> ${event.open}`,
            reason: event.eventDetails.reason,
            payload: `event: ${event.eventDetails.event.type}`,
            canceled: event.eventDetails.isCanceled()
        });
    }

    handleValueChange(event: RdxSelectValueChangeEvent): void {
        if (this.cancelNextValue()) {
            event.eventDetails.cancel();
            this.cancelNextValue.set(false);
        }

        this.record({
            label: 'value change',
            reason: event.eventDetails.reason,
            payload: `value: ${Array.isArray(event.value) ? event.value.join(', ') : (event.value ?? 'unset')}`,
            canceled: event.eventDetails.isCanceled()
        });
    }

    private record(entry: SelectEventLogEntry): void {
        this.logs.update((items) => [entry, ...items].slice(0, 8));
    }
}
