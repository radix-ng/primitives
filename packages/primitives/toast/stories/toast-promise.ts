import { cn, demoButton, demoToast } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { provideRdxToastManager, RdxToastManager, toastImports } from '@radix-ng/primitives/toast';

/**
 * `manager.promise()` drives a single toast through a promise's lifecycle: it shows the `loading`
 * copy, then swaps to `success` or `error` when the promise settles. The loading toast skips
 * auto-dismiss; the resolved one picks the timeout back up.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'toast-promise-example',
    imports: [...toastImports],
    providers: [provideRdxToastManager()],
    template: `
        <div class="flex gap-2">
            <button [class]="cn(b.base, b.primary, b.size.md)" (click)="run(true)">Save (resolves)</button>
            <button [class]="cn(b.base, b.outline, b.size.md)" (click)="run(false)">Save (rejects)</button>
        </div>

        <div rdxToastPortal>
            <div rdxToastViewport [class]="t.viewport">
                @for (toast of manager.toasts(); track toast.id) {
                    <div rdxToastRoot [class]="t.root" [toast]="toast">
                        <div rdxToastContent [class]="t.content">
                            <div class="min-w-0 flex-1">
                                <p rdxToastTitle [class]="t.title">{{ toast.title }}</p>
                                @if (toast.description) {
                                    <p rdxToastDescription [class]="t.description">{{ toast.description }}</p>
                                }
                            </div>
                            @if (!toast.loading) {
                                <button aria-label="Dismiss" rdxToastClose [class]="t.close">✕</button>
                            }
                        </div>
                    </div>
                }
            </div>
        </div>
    `
})
export class ToastPromiseExample {
    protected readonly manager = inject(RdxToastManager);
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly t = demoToast;

    run(succeed: boolean): void {
        const request = new Promise<string>((resolve, reject) => {
            setTimeout(() => (succeed ? resolve('report.pdf') : reject(new Error('Network error'))), 1800);
        });

        // Swallow the rejection here; the toast already reflects it.
        this.manager
            .promise(request, {
                loading: { title: 'Saving…', description: 'Uploading your file.' },
                success: (file) => ({ title: 'Saved', description: `${file} is ready.`, type: 'success' }),
                error: (err) => ({ title: 'Failed', description: (err as Error).message, type: 'error' })
            })
            .catch(() => undefined);
    }
}
