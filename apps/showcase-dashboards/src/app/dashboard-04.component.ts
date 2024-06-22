import { Component } from '@angular/core';

import { ShButtonDirective } from '@radix-ng/shadcn/button';
import { ShInputDirective } from '@radix-ng/shadcn/input';

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
        CardFooterDirective,

        ShInputDirective,
        ShButtonDirective
    ],
    templateUrl: './dashboard-04.component.html'
})
export class DashboardComponent {}
