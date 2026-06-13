import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { PRIMITIVES } from './shared/primitives';

type Theme = 'light' | 'dark';

@Component({
    selector: 'app-root',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterOutlet, RouterLink, RouterLinkActive],
    template: `
        <div class="bg-muted/30 text-foreground flex min-h-screen">
            <aside class="border-border bg-background flex w-64 shrink-0 flex-col border-r">
                <div class="flex h-14 items-center justify-between px-5">
                    <a class="text-foreground text-sm font-semibold tracking-tight no-underline" routerLink="/">
                        Radix NG
                        <span class="text-muted-foreground">Playground</span>
                    </a>
                    <button
                        class="border-border text-muted-foreground hover:bg-muted inline-flex size-8 items-center justify-center rounded-md border text-xs"
                        [attr.aria-label]="'Switch to ' + (theme() === 'light' ? 'dark' : 'light') + ' theme'"
                        (click)="toggleTheme()"
                        type="button"
                    >
                        {{ theme() === 'light' ? '☾' : '☀' }}
                    </button>
                </div>

                <nav class="flex flex-col gap-0.5 overflow-y-auto p-3">
                    <span class="text-muted-foreground px-2 pb-1.5 text-xs font-semibold tracking-wide uppercase">
                        Primitives
                    </span>
                    @for (item of primitives; track item.path) {
                        <a
                            class="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md px-2 py-1.5 text-sm no-underline transition-colors"
                            [routerLink]="item.path"
                            routerLinkActive="bg-muted !text-foreground font-medium"
                        >
                            {{ item.label }}
                        </a>
                    }
                </nav>
            </aside>

            <main class="flex-1 overflow-y-auto p-8 lg:p-12">
                <router-outlet />
            </main>
        </div>
    `
})
export class App {
    private readonly document = inject(DOCUMENT);

    protected readonly primitives = PRIMITIVES;
    protected readonly theme = signal<Theme>('light');

    constructor() {
        effect(() => {
            this.document.documentElement.dataset['theme'] = this.theme();
        });
    }

    protected toggleTheme(): void {
        this.theme.update((current) => (current === 'light' ? 'dark' : 'light'));
    }
}
