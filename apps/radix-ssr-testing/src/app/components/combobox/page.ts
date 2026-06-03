import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxComboboxEmpty,
    RdxComboboxIcon,
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

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'app-combobox',
    imports: [
        RdxComboboxRoot,
        RdxComboboxInput,
        RdxComboboxTrigger,
        RdxComboboxIcon,
        RdxComboboxPortal,
        RdxComboboxPositioner,
        RdxComboboxPopup,
        RdxComboboxList,
        RdxComboboxItem,
        RdxComboboxItemIndicator,
        RdxComboboxEmpty
    ],
    template: `
        <div rdxComboboxRoot>
            <input rdxComboboxInput placeholder="Pick a fruit" aria-label="Fruit" />
            <button rdxComboboxTrigger aria-label="Open">
                <span rdxComboboxIcon aria-hidden="true">▼</span>
            </button>

            <div *rdxComboboxPortal rdxComboboxPositioner>
                <div rdxComboboxPopup>
                    <div rdxComboboxList aria-label="Fruits">
                        @for (option of options; track option) {
                            <div rdxComboboxItem [value]="option">
                                <span rdxComboboxItemIndicator>✔</span>
                                {{ option }}
                            </div>
                        }
                    </div>
                    <div rdxComboboxEmpty>No results</div>
                </div>
            </div>
        </div>
    `
})
export default class Page {
    readonly options = ['Apple', 'Banana', 'Blueberry'];
}
