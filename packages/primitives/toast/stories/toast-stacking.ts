import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { provideRdxToastManager, RdxToastManager, toastImports } from '@radix-ng/primitives/toast';
import { cn, demoButton, demoToast } from '../../storybook/styles';

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
