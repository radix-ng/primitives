import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxSelectGroup,
    RdxSelectGroupLabel,
    RdxSelectItem,
    RdxSelectItemIndicator,
    RdxSelectItemText,
    RdxSelectList,
    RdxSelectPopup,
    RdxSelectPortal,
    RdxSelectPositioner,
    RdxSelectRoot,
    RdxSelectTrigger,
    RdxSelectValue
} from '@radix-ng/primitives/select';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'app-select',
    imports: [
        RdxSelectRoot,
        RdxSelectPortal,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectPopup,
        RdxSelectList,
        RdxSelectPositioner,
        RdxSelectItem,
        RdxSelectItemText,
        RdxSelectItemIndicator,
        RdxSelectGroupLabel,
        RdxSelectGroup
    ],
    template: `
        <ng-container rdxSelectRoot>
            <button aria-label="Choose a fruit" rdxSelectTrigger>
                <span #selectedValue="rdxSelectedValue" rdxSelectValue placeholder="Pick a fruit">
                    {{ selectedValue.slotText() }}
                </span>
                <span aria-hidden="true">▼</span>
            </button>

            <div *rdxSelectPortal [sideOffset]="4" align="start" rdxSelectPositioner>
                <div rdxSelectPopup>
                    <div rdxSelectList>
                        <div rdxSelectGroupLabel>Fruits</div>
                        <div rdxSelectGroup>
                            @for (option of options; track option) {
                                <div [value]="option" rdxSelectItem>
                                    <span rdxSelectItemIndicator>✔</span>
                                    <span rdxSelectItemText>{{ option }}</span>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </ng-container>
    `
})
export default class Page {
    readonly options = ['Apple', 'Banana', 'Blueberry'];
}
