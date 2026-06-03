import { demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'combobox-reactive-forms',
    imports: [_importsCombobox, ReactiveFormsModule, LucideChevronDown, LucideCheck],
    template: `
        <form class="flex flex-col gap-3">
            <div rdxComboboxRoot [formControl]="fruit">
                <div [class]="c.control">
                    <input rdxComboboxInput placeholder="Pick a fruit…" aria-label="Fruit" [class]="c.input" />
                    <button rdxComboboxTrigger aria-label="Open" [class]="c.trigger">
                        <svg lucideChevronDown size="16"></svg>
                    </button>
                </div>

                <div *rdxComboboxPortal rdxComboboxPositioner [class]="c.positioner">
                    <div rdxComboboxPopup [class]="c.popup">
                        <div rdxComboboxList aria-label="Fruits" [class]="c.list">
                            @for (f of fruits; track f) {
                                <div rdxComboboxItem [class]="c.item" [value]="f">
                                    <span rdxComboboxItemIndicator [class]="c.itemIndicator">
                                        <svg lucideCheck size="14"></svg>
                                    </span>
                                    {{ f }}
                                </div>
                            }
                        </div>
                        <div rdxComboboxEmpty [class]="c.empty">No fruit found.</div>
                    </div>
                </div>
            </div>

            <p class="text-muted-foreground text-sm">
                Value:
                <code>{{ fruit.value ?? 'null' }}</code>
            </p>
        </form>
    `
})
export class ComboboxReactiveForms {
    protected readonly c = demoCombobox;
    readonly fruit = new FormControl<string | null>('Banana');
    readonly fruits = ['Apple', 'Banana', 'Blueberry', 'Grape', 'Orange'];
}
