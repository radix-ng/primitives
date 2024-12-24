import { Component } from '@angular/core';
import {
    RdxDialogCloseDirective,
    RdxDialogContentDirective,
    RdxDialogDescriptionDirective,
    RdxDialogTitleDirective,
    RdxDialogTriggerDirective
} from '@radix-ng/primitives/dialog';
import { LucideAngularModule, X } from 'lucide-angular';

@Component({
    selector: 'dialog-demo',
    standalone: true,
    imports: [
        RdxDialogTriggerDirective,
        RdxDialogContentDirective,
        RdxDialogTitleDirective,
        RdxDialogCloseDirective,
        RdxDialogDescriptionDirective,
        LucideAngularModule
    ],
    styleUrl: 'dialog-demo.css',
    template: `
        <button class="Button violet" [rdxDialogTrigger]="dialog">Open Dialog</button>

        <ng-template #dialog>
            <div class="DialogContent" rdxDialogContent>
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
                    <lucide-angular [img]="XIcon" size="16" strokeWidth="2" />
                </button>
            </div>
        </ng-template>
    `
})
export class DialogDemoComponent {
    readonly XIcon = X;
}

export default DialogDemoComponent;
