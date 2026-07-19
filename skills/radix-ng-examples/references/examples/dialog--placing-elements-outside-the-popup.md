# Dialog — Placing elements outside the popup

> One example from the [Dialog](../components/dialog.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

Make the popup a transparent `pointer-events-none` frame and opt its children back into pointer events
individually, so elements such as a close button can sit outside the visible content card while the gaps
around it stay dismissable.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

/**
 * Placing elements outside the popup — a 1-1 port of the Base UI "uncontained" dialog.
 *
 * The `rdxDialogPopup` is a transparent positioning frame that fills the viewport; its children opt
 * into pointer events individually — the content card and a `Close` button rendered *outside* (above)
 * the card. Keeping the button inside the popup means it stays in the focus trap and is Tab-reachable,
 * even though it sits outside the visible card. Dismiss via Escape, the close button, or pressing the
 * dimmed area around the frame.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-dialog-uncontained',
    imports: [...dialogImports, LucideX],
    template: `
        <div rdxDialogRoot>
            <button [class]="cn(b.base, b.primary, b.size.md)" rdxDialogTrigger>Open dialog</button>

            <ng-template rdxDialogPortal>
                <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxDialogBackdrop></div>

                <div class="fixed inset-0 z-50 grid place-items-center px-4 py-12 xl:py-6" rdxDialogViewport>
                    <!-- Transparent frame: pointer-events-none so the gaps around the card stay dismissable. -->
                    <div
                        class="group/popup pointer-events-none relative flex h-full w-full max-w-[70rem] justify-center transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 xl:max-w-none"
                        rdxDialogPopup
                    >
                        <!-- Rendered outside the card, above its top-right corner. -->
                        <button
                            class="border-border bg-background text-foreground hover:bg-muted pointer-events-auto absolute -top-10 right-0 flex size-8 items-center justify-center rounded-md border shadow-sm xl:top-0"
                            aria-label="Close"
                            rdxDialogClose
                        >
                            <svg aria-hidden="true" lucideX size="16" />
                        </button>

                        <div
                            class="border-border bg-card text-card-foreground pointer-events-auto h-full w-full max-w-[70rem] rounded-md border p-6 shadow-sm transition-[scale] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[starting-style]/popup:scale-105"
                        >
                            <h2 [class]="d.title" rdxDialogTitle>Uncontained dialog</h2>
                            <p [class]="d.description" rdxDialogDescription>
                                The close button lives in the popup but is rendered outside this card, above its
                                top-right corner.
                            </p>
                        </div>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDialogUncontainedComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
}
```
