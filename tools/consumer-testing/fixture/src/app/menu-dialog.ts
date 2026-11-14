import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    createRdxDialogHandle,
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
    RdxMenuItem,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRoot,
    RdxMenuTrigger
} from '@radix-ng/primitives/menu';

@Component({
    selector: 'consumer-menu-dialog',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RdxMenuRoot,
        RdxMenuTrigger,
        RdxMenuPortal,
        RdxMenuPositioner,
        RdxMenuPopup,
        RdxMenuItem,
        RdxDialogRoot,
        RdxDialogTrigger,
        RdxDialogPortal,
        RdxDialogBackdrop,
        RdxDialogPopup,
        RdxDialogTitle,
        RdxDialogDescription,
        RdxDialogClose
    ],
    template: `
        <ng-container rdxMenuRoot>
            <button rdxMenuTrigger>Document actions</button>
            <ng-template rdxMenuPortal>
                <div class="positioner" align="start" sideOffset="4" rdxMenuPositioner>
                    <div class="popup" rdxMenuPopup>
                        <button class="item" [handle]="dialog" rdxMenuItem rdxDialogTrigger>Rename document…</button>
                        <button class="item" rdxMenuItem>Duplicate</button>
                    </div>
                </div>
            </ng-template>
        </ng-container>
        <ng-container [handle]="dialog" rdxDialogRoot>
            <ng-template rdxDialogPortal>
                <div class="backdrop" rdxDialogBackdrop></div>
                <div class="dialog" rdxDialogPopup>
                    <h2 rdxDialogTitle>Rename document</h2>
                    <p rdxDialogDescription>Focus stays in this dialog while the menu finishes closing.</p>
                    <label for="document-name">Document name</label>
                    <input id="document-name" value="Project notes" />
                    <div class="actions">
                        <button rdxDialogClose>Cancel</button>
                        <button rdxDialogClose>Save</button>
                    </div>
                </div>
            </ng-template>
        </ng-container>
    `
})
export class MenuDialog {
    readonly dialog = createRdxDialogHandle();
}
