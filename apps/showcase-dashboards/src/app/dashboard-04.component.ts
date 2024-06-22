import { Component } from '@angular/core';

import {
    CardContentDirective,
    CardDescriptionDirective,
    CardDirective,
    CardFooterDirective,
    CardHeaderDirective,
    CardTitleDirective
} from './components/ui/card.component';

@Component({
    selector: 'app-dashboard-04',
    standalone: true,
    imports: [
        CardDirective,
        CardHeaderDirective,
        CardTitleDirective,
        CardDescriptionDirective,
        CardContentDirective,
        CardFooterDirective
    ],
    templateUrl: './dashboard-04.component.html'
})
export class DashboardComponent {}
