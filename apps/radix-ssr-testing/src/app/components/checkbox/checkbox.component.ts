import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import {
    RdxCheckboxButtonDirective,
    RdxCheckboxDirective,
    RdxCheckboxIndicatorDirective
} from '@radix-ng/primitives/checkbox';

@Component({
    selector: 'app-avatar',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RdxCheckboxDirective, RdxCheckboxButtonDirective, RdxCheckboxIndicatorDirective],
    template: `
        <div [checked]="checked()" (checkedChange)="onChange($event)" rdxCheckboxRoot>
            <button rdxCheckboxButton>
                [
                @if (checked()) {
                    <span rdxCheckboxIndicator>✔</span>
                }
                ]
            </button>
        </div>
    `
})
export default class CheckboxComponent {
    readonly checked = model<boolean>(false);

    protected onChange(event: boolean): void {
        this.checked.set(event);
    }
}
