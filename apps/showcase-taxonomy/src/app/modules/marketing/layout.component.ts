import { Component, ViewEncapsulation } from '@angular/core';
import { MainNavComponent } from '@taxonomy/components/main-nav.component';
import { NgIf } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ButtonDirective } from '@taxonomy/components/ui';

@Component({
    selector: 'layout-marketing',
    template: `
        <div class="flex min-h-screen flex-col">
            <header class="container z-40 bg-background">
                <div class="flex h-20 items-center justify-between py-6">
                    <main-nav></main-nav>
                    <nav>
                        <a href="/login" txBtn variant="secondary" size="sm" class="px-4">
                            Login
                        </a>
                    </nav>
                </div>
            </header>
            <main class="flex-1">
                <router-outlet></router-outlet>
            </main>
        </div>
    `,
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [MainNavComponent, NgIf, RouterOutlet, ButtonDirective]
})
export class LayoutMarketingComponent {}
