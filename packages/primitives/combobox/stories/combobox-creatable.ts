import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown, LucidePlus, LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoCombobox, demoDialog } from '../../storybook/styles';
import { _importsCombobox } from '../index';

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
    imports: [_importsCombobox, ...dialogImports, LucideChevronDown, LucideCheck, LucidePlus, LucideX],
    template: `
        <div
            [(value)]="value"
            [(open)]="open"
            (onInputValueChange)="query.set($event.value)"
            (onValueChange)="onValueChange($event.value)"
            multiple
            rdxComboboxRoot
        >
            <div [class]="control" rdxComboboxAnchor>
                @if (value().length) {
                    <div [class]="c.chips" rdxComboboxChips>
                        @for (label of value(); track label) {
                            <span [class]="c.chip" [value]="label" rdxComboboxChip>
                                {{ label }}
                                <button [class]="c.chipRemove" rdxComboboxChipRemove aria-label="Remove">
                                    <svg lucideX size="12"></svg>
                                </button>
                            </span>
                        }
                    </div>
                }
                <input
                    [class]="c.inputInline"
                    [placeholder]="value().length ? '' : 'e.g. bug'"
                    rdxComboboxInput
                    aria-label="Labels"
                />
                <button [class]="c.trigger" rdxComboboxTrigger aria-label="Open">
                    <svg lucideChevronDown size="16"></svg>
                </button>
            </div>

            <div *rdxComboboxPortal [class]="c.positioner" rdxComboboxPositioner>
                <div [class]="c.popup" rdxComboboxPopup>
                    <div [class]="c.list" rdxComboboxList aria-label="Labels">
                        @for (label of options(); track label) {
                            <div [class]="c.item" [value]="label" rdxComboboxItem>
                                <span [class]="c.itemIndicator" rdxComboboxItemIndicator>
                                    <svg lucideCheck size="14"></svg>
                                </span>
                                {{ label }}
                            </div>
                        }
                        @if (showCreate()) {
                            <div [class]="c.item" [value]="CREATE" [textValue]="query()" rdxComboboxItem>
                                <span [class]="c.itemIndicator">
                                    <svg lucidePlus size="14"></svg>
                                </span>
                                Create "{{ query().trim() }}"
                            </div>
                        }
                    </div>
                    <div [class]="c.empty" rdxComboboxEmpty>No labels found.</div>
                </div>
            </div>
        </div>

        <div [(open)]="dialogOpen" rdxDialogRoot>
            <ng-template rdxDialogPortal>
                <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxDialogBackdrop></div>
                <div [class]="cn(d.popup, d.popupAnimated)" rdxDialogPopup>
                    <h2 [class]="d.title" rdxDialogTitle>Create new label</h2>
                    <p [class]="d.description" rdxDialogDescription>Add a new label to select.</p>
                    <form (submit)="confirmCreate($event)">
                        <input
                            [class]="dialogInput"
                            [value]="newLabel()"
                            (input)="newLabel.set($any($event.target).value)"
                            placeholder="Label name"
                            aria-label="Label name"
                        />
                        <div [class]="d.footer">
                            <button [class]="cn(b.base, b.outline, b.size.sm)" type="button" rdxDialogClose>
                                Cancel
                            </button>
                            <button [class]="cn(b.base, b.primary, b.size.sm)" type="submit">Create</button>
                        </div>
                    </form>
                </div>
            </ng-template>
        </div>
    `
})
export class ComboboxCreatable {
    protected readonly c = demoCombobox;
    protected readonly d = demoDialog;
    protected readonly b = demoButton;
    protected readonly cn = cn;
    protected readonly CREATE = CREATE;
    protected readonly control = cn(demoCombobox.control, 'h-auto min-h-9 flex-wrap items-center gap-1 py-1 pl-1');
    protected readonly dialogInput = cn(
        'h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none',
        'placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring'
    );

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
