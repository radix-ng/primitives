import { PlaygroundMascot } from './playground-mascot';
import { PRIMITIVES } from './shared/primitives';
import { ThemeStore } from './shared/theme';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideMoon, LucideSun } from '@lucide/angular';

@Component({
    selector: 'app-playground-shell',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideMoon, LucideSun, PlaygroundMascot],
    template: `
        <div class="bg-muted/30 text-foreground flex min-h-screen">
            <aside class="border-border bg-background flex w-64 shrink-0 flex-col border-r">
                <div class="flex h-14 items-center justify-between px-5">
                    <a
                        class="text-foreground text-sm font-semibold tracking-tight no-underline"
                        routerLink="/playground"
                    >
                        Radix NG
                        <span class="text-muted-foreground">Playground</span>
                    </a>
                    <button
                        class="border-border text-muted-foreground hover:bg-muted inline-flex size-8 items-center justify-center rounded-md border text-xs"
                        type="button"
                        [attr.aria-label]="'Switch to ' + (theme.theme() === 'light' ? 'dark' : 'light') + ' theme'"
                        (click)="theme.toggle()"
                    >
                        @if (theme.theme() === 'light') {
                            <svg class="size-4" lucideMoon></svg>
                        } @else {
                            <svg class="size-4" lucideSun></svg>
                        }
                    </button>
                </div>

                <nav class="flex flex-col gap-0.5 overflow-y-auto p-3">
                    <span class="text-muted-foreground px-2 pb-1.5 text-xs font-semibold tracking-wide uppercase">
                        Primitives
                    </span>
                    @for (item of primitives; track item.path) {
                        <a
                            class="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md px-2 py-1.5 text-sm no-underline transition-colors"
                            routerLinkActive="bg-muted !text-foreground font-medium"
                            [routerLink]="['/playground', item.path]"
                        >
                            {{ item.label }}
                        </a>
                    }
                </nav>
            </aside>

            <main class="flex-1 overflow-y-auto p-8 lg:p-12">
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
