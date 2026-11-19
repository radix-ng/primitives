# Combobox — Controlled open state

> One example from the [Combobox](../components/combobox.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

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
import {
    RdxComboboxEmpty,
    RdxComboboxInput,
    RdxComboboxItem,
    RdxComboboxItemIndicator,
    RdxComboboxList,
    RdxComboboxOpenChange,
    RdxComboboxPopup,
    RdxComboboxPortal,
    RdxComboboxPositioner,
    RdxComboboxRoot,
    RdxComboboxTrigger
} from '@radix-ng/primitives/combobox';

interface ComboboxOpenChangeLogEntry {
    label: string;
    reason: string;
    eventType: string;
    canceled: boolean;
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'combobox-open-change',
    imports: [
        RdxComboboxRoot,
        RdxComboboxInput,
        RdxComboboxTrigger,
        RdxComboboxPortal,
        RdxComboboxPositioner,
        RdxComboboxPopup,
        RdxComboboxList,
        RdxComboboxItem,
        RdxComboboxItemIndicator,
        RdxComboboxEmpty,
        LucideChevronDown,
        LucideCheck
    ],
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
                        <div
                            class="demo-combobox-control focus-within:ring-ring focus-within:ring-offset-background relative inline-flex h-9 w-64 items-center focus-within:ring-2 focus-within:ring-offset-2 data-[disabled]:opacity-50"
                        >
                            <input
                                class="demo-combobox-input placeholder:text-muted-foreground h-full w-full pr-9 pl-3"
                                rdxComboboxInput
                                placeholder="Search a framework…"
                                aria-label="Framework"
                            />
                            <button
                                class="demo-combobox-trigger absolute top-1/2 right-1 inline-flex size-7 -translate-y-1/2 items-center justify-center disabled:pointer-events-none"
                                rdxComboboxTrigger
                                aria-label="Open"
                            >
                                <svg lucideChevronDown size="16"></svg>
                            </button>
                        </div>

                        <div
                            class="z-50 w-64 data-[closed]:pointer-events-none"
                            *rdxComboboxPortal
                            rdxComboboxPositioner
                        >
                            <div
                                class="demo-combobox-popup mt-2 max-h-60 overflow-y-auto p-1 data-[closed]:hidden"
                                rdxComboboxPopup
                            >
                                <div class="flex flex-col" rdxComboboxList aria-label="Frameworks">
                                    @for (framework of frameworks; track framework) {
                                        <div
                                            class="demo-menu-item data-[highlighted]:bg-muted relative flex items-center py-1.5 pr-2 pl-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[selected]:font-medium"
                                            [value]="framework"
                                            rdxComboboxItem
                                        >
                                            <span
                                                class="absolute left-2 flex size-3.5 items-center justify-center"
                                                rdxComboboxItemIndicator
                                            >
                                                <svg lucideCheck size="14"></svg>
                                            </span>
                                            {{ framework }}
                                        </div>
                                    }
                                </div>
                                <div class="demo-combobox-empty data-[empty]:py-6" rdxComboboxEmpty>
                                    No match found.
                                </div>
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

## Setup and shared files

These examples use Angular standalone components and Tailwind CSS v4. Install
`@radix-ng/primitives` and `@lucide/angular`, `@tanstack/angular-virtual`. Copy the component from **Show code** and any shared files below,
preserving their relative import paths. Import the example component in its parent and use its selector.

Install `tailwindcss`, `@tailwindcss/postcss` and `postcss`. Configure the PostCSS plugin:

```json
{ "plugins": { "@tailwindcss/postcss": {} } }
```

Save the CSS below as `demo-styles.css` next to your global stylesheet. Import Tailwind first,
then the demo styles. Both Storybook and Playground use this same CSS through `main.css`.

```css
@import 'tailwindcss';
@import './demo-styles.css';
```

The shared file supplies theme values, light/dark tokens, common classes and animation keyframes.
Set `data-theme="dark"` on `<html>` for the dark theme; the default is light. The font stacks have
system fallbacks; Inter and JetBrains Mono can be self-hosted for the Storybook typography.

<details>
<summary>demo-styles.css</summary>

[Download demo-styles.css](../demo-styles.css)

</details>
