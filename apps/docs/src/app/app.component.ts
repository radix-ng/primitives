import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';

@Component({
    standalone: true,
    imports: [RouterOutlet, HeaderComponent],
    selector: 'radix-ng-root',
    template: `
        <radix-ng-docs-header />
        <div>
            <router-outlet />
        </div>
    `
})
export class AppComponent {}
