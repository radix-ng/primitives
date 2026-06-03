import { cn, demoButton, demoToast } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { provideRdxToastManager, RdxToastManager, toastImports } from '@radix-ng/primitives/toast';

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
