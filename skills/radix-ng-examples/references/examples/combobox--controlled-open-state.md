# Combobox — Controlled open state

> One example from the [Combobox](../components/combobox.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

Use `[open]` + `(onOpenChange)` when the application needs to inspect or veto open-state changes.
The change payload includes `reason`, the originating DOM `event`, and `eventDetails.cancel()`.

```ts
protected readonly open = signal(false);

protected onOpenChange(change: { open: boolean; eventDetails: { cancel(): void } }) {
  if (!change.open && this.hasUnsavedSelection) {
    change.eventDetails.cancel();
    return;
  }

  this.open.set(change.open);
}
```

Live demo:

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { demoCombobox } from '../../storybook/styles';
import { _importsCombobox, RdxComboboxOpenChange } from '../index';

interface ComboboxOpenChangeLogEntry {
    label: string;
    reason: string;
    eventType: string;
    canceled: boolean;
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'combobox-open-change',
    imports: [_importsCombobox, LucideChevronDown, LucideCheck],
    template: `
        <div class="flex w-full max-w-[760px] flex-col gap-3">
            <div class="grid gap-3 md:grid-cols-[minmax(0,272px)_minmax(0,1fr)]">
                <div class="flex flex-col gap-3">
                    <div
                        #root="rdxComboboxRoot"
                        [(open)]="open"
                        [(value)]="value"
                        (onOpenChange)="handleOpenChange($event)"
                        rdxComboboxRoot
                    >
                        <div [class]="c.control">
                            <input
                                [class]="c.input"
                                rdxComboboxInput
                                placeholder="Search a framework…"
                                aria-label="Framework"
                            />
                            <button [class]="c.trigger" rdxComboboxTrigger aria-label="Open">
                                <svg lucideChevronDown size="16"></svg>
                            </button>
                        </div>

                        <div *rdxComboboxPortal [class]="c.positioner" rdxComboboxPositioner>
                            <div [class]="c.popup" rdxComboboxPopup>
                                <div [class]="c.list" rdxComboboxList aria-label="Frameworks">
                                    @for (framework of frameworks; track framework) {
                                        <div [class]="c.item" [value]="framework" rdxComboboxItem>
                                            <span [class]="c.itemIndicator" rdxComboboxItemIndicator>
                                                <svg lucideCheck size="14"></svg>
                                            </span>
                                            {{ framework }}
                                        </div>
                                    }
                                </div>
                                <div [class]="c.empty" rdxComboboxEmpty>No match found.</div>
                            </div>
                        </div>

                        <div class="grid gap-2 pt-3">
                            <button
                                class="border-border bg-background text-foreground hover:bg-muted inline-flex h-8 items-center justify-between rounded-md border px-3 text-xs"
                                (click)="cancelClose.update((value) => !value)"
                                type="button"
                            >
                                <span>Cancel close</span>
                                <span class="text-muted-foreground">{{ cancelClose() ? 'on' : 'off' }}</span>
                            </button>

                            <button
                                class="border-border bg-background text-foreground hover:bg-muted inline-flex h-8 items-center justify-between rounded-md border px-3 text-xs"
                                (click)="keepMountedOnClose.update((value) => !value)"
                                type="button"
                            >
                                <span>Keep mounted on close</span>
                                <span class="text-muted-foreground">{{ keepMountedOnClose() ? 'on' : 'off' }}</span>
                            </button>
                        </div>

                        <div
                            class="border-border bg-muted/40 mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 rounded-md border p-2.5 text-[11px]"
                        >
                            <div class="text-muted-foreground">open</div>
                            <div class="font-medium">{{ root.open() ? 'true' : 'false' }}</div>
                            <div class="text-muted-foreground">present</div>
                            <div class="font-medium">{{ root.present() ? 'true' : 'false' }}</div>
                            <div class="text-muted-foreground">cancel close</div>
                            <div class="font-medium">{{ cancelClose() ? 'on' : 'off' }}</div>
                            <div class="text-muted-foreground">keep mounted</div>
                            <div class="font-medium">{{ keepMountedOnClose() ? 'on' : 'off' }}</div>
                            <div class="text-muted-foreground">value</div>
                            <div class="truncate font-medium">{{ value() ?? 'unset' }}</div>
                        </div>
                    </div>
                </div>

                <div class="border-border bg-muted/30 flex min-h-[308px] min-w-0 flex-col rounded-lg border">
                    <div class="border-border flex items-center justify-between border-b px-3 py-2">
                        <div>
                            <div class="text-sm font-medium">Open change details</div>
                            <div class="text-muted-foreground text-xs">Inspect reasons and cancellation.</div>
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
                        <div class="flex max-h-[232px] flex-1 flex-col gap-2 overflow-y-auto pr-1">
                            @for (entry of logs(); track $index) {
                                <div
                                    class="border-border bg-background grid gap-1 rounded-md border p-2.5 text-[11px] leading-4"
                                >
                                    <div class="flex items-center justify-between gap-2">
                                        <span class="font-medium">{{ entry.label }}</span>
                                        <span class="text-muted-foreground truncate">{{ entry.reason }}</span>
                                    </div>
                                    <div class="text-foreground/80">event: {{ entry.eventType }}</div>
                                    <div class="text-muted-foreground">
                                        canceled:
                                        <span class="font-medium">{{ entry.canceled ? 'yes' : 'no' }}</span>
                                    </div>
                                </div>
                            } @empty {
                                <div class="text-muted-foreground flex flex-1 items-center justify-center text-sm">
                                    Open or close the combobox to inspect onOpenChange.
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class ComboboxOpenChange {
    protected readonly c = demoCombobox;

    readonly open = signal(false);
    readonly value = signal<string | null>(null);
    readonly cancelClose = signal(false);
    readonly keepMountedOnClose = signal(false);
    readonly logs = signal<ComboboxOpenChangeLogEntry[]>([]);

    readonly frameworks = ['Angular', 'React', 'Svelte', 'Solid', 'Vue', 'Qwik'];

    handleOpenChange(change: RdxComboboxOpenChange): void {
        if (!change.open && this.cancelClose()) {
            change.eventDetails.cancel();
        }

        if (!change.open && this.keepMountedOnClose()) {
            change.eventDetails.preventUnmountOnClose();
        }

        this.logs.update((entries) =>
            [
                {
                    label: `open -> ${change.open}`,
                    reason: change.reason,
                    eventType: change.event.type,
                    canceled: change.eventDetails.isCanceled()
                },
                ...entries
            ].slice(0, 8)
        );
    }
}
```
