import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'app-root',
    imports: [RouterOutlet],
    template: `
        <router-outlet />
    `
})
export class App {}
