import { cn, demoButton, demoToast } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { provideRdxToastManager, RdxToastManager, toastImports } from '@radix-ng/primitives/toast';

/**
 * Push several toasts to see the collapsed stack, then hover (or focus) the stack to expand it —
 * `data-expanded` lays each toast out by its measured `--toast-offset-y`. Auto-dismiss pauses
 * while the stack is hovered or focused.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'toast-stacking-example',
    imports: [...toastImports],
    providers: [provideRdxToastManager()],
    template: `
        <div class="flex gap-2">
            <button [class]="cn(b.base, b.primary, b.size.md)" (click)="add()">Add toast</button>
            <button [class]="cn(b.base, b.outline, b.size.md)" (click)="manager.close()">Clear all</button>
        </div>

        <div rdxToastPortal>
            <div rdxToastViewport [class]="t.viewport">
                @for (toast of manager.toasts(); track toast.id) {
                    <div rdxToastRoot [class]="t.root" [toast]="toast">
                        <div rdxToastContent [class]="t.content">
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
export class ToastStackingExample {
    protected readonly manager = inject(RdxToastManager);
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly t = demoToast;

    private count = 0;

    add(): void {
        this.count++;
        this.manager.add({
            title: `Message ${this.count}`,
            description: 'Hover the stack to expand it.',
            timeout: 0
        });
    }
}
