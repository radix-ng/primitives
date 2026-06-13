import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Consistent page shell for a single primitive demo: a title, an optional description, and a centered
 * frame that hosts the live example (`<ng-content>`).
 */
@Component({
    selector: 'demo-page',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="mx-auto max-w-3xl">
            <h1 class="text-foreground text-2xl font-semibold tracking-tight">{{ title() }}</h1>
            @if (description()) {
                <p class="text-muted-foreground mt-1.5 text-sm">{{ description() }}</p>
            }

            <div
                class="border-border bg-background mt-8 flex min-h-[340px] items-center justify-center gap-10 rounded-xl border p-10"
                data-demo="tailwind"
            >
                <ng-content />
            </div>
        </div>
    `
})
export class DemoPage {
    readonly title = input('');
    readonly description = input('');
}
