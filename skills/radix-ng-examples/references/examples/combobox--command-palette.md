# Combobox — Command palette

> One example from the [Combobox](../components/combobox.md) docs — imports, anatomy, and the data-attribute styling contract live there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

`selectionMode="none"` filters without committing a value — selecting an item emits `onValueChange`
as an activation signal and (by default) fills the input. Paired with `autoHighlight="always"` so the
first match is always ready for `Enter`.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideArrowRight } from '@lucide/angular';
import { demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';

/**
 * A command/search palette: `selectionMode="none"` (no value is committed — it filters and runs an
 * action) with `autoHighlight="always"` (the first match is always highlighted, so Enter runs it).
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'combobox-command',
    imports: [_importsCombobox, LucideArrowRight],
    template: `
        <div
            class="flex w-64 flex-col gap-2"
            (onValueChange)="run($event.value)"
            selectionMode="none"
            autoHighlight="always"
            rdxComboboxRoot
        >
            <div [class]="c.control">
                <input [class]="c.input" rdxComboboxInput placeholder="Run a command…" aria-label="Command" />
            </div>

            <div *rdxComboboxPortal [class]="c.positioner" rdxComboboxPositioner>
                <div [class]="c.popup" rdxComboboxPopup>
                    <div [class]="c.list" rdxComboboxList aria-label="Commands">
                        @for (command of commands; track command) {
                            <div [class]="c.item" [value]="command" rdxComboboxItem>
                                <span [class]="c.itemIndicator">
                                    <svg lucideArrowRight size="14"></svg>
                                </span>
                                {{ command }}
                            </div>
                        }
                    </div>
                    <div [class]="c.empty" rdxComboboxEmpty>No commands.</div>
                </div>
            </div>

            <p class="text-muted-foreground text-sm">
                Last run:
                <code>{{ lastRun() ?? '—' }}</code>
            </p>
        </div>
    `
})
export class ComboboxCommand {
    protected readonly c = demoCombobox;
    readonly lastRun = signal<string | null>(null);
    readonly commands = ['New File', 'Open Folder', 'Save All', 'Toggle Terminal', 'Find in Files'];

    run(command: unknown): void {
        this.lastRun.set(typeof command === 'string' ? command : null);
    }
}
```
