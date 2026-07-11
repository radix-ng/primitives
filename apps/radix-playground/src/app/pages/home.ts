import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PRIMITIVES } from '../shared/primitives';

@Component({
    selector: 'app-home',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink],
    template: `
        <div class="mx-auto max-w-3xl">
            <h1 class="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">Radix NG Playground</h1>
            <p class="text-muted-foreground mt-2 max-w-prose text-sm">
                A small sandbox for the headless Radix NG primitives. Each page renders a live, styled example. Pick a
                primitive from the sidebar, or jump in below.
            </p>

            <div class="mt-6 grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:mt-8 sm:grid-cols-3">
                @for (item of primitives; track item.path) {
                    <a
                        class="border-border bg-background text-foreground hover:bg-muted rounded-lg border p-4 text-sm font-medium no-underline shadow-xs transition-colors"
                        [routerLink]="item.path"
                    >
                        {{ item.label }}
                    </a>
                }
            </div>
        </div>
    `
})
export default class HomePage {
    protected readonly primitives = PRIMITIVES;
}
