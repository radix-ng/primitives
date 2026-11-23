# Alert Dialog — Controlled mode with multiple triggers

> One example from the [Alert Dialog](../components/alert-dialog.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Bind both `[(open)]` and `[(triggerId)]` to choose which trigger is active from component state.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
    RdxAlertDialogBackdrop,
    RdxAlertDialogClose,
    RdxAlertDialogDescription,
    RdxAlertDialogPopup,
    RdxAlertDialogPortal,
    RdxAlertDialogRoot,
    RdxAlertDialogTitle,
    RdxAlertDialogTrigger
} from '@radix-ng/primitives/alert-dialog';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-alert-dialog-controlled-multiple',
    imports: [
        RdxAlertDialogRoot,
        RdxAlertDialogTrigger,
        RdxAlertDialogPortal,
        RdxAlertDialogBackdrop,
        RdxAlertDialogPopup,
        RdxAlertDialogTitle,
        RdxAlertDialogDescription,
        RdxAlertDialogClose
    ],
    template: `
        <div class="flex flex-col items-center gap-3">
            <p class="text-muted-foreground text-xs">open: {{ open() }} · triggerId: {{ triggerId() ?? '—' }}</p>

            <div [(open)]="open" [(triggerId)]="triggerId" rdxAlertDialogRoot>
                <div class="flex gap-2">
                    <button class="demo-button demo-button-outline h-9 px-4" id="logout" rdxAlertDialogTrigger>
                        Log out
                    </button>
                    <button class="demo-button demo-button-outline h-9 px-4" id="delete" rdxAlertDialogTrigger>
                        Delete account
                    </button>
                </div>

                <ng-template rdxAlertDialogPortal>
                    <div
                        class="bg-foreground/50 data-[open]:animate-dialog-overlay-in data-[closed]:animate-dialog-overlay-out fixed inset-0 z-50"
                        rdxAlertDialogBackdrop
                    ></div>
                    <div
                        class="demo-popup data-[open]:animate-dialog-popup-in data-[closed]:animate-dialog-popup-out fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 p-6 transition-[transform,scale] focus:outline-none data-[nested-dialog-open]:scale-[0.96]"
                        rdxAlertDialogPopup
                    >
                        <h2 class="demo-dialog-title" rdxAlertDialogTitle>
                            {{ triggerId() === 'delete' ? 'Delete account?' : 'Log out?' }}
                        </h2>
                        <p class="text-muted-foreground mt-1.5 text-sm" rdxAlertDialogDescription>
                            Both
                            <code>open</code>
                            and
                            <code>triggerId</code>
                            are bound, so the active action is driven from component state.
                        </p>
                        <div class="mt-6 flex justify-end gap-2">
                            <button class="demo-button demo-button-outline h-8 px-3 text-xs" rdxAlertDialogClose>
                                Cancel
                            </button>
                            <button
                                class="demo-button h-8 px-3 text-xs"
                                [class]="triggerId() === 'delete' ? 'demo-button-destructive' : 'demo-button-primary'"
                                rdxAlertDialogClose
                            >
                                {{ triggerId() === 'delete' ? 'Delete' : 'Log out' }}
                            </button>
                        </div>
                    </div>
                </ng-template>
            </div>

            <button class="demo-button demo-button-secondary h-8 px-3 text-xs" (click)="confirmDelete()">
                Delete externally
            </button>
        </div>
    `
})
export class RdxAlertDialogControlledMultipleComponent {
    protected readonly open = signal(false);
    protected readonly triggerId = signal<string | null>(null);

    protected confirmDelete() {
        this.triggerId.set('delete');
        this.open.set(true);
    }
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
