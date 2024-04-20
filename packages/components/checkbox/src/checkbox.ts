import { ChangeDetectorRef, Component, Input } from '@angular/core';

import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { radixCheck } from '@ng-icons/radix-icons';
import { CheckboxDirective, CheckboxIndicatorDirective } from '@radix-ng/primitives/checkbox';
import { LabelDirective } from '@radix-ng/primitives/label';

@Component({
    selector: 'rdx-checkbox',
    exportAs: 'rdxCheckbox',
    standalone: true,
    imports: [LabelDirective, CheckboxDirective, CheckboxIndicatorDirective, NgIconComponent],
    providers: [provideIcons({ radixCheck })],
    styleUrl: 'style.css',
    template: `
        <label rdxLabel class="Label">
            <button
                class="CheckboxRoot"
                rdxCheckbox
                [(checked)]="checked"
                (checkedChange)="toggleChecked()"
            >
                <ng-icon rdxCheckboxIndicator class="CheckboxIndicator" name="radixCheck"></ng-icon>
                <input
                    type="checkbox"
                    aria-hidden="true"
                    tabindex="-1"
                    value="on"
                    rdxCheckboxIndicator
                    class="Input"
                />
            </button>
            <ng-content></ng-content>
        </label>
    `
})
export class RdxCheckboxComponent {
    @Input()
    get checked(): boolean {
        return this._checked;
    }

    set checked(value: boolean) {
        if (value !== this.checked) {
            this._checked = value;
            this.changeDetectorRef.markForCheck();
        }
    }

    private _checked = false;

    constructor(private changeDetectorRef: ChangeDetectorRef) {}

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    toggleChecked() {}
}
