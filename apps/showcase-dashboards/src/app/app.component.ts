import { Component } from '@angular/core';

import { DashboardComponent } from './dashboard-04.component';

@Component({
    standalone: true,
    imports: [DashboardComponent],
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
    title = 'showcase-dashboards';
}
