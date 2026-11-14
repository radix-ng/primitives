import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
    RdxDialogBackdrop,
    RdxDialogClose,
    RdxDialogDescription,
    RdxDialogPopup,
    RdxDialogPortal,
    RdxDialogRoot,
    RdxDialogTitle,
    RdxDialogTrigger
} from '@radix-ng/primitives/dialog';
import {
    RdxSelectItem,
    RdxSelectItemText,
    RdxSelectLabel,
    RdxSelectList,
    RdxSelectPopup,
    RdxSelectPortal,
    RdxSelectPositioner,
    RdxSelectRoot,
    RdxSelectTrigger,
    RdxSelectValue
} from '@radix-ng/primitives/select';

@Component({
    selector: 'consumer-select-dialog',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RdxDialogRoot,
        RdxDialogTrigger,
        RdxDialogPortal,
        RdxDialogBackdrop,
        RdxDialogPopup,
        RdxDialogTitle,
        RdxDialogDescription,
        RdxDialogClose,
        RdxSelectRoot,
        RdxSelectLabel,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectPortal,
        RdxSelectPositioner,
        RdxSelectPopup,
        RdxSelectList,
        RdxSelectItem,
        RdxSelectItemText
    ],
    template: `
        <ng-container rdxDialogRoot>
            <button rdxDialogTrigger>Open dialog</button>
            <ng-template rdxDialogPortal>
                <div class="backdrop" rdxDialogBackdrop></div>
                <div class="dialog" rdxDialogPopup>
                    <h2 rdxDialogTitle>Choose a fruit</h2>
                    <p rdxDialogDescription>Select a fruit, then close this dialog.</p>
                    <ng-container [(value)]="fruit" [multiple]="false" [modal]="false" rdxSelectRoot>
                        <div rdxSelectLabel>Fruit</div>
                        <button rdxSelectTrigger>
                            <span #display="rdxSelectedValue" rdxSelectValue>{{ display.slotText() }}</span>
                        </button>
                        <ng-template rdxSelectPortal>
                            <div class="positioner" sideOffset="4" rdxSelectPositioner>
                                <div class="popup" rdxSelectPopup>
                                    <div rdxSelectList>
                                        @for (item of fruits; track item) {
                                            <div class="item" [value]="item" rdxSelectItem>
                                                <span rdxSelectItemText>{{ item }}</span>
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </ng-template>
                    </ng-container>
                    <button rdxDialogClose>Close dialog</button>
                </div>
            </ng-template>
        </ng-container>
        <output aria-label="Selected fruit">{{ fruit() }}</output>
    `
})
export class SelectDialog {
    readonly fruits = ['Apple', 'Banana', 'Cherry'];
    readonly fruit = signal<string | null>('Apple');
}
