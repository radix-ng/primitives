import { cn, demoButton, demoToast } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LucideCircleCheck, LucideCircleX, LucideInfo } from '@lucide/angular';
import { provideRdxToastManager, RdxToastManager, toastImports } from '@radix-ng/primitives/toast';

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
            <div rdxToastViewport [class]="t.viewport">
                @for (toast of manager.toasts(); track toast.id) {
                    <div rdxToastRoot [class]="t.root" [toast]="toast">
                        <div rdxToastContent [class]="t.content">
                            @switch (toast.type) {
                                @case ('success') {
                                    <svg lucideCircleCheck [class]="cn(t.icon, 'text-foreground')"></svg>
                                }
                                @case ('error') {
                                    <svg lucideCircleX [class]="cn(t.icon, 'text-destructive')"></svg>
                                }
                                @default {
                                    <svg lucideInfo [class]="cn(t.icon, 'text-muted-foreground')"></svg>
                                }
                            }
                            <div class="min-w-0 flex-1">
                                <p rdxToastTitle [class]="t.title">{{ toast.title }}</p>
                                <p rdxToastDescription [class]="t.description">{{ toast.description }}</p>
                            </div>
                            <button aria-label="Dismiss" rdxToastClose [class]="t.close">✕</button>
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
