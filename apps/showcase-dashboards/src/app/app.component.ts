import { Component } from '@angular/core';

import { ThemeToggleComponent } from './components/theme-toggle.component';
import { Authentication02Component } from './pages/authentication-02.component';
import { Authentication04Component } from './pages/authentication-04.component';
import { DashboardComponent } from './pages/dashboard-04.component';

@Component({
    standalone: true,
    imports: [
        DashboardComponent,
        Authentication02Component,
        Authentication04Component,
        ThemeToggleComponent
    ],
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
    title = 'showcase-dashboards';
}
