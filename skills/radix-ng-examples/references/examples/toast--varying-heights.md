# Toast — Varying heights

> One example from the [Toast](../components/toast.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

Measured heights feed `--toast-offset-y`, so the expanded stack lines up even with differing heights.

```typescript
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { provideRdxToastManager, RdxToastManager, toastImports } from '@radix-ng/primitives/toast';
import { cn, demoButton, demoToast } from '../../storybook/styles';

/**
 * Each toast's height is measured and shared as `--toast-offset-y`, so the expanded layout lines up
 * even when toasts differ in height. Add a few (the descriptions vary in length), then hover to
 * expand and watch them stack without overlap.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'toast-varying-heights-example',
    imports: [...toastImports],
    providers: [provideRdxToastManager()],
    template: `
        <div class="flex gap-2">
            <button [class]="cn(b.base, b.primary, b.size.md)" (click)="add()">Add toast</button>
            <button [class]="cn(b.base, b.outline, b.size.md)" (click)="manager.close()">Clear all</button>
        </div>

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
export class ToastVaryingHeightsExample {
    protected readonly manager = inject(RdxToastManager);
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly t = demoToast;

    private readonly bodies = [
        'Short and sweet.',
        'A medium-length message that wraps onto a second line to add some height.',
        'A longer notification that spans several lines so the stacking offsets clearly have to account for differing toast heights when the stack is expanded.'
    ];

    private next = 0;

    add(): void {
        const description = this.bodies[this.next % this.bodies.length];
        this.next++;
        this.manager.add({ title: `Toast ${this.next}`, description, timeout: 0 });
    }
}
```
