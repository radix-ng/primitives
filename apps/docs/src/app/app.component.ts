import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    standalone: true,
    imports: [RouterOutlet],
    selector: 'radix-ng-root',
    template: `
        <div>
            <router-outlet />
        </div>
    `
})
export class AppComponent {}
