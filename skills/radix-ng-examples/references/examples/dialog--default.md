# Dialog — Default

> One example from the [Dialog](../components/dialog.md) docs — imports, anatomy, and the data-attribute styling contract live there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

A modal dialog with an accessible title and description, form fields, and close buttons.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog, demoInput } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-dialog-default',
    imports: [...dialogImports, LucideX],
    template: `
        <div rdxDialogRoot>
            <button [class]="cn(b.base, b.primary, b.size.md)" rdxDialogTrigger>Edit profile</button>

            <ng-template rdxDialogPortal>
                <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxDialogBackdrop></div>

                <div [class]="cn(d.popup, d.popupAnimated)" rdxDialogPopup>
                    <h2 [class]="d.title" rdxDialogTitle>Edit profile</h2>
                    <p [class]="d.description" rdxDialogDescription>
                        Make changes to your profile here. Click save when you're done.
                    </p>

                    <label [class]="d.field">
                        Name
                        <input [class]="input" value="Pedro Duarte" />
                    </label>
                    <label [class]="d.field">
                        Username
                        <input [class]="input" value="@peduarte" />
                    </label>

                    <div [class]="d.footer">
                        <button [class]="cn(b.base, b.outline, b.size.sm)" rdxDialogClose>Cancel</button>
                        <button [class]="cn(b.base, b.primary, b.size.sm)" rdxDialogClose>Save changes</button>
                    </div>

                    <button [class]="d.close" aria-label="Close" rdxDialogClose>
                        <svg aria-hidden="true" lucideX size="16" />
                    </button>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDialogDefaultComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
    protected readonly input = demoInput;
}
```
