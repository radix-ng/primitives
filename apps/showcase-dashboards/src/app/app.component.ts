import { Component } from '@angular/core';

import { ThemeToggleComponent } from './components/theme-toggle.component';
import { DashboardComponent } from './pages/dashboard-04.component';

@Component({
    standalone: true,
    imports: [DashboardComponent, ThemeToggleComponent],
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
    title = 'showcase-dashboards';
}
