# Toast — Types

> One example from the [Toast](../components/toast.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

Branch on a free-form `type` to render an icon, and raise `priority` to `high` for assertive errors.

```typescript
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LucideCircleCheck, LucideCircleX, LucideInfo } from '@lucide/angular';
import { provideRdxToastManager, RdxToastManager, toastImports } from '@radix-ng/primitives/toast';
import { cn, demoButton, demoToast } from '../../storybook/styles';

/**
 * `type` is a free-form category surfaced back on the toast object — branch on it in the template
 * (here via an icon) and style with `[data-type]` on the root. `priority: 'high'` switches the
 * announcement role to `alert` (assertive) for errors.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'toast-types-example',
    imports: [...toastImports, LucideCircleCheck, LucideCircleX, LucideInfo],
    providers: [provideRdxToastManager()],
    template: `
        <div class="flex gap-2">
            <button [class]="cn(b.base, b.outline, b.size.md)" (click)="success()">Success</button>
            <button [class]="cn(b.base, b.outline, b.size.md)" (click)="error()">Error</button>
            <button [class]="cn(b.base, b.outline, b.size.md)" (click)="info()">Info</button>
        </div>

        <div rdxToastPortal>
            <div [class]="t.viewport" rdxToastViewport>
                @for (toast of manager.toasts(); track toast.id) {
                    <div [class]="t.root" [toast]="toast" rdxToastRoot>
                        <div [class]="t.content" rdxToastContent>
                            @switch (toast.type) {
                                @case ('success') {
                                    <svg [class]="cn(t.icon, 'text-foreground')" lucideCircleCheck></svg>
                                }
                                @case ('error') {
                                    <svg [class]="cn(t.icon, 'text-destructive')" lucideCircleX></svg>
                                }
                                @default {
                                    <svg [class]="cn(t.icon, 'text-muted-foreground')" lucideInfo></svg>
                                }
                            }
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
export class ToastTypesExample {
    protected readonly manager = inject(RdxToastManager);
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly t = demoToast;

    success(): void {
        this.manager.add({ type: 'success', title: 'Saved', description: 'Your changes are live.' });
    }

    error(): void {
        this.manager.add({
            type: 'error',
            title: 'Something went wrong',
            description: 'Please try again.',
            priority: 'high'
        });
    }

    info(): void {
        this.manager.add({ type: 'info', title: 'Heads up', description: 'A new version is available.' });
    }
}
```
