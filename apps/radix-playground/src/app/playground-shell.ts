import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideMoon, LucideSun } from '@lucide/angular';
import { PlaygroundMascot } from './playground-mascot';
import { PRIMITIVES } from './shared/primitives';
import { ThemeStore } from './shared/theme';

@Component({
    selector: 'app-playground-shell',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideMoon, LucideSun, PlaygroundMascot],
    template: `
        <div class="bg-muted/30 text-foreground flex min-h-screen min-w-0 flex-col md:flex-row">
            <aside
                class="border-border bg-background sticky top-0 z-40 flex w-full min-w-0 shrink-0 flex-col border-b md:h-screen md:w-64 md:border-r md:border-b-0"
            >
                <div class="flex h-14 shrink-0 items-center justify-between px-4 sm:px-5">
                    <a
                        class="text-foreground text-sm font-semibold tracking-tight no-underline"
                        routerLink="/playground"
                    >
                        Radix NG
                        <span class="text-muted-foreground">Playground</span>
                    </a>
                    <button
                        class="border-border text-muted-foreground hover:bg-muted inline-flex size-8 items-center justify-center rounded-md border text-xs"
                        [attr.aria-label]="'Switch to ' + (theme.theme() === 'light' ? 'dark' : 'light') + ' theme'"
                        (click)="theme.toggle()"
                        type="button"
                    >
                        @if (theme.theme() === 'light') {
                            <svg class="size-4" lucideMoon></svg>
                        } @else {
                            <svg class="size-4" lucideSun></svg>
                        }
                    </button>
                </div>

                <nav
                    class="flex min-w-0 gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:gap-0.5 md:overflow-y-auto md:p-3"
                >
                    <span
                        class="text-muted-foreground hidden px-2 pb-1.5 text-xs font-semibold tracking-wide uppercase md:block"
                    >
                        Primitives
                    </span>
                    @for (item of primitives; track item.path) {
                        <a
                            class="text-muted-foreground hover:bg-muted hover:text-foreground shrink-0 rounded-md px-2.5 py-1.5 text-sm no-underline transition-colors md:px-2"
                            [routerLink]="['/playground', item.path]"
                            routerLinkActive="bg-muted !text-foreground font-medium"
                        >
                            {{ item.label }}
                        </a>
                    }
                </nav>
            </aside>

            <main class="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12">
                <router-outlet />
            </main>

            <app-playground-mascot />
        </div>
    `
})
export default class PlaygroundShell {
    protected readonly primitives = PRIMITIVES;
    protected readonly theme = inject(ThemeStore);
}
