import { Component } from '@angular/core';

import { ShButtonDirective } from '@radix-ng/shadcn/button';
import {
    ShCardContentDirective,
    ShCardDescriptionDirective,
    ShCardDirective,
    ShCardFooterDirective,
    ShCardHeaderDirective,
    ShCardTitleDirective
} from '@radix-ng/shadcn/card';
import { ShCheckboxComponent } from '@radix-ng/shadcn/checkbox';
import { ShInputDirective } from '@radix-ng/shadcn/input';
import { ShLabelDirective } from '@radix-ng/shadcn/label';
import { LucideAngularModule } from 'lucide-angular';

import { BlockToolbarComponent } from '../components/block-toolbar.component';

@Component({
    selector: 'app-dashboard-04',
    standalone: true,
    imports: [
        LucideAngularModule,
        BlockToolbarComponent,

        ShCardDirective,
        ShCardHeaderDirective,
        ShCardTitleDirective,
        ShCardDescriptionDirective,
        ShCardContentDirective,
        ShCardFooterDirective,

        ShInputDirective,
        ShButtonDirective,
        ShLabelDirective,
        ShCheckboxComponent
    ],
    templateUrl: './dashboard-04.component.html'
})
export class DashboardComponent {}
