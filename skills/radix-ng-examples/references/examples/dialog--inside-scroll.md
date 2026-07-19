# Dialog — Inside scroll

> One example from the [Dialog](../components/dialog.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.1` — if the installed version differs, verify the API against the installed package.

Keep the popup fixed on screen and scroll an inner region instead.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-dialog-inside-scroll',
    imports: [...dialogImports, LucideX],
    template: `
        <div rdxDialogRoot>
            <button [class]="cn(b.base, b.primary, b.size.md)" rdxDialogTrigger>Open dialog</button>

            <ng-template rdxDialogPortal>
                <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxDialogBackdrop></div>

                <!-- The popup stays fixed on screen; only its body scrolls. -->
                <div [class]="cn(d.popup, d.popupAnimated, 'flex max-h-[85vh] flex-col')" rdxDialogPopup>
                    <h2 [class]="d.title" rdxDialogTitle>Release notes</h2>
                    <p [class]="d.description" rdxDialogDescription>
                        Header and footer stay put while the body scrolls.
                    </p>

                    <div [class]="d.scrollBody">
                        @for (paragraph of paragraphs; track $index) {
                            <p class="mt-3 first:mt-0">{{ paragraph }}</p>
                        }
                    </div>

                    <div [class]="d.footer">
                        <button [class]="cn(b.base, b.primary, b.size.sm)" rdxDialogClose>Got it</button>
                    </div>

                    <button [class]="d.close" aria-label="Close" rdxDialogClose>
                        <svg aria-hidden="true" lucideX size="16" />
                    </button>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDialogInsideScrollComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
    protected readonly paragraphs = Array.from(
        { length: 14 },
        (_, i) => `Change ${i + 1}. Lots of details that overflow the fixed-height popup and scroll inside it.`
    );
}
```
