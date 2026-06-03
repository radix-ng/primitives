import { demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideArrowRight } from '@lucide/angular';

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
            selectionMode="none"
            autoHighlight="always"
            rdxComboboxRoot
            (onValueChange)="run($event.value)"
        >
            <div [class]="c.control">
                <input rdxComboboxInput placeholder="Run a command…" aria-label="Command" [class]="c.input" />
            </div>

            <div *rdxComboboxPortal rdxComboboxPositioner [class]="c.positioner">
                <div rdxComboboxPopup [class]="c.popup">
                    <div rdxComboboxList aria-label="Commands" [class]="c.list">
                        @for (command of commands; track command) {
                            <div rdxComboboxItem [class]="c.item" [value]="command">
                                <span [class]="c.itemIndicator">
                                    <svg lucideArrowRight size="14"></svg>
                                </span>
                                {{ command }}
                            </div>
                        }
                    </div>
                    <div rdxComboboxEmpty [class]="c.empty">No commands.</div>
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
