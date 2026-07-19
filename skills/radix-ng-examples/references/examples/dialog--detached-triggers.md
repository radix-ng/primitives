# Dialog — Detached triggers

> One example from the [Dialog](../components/dialog.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

Create a shared handle with `createRdxDialogHandle()` when triggers live outside `rdxDialogRoot`. The
handle also supports imperative `open(id)`, `toggle(id)`, and `close()`.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { createRdxDialogHandle, dialogImports } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-dialog-detached',
    imports: [...dialogImports, LucideX],
    template: `
        <div class="flex flex-col items-center gap-3">
            <!-- Triggers live outside the root and are linked through a shared handle. -->
            <div class="flex gap-2">
                <button id="settings" [class]="cn(b.base, b.outline, b.size.md)" [handle]="handle" rdxDialogTrigger>
                    Settings
                </button>
                <button id="profile" [class]="cn(b.base, b.outline, b.size.md)" [handle]="handle" rdxDialogTrigger>
                    Profile
                </button>
            </div>

            <button [class]="cn(b.base, b.secondary, b.size.sm)" (click)="handle.open('profile')">
                Open profile imperatively
            </button>

            <div [handle]="handle" rdxDialogRoot>
                <ng-template rdxDialogPortal>
                    <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxDialogBackdrop></div>
                    <div [class]="cn(d.popup, d.popupAnimated)" rdxDialogPopup>
                        <h2 [class]="d.title" rdxDialogTitle>Detached triggers</h2>
                        <p [class]="d.description" rdxDialogDescription>
                            The triggers and this dialog are connected with
                            <code>createRdxDialogHandle()</code>
                            rather than DOM nesting.
                        </p>
                        <div [class]="d.footer">
                            <button [class]="cn(b.base, b.primary, b.size.sm)" rdxDialogClose>Close</button>
                        </div>
                        <button [class]="d.close" aria-label="Close" rdxDialogClose>
                            <svg aria-hidden="true" lucideX size="16" />
                        </button>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class RdxDialogDetachedComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
    protected readonly handle = createRdxDialogHandle();
}
```
