import { Component } from '@angular/core';
import { LucideDynamicIcon, LucideX as X } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';

@Component({
    selector: 'dialog-demo',
    standalone: true,
    imports: [...dialogImports, LucideDynamicIcon],
    styleUrl: 'dialog-demo.css',
    template: `
        <div rdxDialogRoot>
            <button class="Button violet" rdxDialogTrigger>Open Dialog</button>

            <ng-template rdxDialogPortalPresence>
                <div rdxDialogPortal>
                    <div class="DialogOverlay" rdxDialogBackdrop></div>
                    <div class="DialogContent" rdxDialogPopup>
                        <h2 class="DialogTitle" rdxDialogTitle>Edit profile</h2>
                        <p class="DialogDescription" rdxDialogDescription>
                            Make changes to your profile here. Click save when you're done.
                        </p>
                        <fieldset class="Fieldset">
                            <label class="Label" htmlFor="name">Name</label>
                            <input class="Input" id="name" defaultValue="Pedro Duarte" />
                        </fieldset>
                        <fieldset class="Fieldset">
                            <label class="Label" htmlFor="username">Username</label>
                            <input class="Input" id="username" defaultValue="@peduarte" />
                        </fieldset>
                        <div style="display:flex; margin-top: 25px; justify-content: flex-end;">
                            <button class="Button green" rdxDialogClose>Save changes</button>
                        </div>
                        <button class="IconButton" rdxDialogClose aria-label="Close">
                            <svg [lucideIcon]="XIcon" size="16" strokeWidth="2" />
                        </button>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class DialogDemoComponent {
    readonly XIcon = X;
}

export default DialogDemoComponent;
