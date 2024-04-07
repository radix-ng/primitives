import { Component } from '@angular/core';

@Component({
    selector: 'radix-ng-docs-header',
    standalone: true,
    template: `
        <div class="mx-auto flex w-full max-w-screen-xl items-center justify-between">
            <nav class="flex items-center">
                <a class="mr-3 hidden p-1.5 sm:flex" href="/">
                    <span class="sr-only">Radix Angular</span>
                </a>
                <div class="hidden sm:flex sm:space-x-2">
                    <a href="/documentation">Documentation</a>
                    <a href="/examples">Examples</a>
                </div>
            </nav>
        </div>
    `
})
export class HeaderComponent {}
