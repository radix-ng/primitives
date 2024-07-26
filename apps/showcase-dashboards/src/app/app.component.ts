import { Component } from '@angular/core';

import { ThemeToggleComponent } from './components/theme-toggle.component';
import { Authentication02Component } from './pages/authentication-02.component';
import { Authentication04Component } from './pages/authentication-04.component';
import { DashboardComponent } from './pages/dashboard-04.component';
import { Dashboard06Component } from './pages/dashboard-06.component';

@Component({
    standalone: true,
    imports: [
        DashboardComponent,
        Dashboard06Component,
        Authentication02Component,
        Authentication04Component,
        ThemeToggleComponent
    ],
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent {
    title = 'showcase-dashboards';
}
