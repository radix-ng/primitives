import { cn, demoButton } from '../../storybook/styles';
import { RdxButtonDirective } from '../src/button.directive';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideDynamicIcon, LucidePlus } from '@lucide/angular';

/**
 * Loading state. Following Base UI's guidance, the button becomes `disabled`
 * while loading but uses `focusableWhenDisabled` so focus stays on it. `aria-busy`
 * announces the pending state, and a spinner is rendered in place of the icon.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-button-loading',
    imports: [RdxButtonDirective, LucideDynamicIcon, LucidePlus],
    template: `
        <button
            rdxButton
            focusableWhenDisabled
            [disabled]="loading()"
            [attr.aria-busy]="loading() ? 'true' : null"
            [class]="cn(b.base, b.primary, b.size.md)"
            (click)="run()"
        >
            <svg
                class="flex"
                size="16"
                [lucideIcon]="loading() ? 'loader-circle' : 'save'"
                [class.animate-spin]="loading()"
            />
            {{ loading() ? 'Saving…' : 'Save' }}
        </button>
    `
})
export class RdxButtonLoadingComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly loading = signal(false);

    protected run(): void {
        if (this.loading()) {
            return;
        }
        this.loading.set(true);
        setTimeout(() => this.loading.set(false), 2000);
    }
}
