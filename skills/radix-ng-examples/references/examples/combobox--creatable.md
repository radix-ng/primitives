# Combobox — Creatable

> One example from the [Combobox](../components/combobox.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Lets the user add a value that isn't in the list. When the query matches nothing, a "Create" row
appears; choosing it opens a modal dialog (prefilled with the query) to confirm the new label, which
is then added and selected — mirroring the Base UI pattern.

```typescript
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown, LucidePlus, LucideX } from '@lucide/angular';
import {
    RdxComboboxAnchor,
    RdxComboboxChip,
    RdxComboboxChipRemove,
    RdxComboboxChips,
    RdxComboboxEmpty,
    RdxComboboxInput,
    RdxComboboxItem,
    RdxComboboxItemIndicator,
    RdxComboboxList,
    RdxComboboxPopup,
    RdxComboboxPortal,
    RdxComboboxPositioner,
    RdxComboboxRoot,
    RdxComboboxTrigger
} from '@radix-ng/primitives/combobox';
import {
    RdxDialogBackdrop,
    RdxDialogClose,
    RdxDialogDescription,
    RdxDialogPopup,
    RdxDialogPortal,
    RdxDialogRoot,
    RdxDialogTitle
} from '@radix-ng/primitives/dialog';

/** Sentinel value for the "create" row, intercepted in `onValueChange`. */
const CREATE = '__rdx_create__';

/**
 * Creatable multiselect. When the query matches nothing, a "Create" row appears; choosing it opens a
 * modal dialog (prefilled with the query) to confirm the new label, which is then added and selected.
 * Mirrors the Base UI Creatable example.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'combobox-creatable',
    imports: [
        RdxComboboxRoot,
        RdxComboboxAnchor,
        RdxComboboxInput,
        RdxComboboxTrigger,
        RdxComboboxPortal,
        RdxComboboxPositioner,
        RdxComboboxPopup,
        RdxComboboxList,
        RdxComboboxItem,
        RdxComboboxItemIndicator,
        RdxComboboxEmpty,
        RdxComboboxChips,
        RdxComboboxChip,
        RdxComboboxChipRemove,
        RdxDialogRoot,
        RdxDialogPortal,
        RdxDialogBackdrop,
        RdxDialogPopup,
        RdxDialogTitle,
        RdxDialogDescription,
        RdxDialogClose,
        LucideChevronDown,
        LucideCheck,
        LucidePlus,
        LucideX
    ],
    template: `
        <div
            [(value)]="value"
            [(open)]="open"
            (onInputValueChange)="query.set($event.value)"
            (onValueChange)="onValueChange($event.value)"
            multiple
            rdxComboboxRoot
        >
            <div
                class="demo-combobox-control focus-within:ring-ring focus-within:ring-offset-background relative inline-flex h-9 h-auto min-h-9 w-64 flex-wrap items-center gap-1 py-1 pl-1 focus-within:ring-2 focus-within:ring-offset-2 data-[disabled]:opacity-50"
                rdxComboboxAnchor
            >
                @if (value().length) {
                    <div class="contents" rdxComboboxChips>
                        @for (label of value(); track label) {
                            <span
                                class="demo-combobox-chip inline-flex items-center gap-1 px-1.5 py-0.5"
                                [value]="label"
                                rdxComboboxChip
                            >
                                {{ label }}
                                <button
                                    class="hover:bg-border inline-flex size-3.5 items-center justify-center rounded-full"
                                    rdxComboboxChipRemove
                                    aria-label="Remove"
                                >
                                    <svg lucideX size="12"></svg>
                                </button>
                            </span>
                        }
                    </div>
                }
                <input
                    class="demo-combobox-input-inline placeholder:text-muted-foreground min-w-24 flex-1"
                    [placeholder]="value().length ? '' : 'e.g. bug'"
                    rdxComboboxInput
                    aria-label="Labels"
                />
                <button
                    class="demo-combobox-trigger absolute top-1/2 right-1 inline-flex size-7 -translate-y-1/2 items-center justify-center disabled:pointer-events-none"
                    rdxComboboxTrigger
                    aria-label="Open"
                >
                    <svg lucideChevronDown size="16"></svg>
                </button>
            </div>

            <div class="z-50 w-64 data-[closed]:pointer-events-none" *rdxComboboxPortal rdxComboboxPositioner>
                <div
                    class="demo-combobox-popup mt-2 max-h-60 overflow-y-auto p-1 data-[closed]:hidden"
                    rdxComboboxPopup
                >
                    <div class="flex flex-col" rdxComboboxList aria-label="Labels">
                        @for (label of options(); track label) {
                            <div
                                class="demo-menu-item data-[highlighted]:bg-muted relative flex items-center py-1.5 pr-2 pl-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[selected]:font-medium"
                                [value]="label"
                                rdxComboboxItem
                            >
                                <span
                                    class="absolute left-2 flex size-3.5 items-center justify-center"
                                    rdxComboboxItemIndicator
                                >
                                    <svg lucideCheck size="14"></svg>
                                </span>
                                {{ label }}
                            </div>
                        }
                        @if (showCreate()) {
                            <div
                                class="demo-menu-item data-[highlighted]:bg-muted relative flex items-center py-1.5 pr-2 pl-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[selected]:font-medium"
                                [value]="CREATE"
                                [textValue]="query()"
                                rdxComboboxItem
                            >
                                <span class="absolute left-2 flex size-3.5 items-center justify-center">
                                    <svg lucidePlus size="14"></svg>
                                </span>
                                Create "{{ query().trim() }}"
                            </div>
                        }
                    </div>
                    <div class="demo-combobox-empty data-[empty]:py-6" rdxComboboxEmpty>No labels found.</div>
                </div>
            </div>
        </div>

        <div [(open)]="dialogOpen" rdxDialogRoot>
            <ng-template rdxDialogPortal>
                <div
                    class="bg-foreground/50 data-[open]:animate-dialog-overlay-in data-[closed]:animate-dialog-overlay-out fixed inset-0 z-50"
                    rdxDialogBackdrop
                ></div>
                <div
                    class="demo-surface data-[open]:animate-dialog-popup-in data-[closed]:animate-dialog-popup-out fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 p-6 transition-[transform,scale] focus:outline-none data-[nested-dialog-open]:scale-[0.96]"
                    rdxDialogPopup
                >
                    <h2 class="demo-dialog-title" rdxDialogTitle>Create new label</h2>
                    <p class="text-muted-foreground mt-1.5 text-sm" rdxDialogDescription>Add a new label to select.</p>
                    <form (submit)="confirmCreate($event)">
                        <input
                            class="border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2"
                            [value]="newLabel()"
                            (input)="newLabel.set($any($event.target).value)"
                            placeholder="Label name"
                            aria-label="Label name"
                        />
                        <div class="mt-6 flex justify-end gap-2">
                            <button
                                class="demo-button demo-button-outline h-8 px-3 text-xs"
                                type="button"
                                rdxDialogClose
                            >
                                Cancel
                            </button>
                            <button class="demo-button demo-button-primary h-8 px-3 text-xs" type="submit">
                                Create
                            </button>
                        </div>
                    </form>
                </div>
            </ng-template>
        </div>
    `
})
export class ComboboxCreatable {
    protected readonly CREATE = CREATE;

    readonly value = signal<string[]>([]);
    readonly open = signal(false);
    readonly query = signal('');
    readonly options = signal<string[]>(['bug', 'documentation', 'enhancement', 'help wanted', 'good first issue']);

    readonly dialogOpen = signal(false);
    readonly newLabel = signal('');

    readonly showCreate = computed(() => {
        const q = this.query().trim().toLowerCase();
        return q !== '' && !this.options().some((label) => label.toLowerCase() === q);
    });

    onValueChange(next: unknown): void {
        const arr = (next as string[]) ?? [];
        if (arr.includes(CREATE)) {
            // Don't add the sentinel — open the create dialog prefilled with the current query.
            this.value.set(arr.filter((v) => v !== CREATE));
            this.newLabel.set(this.query().trim());
            this.open.set(false);
            this.dialogOpen.set(true);
        }
    }

    confirmCreate(event: Event): void {
        event.preventDefault();
        const label = this.newLabel().trim();
        if (!label) {
            return;
        }
        if (!this.options().some((l) => l.toLowerCase() === label.toLowerCase())) {
            this.options.update((options) => [...options, label]);
        }
        if (!this.value().includes(label)) {
            this.value.update((value) => [...value, label]);
        }
        this.dialogOpen.set(false);
        this.query.set('');
    }
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular`, `@tanstack/angular-virtual` when an example imports them.
