import { Component } from '@angular/core';

import { ShButtonDirective } from '@radix-ng/shadcn/button';
import { ShCheckboxComponent } from '@radix-ng/shadcn/checkbox';
import { ShInputDirective } from '@radix-ng/shadcn/input';
import { LucideAngularModule } from 'lucide-angular';

import {
    CardContentDirective,
    CardDescriptionDirective,
    CardDirective,
    CardFooterDirective,
    CardHeaderDirective,
    CardTitleDirective
} from '../components/ui/card.component';

@Component({
    selector: 'app-dashboard-04',
    standalone: true,
    imports: [
        LucideAngularModule,

        CardDirective,
        CardHeaderDirective,
        CardTitleDirective,
        CardDescriptionDirective,
        CardContentDirective,
        CardFooterDirective,

        ShInputDirective,
        ShButtonDirective,
        ShCheckboxComponent
    ],
    templateUrl: './dashboard-04.component.html'
})
export class DashboardComponent {}
