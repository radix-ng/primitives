import { Component } from '@angular/core';
import { MobileNavComponent } from '@taxonomy/components/mobile-nav';
import { TxButtonDirective } from '@taxonomy/components/ui';
import { LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'tx-main-nav',
    standalone: true,
    imports: [TxButtonDirective, MobileNavComponent, LucideAngularModule],
    template: `
        <header class="bg-background container z-40">
            <div class="flex h-20 items-center justify-between py-6">
                <div class="flex gap-6 md:gap-10">
                    <a class="hidden items-center space-x-2 md:flex" href="/">
                        <svg
                            class="lucide lucide-command"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path
                                d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"
                            ></path>
                        </svg>
                        <span class="hidden font-bold sm:inline-block">Taxonomy</span>
                    </a>
                    <nav class="hidden gap-6 md:flex">
                        <!-- Items -->
                        <a
                            class="hover:text-foreground/80 text-foreground/60 flex items-center text-lg font-medium transition-colors sm:text-sm"
                            href="/#features"
                        >
                            Features
                        </a>
                        <a
                            class="hover:text-foreground/80 text-foreground/60 flex items-center text-lg font-medium transition-colors sm:text-sm"
                            href="/blog"
                        >
                            Blog
                        </a>
                    </nav>
                    <button class="flex items-center space-x-2 md:hidden" (click)="toggleMenu()" type="button">
                        @if (showMobileMenu) {
                            <lucide-icon name="x"></lucide-icon>
                        }
                        <span class="font-bold">Menu</span>
                    </button>
                    @if (showMobileMenu) {
                        <tx-mobile-nav></tx-mobile-nav>
                    }
                </div>
                <nav>
                    <a class="px-4" href="/login" txBtn variant="secondary" size="sm">Login</a>
                </nav>
            </div>
        </header>
    `
})
export class TxMainNavComponent {
    showMobileMenu = false;

    protected toggleMenu() {
        this.showMobileMenu = !this.showMobileMenu;
    }
}
