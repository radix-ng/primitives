import { Component } from '@angular/core';
import {
    RdxSelectGroup,
    RdxSelectGroupLabel,
    RdxSelectItem,
    RdxSelectItemIndicator,
    RdxSelectItemText,
    RdxSelectList,
    RdxSelectPopup,
    RdxSelectPortal,
    RdxSelectPortalPresence,
    RdxSelectPositioner,
    RdxSelectPositionerContent,
    RdxSelectRoot,
    RdxSelectTrigger,
    RdxSelectValue
} from '@radix-ng/primitives/select';

@Component({
    selector: 'app-select',
    imports: [
        RdxSelectRoot,
        RdxSelectPortal,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectPortalPresence,
        RdxSelectPopup,
        RdxSelectList,
        RdxSelectPositioner,
        RdxSelectPositionerContent,
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

            <div rdxSelectPortal>
                <ng-template rdxSelectPortalPresence>
                    <div rdxSelectPopup>
                        <div [sideOffset]="4" align="start" rdxSelectPositioner>
                            <div rdxSelectPositionerContent>
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
                    </div>
                </ng-template>
            </div>
        </ng-container>
    `
})
export default class Page {
    readonly options = ['Apple', 'Banana', 'Blueberry'];
}
