# Toast — Deduplicated

> One example from the [Toast](../components/toast.md) docs — imports, anatomy, and the data-attribute styling contract live there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

Pass a fixed `id` to upsert a single toast in place instead of stacking duplicates.

```typescript
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { provideRdxToastManager, RdxToastManager, toastImports } from '@radix-ng/primitives/toast';
import { cn, demoButton, demoToast } from '../../storybook/styles';

/**
 * Passing a fixed `id` upserts instead of stacking — repeated calls update the same toast in place
 * rather than piling up duplicates. Bumping `updateKey` replays the enter animation, so a rapid
 * second click visibly pulses the existing toast; its auto-dismiss timer restarts each time.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'toast-deduplicated-example',
    imports: [...toastImports],
    providers: [provideRdxToastManager()],
    template: `
        <button [class]="cn(b.base, b.primary, b.size.md)" (click)="copy()">Copy link</button>

        <div rdxToastPortal>
            <div [class]="t.viewport" rdxToastViewport>
                @for (toast of manager.toasts(); track toast.id) {
                    <div [class]="t.root" [toast]="toast" rdxToastRoot>
                        <div [class]="t.content" rdxToastContent>
                            <div class="min-w-0 flex-1">
                                <p [class]="t.title" rdxToastTitle>{{ toast.title }}</p>
                                <p [class]="t.description" rdxToastDescription>{{ toast.description }}</p>
                            </div>
                            <button [class]="t.close" aria-label="Dismiss" rdxToastClose>✕</button>
                        </div>
                    </div>
                }
            </div>
        </div>
    `
})
export class ToastDeduplicatedExample {
    protected readonly manager = inject(RdxToastManager);
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly t = demoToast;

    private times = 0;

    copy(): void {
        this.times++;
        this.manager.add({
            id: 'clipboard',
            title: 'Link copied',
            description: this.times === 1 ? 'Copied to clipboard.' : `Copied ${this.times} times.`,
            updateKey: this.times
        });
    }
}
```
