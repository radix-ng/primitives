import { Component, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { cn, demoButton } from '../../storybook/styles';
import { RdxButtonDirective } from '../src/button.directive';

/**
 * Visual variants — the recommended `demoButton` styling from the centralized
 * style layer applied on top of the headless `rdxButton` directive.
 */
@Component({
    selector: 'rdx-button-variants',
    imports: [RdxButtonDirective],
    template: `
        <div class="flex flex-wrap items-center gap-3">
            <button [class]="cn(b.base, b.primary, b.size.md)" rdxButton>Primary</button>
            <button [class]="cn(b.base, b.secondary, b.size.md)" rdxButton>Secondary</button>
            <button [class]="cn(b.base, b.outline, b.size.md)" rdxButton>Outline</button>
            <button [class]="cn(b.base, b.ghost, b.size.md)" rdxButton>Ghost</button>
            <button [class]="cn(b.base, b.destructive, b.size.md)" rdxButton>Destructive</button>
        </div>
    `
})
export class RdxButtonVariantsComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
}

/**
 * Sizes, including a square icon button.
 */
@Component({
    selector: 'rdx-button-sizes',
    imports: [RdxButtonDirective, LucideAngularModule],
    template: `
        <div class="flex flex-wrap items-center gap-3">
            <button [class]="cn(b.base, b.primary, b.size.sm)" rdxButton>Small</button>
            <button [class]="cn(b.base, b.primary, b.size.md)" rdxButton>Medium</button>
            <button [class]="cn(b.base, b.primary, b.size.lg)" rdxButton>Large</button>
            <button [class]="cn(b.base, b.primary, b.size.icon)" rdxButton aria-label="Add">
                <lucide-angular class="flex" name="plus" size="16" />
            </button>
        </div>
    `
})
export class RdxButtonSizesComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
}

/**
 * Disabled handling. The first button uses the native `disabled` attribute
 * (removed from the tab order). The second sets `focusableWhenDisabled`, so it
 * stays focusable via `aria-disabled` while its activation is suppressed.
 */
@Component({
    selector: 'rdx-button-disabled',
    imports: [RdxButtonDirective],
    template: `
        <div class="flex flex-wrap items-center gap-3">
            <button [class]="cn(b.base, b.primary, b.size.md)" rdxButton disabled>Disabled</button>
            <button [class]="cn(b.base, b.outline, b.size.md)" rdxButton disabled focusableWhenDisabled>
                Disabled (focusable)
            </button>
        </div>
    `
})
export class RdxButtonDisabledComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
}

/**
 * The directive works on any host. Here it renders an `<a>` as a button while
 * keeping native link behavior.
 */
@Component({
    selector: 'rdx-button-as-link',
    imports: [RdxButtonDirective],
    template: `
        <a [class]="cn(b.base, b.secondary, b.size.md)" rdxButton href="https://base-ui.com" target="_blank">
            Open Base UI
        </a>
    `
})
export class RdxButtonAsLinkComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
}

/**
 * Loading state. Following Base UI's guidance, the button becomes `disabled`
 * while loading but uses `focusableWhenDisabled` so focus stays on it. `aria-busy`
 * announces the pending state, and a spinner is rendered in place of the icon.
 */
@Component({
    selector: 'rdx-button-loading',
    imports: [RdxButtonDirective, LucideAngularModule],
    template: `
        <button
            [disabled]="loading()"
            [attr.aria-busy]="loading() ? 'true' : null"
            [class]="cn(b.base, b.primary, b.size.md)"
            (click)="run()"
            rdxButton
            focusableWhenDisabled
        >
            <lucide-angular
                class="flex"
                [name]="loading() ? 'loader-circle' : 'save'"
                [class.animate-spin]="loading()"
                size="16"
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
