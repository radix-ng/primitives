import { Component } from '@angular/core';
import {
    RdxComboboxEmpty,
    RdxComboboxIcon,
    RdxComboboxInput,
    RdxComboboxItem,
    RdxComboboxItemIndicator,
    RdxComboboxList,
    RdxComboboxPopup,
    RdxComboboxPortal,
    RdxComboboxPortalPresence,
    RdxComboboxPositioner,
    RdxComboboxRoot,
    RdxComboboxTrigger
} from '@radix-ng/primitives/combobox';

@Component({
    selector: 'app-combobox',
    imports: [
        RdxComboboxRoot,
        RdxComboboxInput,
        RdxComboboxTrigger,
        RdxComboboxIcon,
        RdxComboboxPortal,
        RdxComboboxPortalPresence,
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

            <div rdxComboboxPortal>
                <ng-template rdxComboboxPortalPresence>
                    <div rdxComboboxPositioner>
                        <div rdxComboboxPopup>
                            <div rdxComboboxList aria-label="Fruits">
                                @for (option of options; track option) {
                                    <div [value]="option" rdxComboboxItem>
                                        <span rdxComboboxItemIndicator>✔</span>
                                        {{ option }}
                                    </div>
                                }
                            </div>
                            <div rdxComboboxEmpty>No results</div>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export default class Page {
    readonly options = ['Apple', 'Banana', 'Blueberry'];
}
