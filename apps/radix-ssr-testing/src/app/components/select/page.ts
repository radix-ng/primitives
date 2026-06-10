import { Component } from '@angular/core';
import {
    RdxSelectContent,
    RdxSelectGroup,
    RdxSelectItem,
    RdxSelectItemIndicator,
    RdxSelectItemText,
    RdxSelectLabel,
    RdxSelectPopperPositionContent,
    RdxSelectPopperPositionWrapper,
    RdxSelectPortal,
    RdxSelectPortalPresence,
    RdxSelectRoot,
    RdxSelectTrigger,
    RdxSelectValue,
    RdxSelectViewport
} from '@radix-ng/primitives/select';

@Component({
    selector: 'app-select',
    imports: [
        RdxSelectRoot,
        RdxSelectPortal,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectPortalPresence,
        RdxSelectContent,
        RdxSelectViewport,
        RdxSelectPopperPositionWrapper,
        RdxSelectPopperPositionContent,
        RdxSelectItem,
        RdxSelectItemText,
        RdxSelectItemIndicator,
        RdxSelectLabel,
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
                    <div rdxSelectContent>
                        <div [sideOffset]="4" align="start" rdxSelectPopperPositionWrapper>
                            <div rdxSelectPopperPositionContent>
                                <div rdxSelectViewport>
                                    <div rdxSelectLabel>Fruits</div>
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
