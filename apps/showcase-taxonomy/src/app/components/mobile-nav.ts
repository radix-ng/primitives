import { Component } from '@angular/core';

@Component({
    selector: 'tx-mobile-nav',
    standalone: true,
    template: `
        <div
            class="animate-in slide-in-from-bottom-80 fixed inset-0 top-16 z-50 grid h-[calc(100vh-4rem)] grid-flow-row auto-rows-max overflow-auto p-6 pb-32 shadow-md md:hidden"
        >
            <div class="bg-popover text-popover-foreground relative z-20 grid gap-6 rounded-md p-4 shadow-md">
                <nav class="grid grid-flow-row auto-rows-max text-sm">
                    <a
                        class="flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline"
                        href="/#features"
                    >
                        Features
                    </a>
                    <a
                        class="flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline"
                        href="/blog"
                    >
                        Blog
                    </a>
                </nav>
            </div>
        </div>
    `
})
export class MobileNavComponent {}
