import { cn, demoButton, demoCombobox, demoDialog } from '../../storybook/styles';
import { _importsCombobox } from '../index';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown, LucidePlus, LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';

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
            multiple
            rdxComboboxRoot
            [(value)]="value"
            [(open)]="open"
            (onInputValueChange)="query.set($event.value)"
            (onValueChange)="onValueChange($event.value)"
        >
            <div rdxComboboxAnchor [class]="control">
                @if (value().length) {
                    <div rdxComboboxChips [class]="c.chips">
                        @for (label of value(); track label) {
                            <span rdxComboboxChip [class]="c.chip" [value]="label">
                                {{ label }}
                                <button rdxComboboxChipRemove aria-label="Remove" [class]="c.chipRemove">
                                    <svg lucideX size="12"></svg>
                                </button>
                            </span>
                        }
                    </div>
                }
                <input
                    rdxComboboxInput
                    aria-label="Labels"
                    [class]="c.inputInline"
                    [placeholder]="value().length ? '' : 'e.g. bug'"
                />
                <button rdxComboboxTrigger aria-label="Open" [class]="c.trigger">
                    <svg lucideChevronDown size="16"></svg>
                </button>
            </div>

            <div *rdxComboboxPortal rdxComboboxPositioner [class]="c.positioner">
                <div rdxComboboxPopup [class]="c.popup">
                    <div rdxComboboxList aria-label="Labels" [class]="c.list">
                        @for (label of options(); track label) {
                            <div rdxComboboxItem [class]="c.item" [value]="label">
                                <span rdxComboboxItemIndicator [class]="c.itemIndicator">
                                    <svg lucideCheck size="14"></svg>
                                </span>
                                {{ label }}
                            </div>
                        }
                        @if (showCreate()) {
                            <div rdxComboboxItem [class]="c.item" [value]="CREATE" [textValue]="query()">
                                <span [class]="c.itemIndicator">
                                    <svg lucidePlus size="14"></svg>
                                </span>
                                Create "{{ query().trim() }}"
                            </div>
                        }
                    </div>
                    <div rdxComboboxEmpty [class]="c.empty">No labels found.</div>
                </div>
            </div>
        </div>

        <div rdxDialogRoot [(open)]="dialogOpen">
            <ng-template rdxDialogPortal>
                <div rdxDialogBackdrop [class]="cn(d.backdrop, d.backdropAnimated)"></div>
                <div rdxDialogPopup [class]="cn(d.popup, d.popupAnimated)">
                    <h2 rdxDialogTitle [class]="d.title">Create new label</h2>
                    <p rdxDialogDescription [class]="d.description">Add a new label to select.</p>
                    <form (submit)="confirmCreate($event)">
                        <input
                            placeholder="Label name"
                            aria-label="Label name"
                            [class]="dialogInput"
                            [value]="newLabel()"
                            (input)="newLabel.set($any($event.target).value)"
                        />
                        <div [class]="d.footer">
                            <button type="button" rdxDialogClose [class]="cn(b.base, b.outline, b.size.sm)">
                                Cancel
                            </button>
                            <button type="submit" [class]="cn(b.base, b.primary, b.size.sm)">Create</button>
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
