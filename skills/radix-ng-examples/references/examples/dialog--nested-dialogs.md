# Dialog — Nested dialogs

> One example from the [Dialog](../components/dialog.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

Dialogs can be nested. The parent popup gains `data-nested-dialog-open` and the child popup gains
`data-nested`, which the demo uses to scale the parent back.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-dialog-nested',
    imports: [...dialogImports, LucideX],
    template: `
        <div rdxDialogRoot>
            <button [class]="cn(b.base, b.primary, b.size.md)" rdxDialogTrigger>Open dialog</button>

            <ng-template rdxDialogPortal>
                <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxDialogBackdrop></div>

                <div [class]="cn(d.popup, d.popupAnimated)" rdxDialogPopup>
                    <h2 [class]="d.title" rdxDialogTitle>Parent dialog</h2>
                    <p [class]="d.description" rdxDialogDescription>
                        Opening the nested dialog scales this popup back via
                        <code>[data-nested-dialog-open]</code>
                        .
                    </p>

                    <div [class]="d.footer">
                        <button [class]="cn(b.base, b.outline, b.size.sm)" rdxDialogClose>Close</button>

                        <div rdxDialogRoot>
                            <button [class]="cn(b.base, b.primary, b.size.sm)" rdxDialogTrigger>Open nested</button>

                            <ng-template rdxDialogPortal>
                                <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxDialogBackdrop></div>
                                <div [class]="cn(d.popup, d.popupAnimated)" rdxDialogPopup>
                                    <h2 [class]="d.title" rdxDialogTitle>Nested dialog</h2>
                                    <p [class]="d.description" rdxDialogDescription>
                                        Escape or the backdrop closes this one first, then the parent.
                                    </p>
                                    <div [class]="d.footer">
                                        <button [class]="cn(b.base, b.primary, b.size.sm)" rdxDialogClose>Done</button>
                                    </div>
                                    <button [class]="d.close" aria-label="Close" rdxDialogClose>
                                        <svg aria-hidden="true" lucideX size="16" />
                                    </button>
                                </div>
                            </ng-template>
                        </div>
                    </div>

                    <button [class]="d.close" aria-label="Close" rdxDialogClose>
                        <svg aria-hidden="true" lucideX size="16" />
                    </button>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDialogNestedComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
}
```
