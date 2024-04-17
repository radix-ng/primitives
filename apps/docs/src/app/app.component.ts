import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';

@Component({
    standalone: true,
    imports: [RouterOutlet, HeaderComponent],
    selector: 'radix-ng-root',
    template: `
        <div
            class="radix-themes light light-theme relative flex min-h-screen flex-col bg-background"
            data-radius="medium"
            data-scaling="100%"
            data-accent-color="gray"
        >
            <radix-ng-docs-header />
            <div>
                <router-outlet />
            </div>
        </div>
    `
})
export class AppComponent {}
