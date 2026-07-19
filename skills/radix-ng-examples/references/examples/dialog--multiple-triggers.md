# Dialog — Multiple triggers

> One example from the [Dialog](../components/dialog.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

Several `rdxDialogTrigger` buttons can open the same dialog. The active trigger and its `payload` are
exposed on the root so the content can adapt.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-dialog-multiple-triggers',
    imports: [...dialogImports, LucideX],
    template: `
        <div #root="rdxDialogRoot" rdxDialogRoot>
            <div class="flex gap-2">
                <button [class]="cn(b.base, b.outline, b.size.md)" payload="Lemon" rdxDialogTrigger>Lemon</button>
                <button [class]="cn(b.base, b.outline, b.size.md)" payload="Lime" rdxDialogTrigger>Lime</button>
                <button [class]="cn(b.base, b.outline, b.size.md)" payload="Orange" rdxDialogTrigger>Orange</button>
            </div>

            <ng-template rdxDialogPortal>
                <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxDialogBackdrop></div>
                <div [class]="cn(d.popup, d.popupAnimated)" rdxDialogPopup>
                    <h2 [class]="d.title" rdxDialogTitle>{{ root.payload() || 'Fruit' }}</h2>
                    <p [class]="d.description" rdxDialogDescription>
                        Every trigger opens the same dialog; the active trigger's
                        <code>payload</code>
                        is shown here.
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
    `
})
export class RdxDialogMultipleTriggersComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
}
```
