import { Component } from '@angular/core';
import { ShButtonDirective } from '@radix-ng/shadcn/button';
import {
    ShCardComponent,
    ShCardContentComponent,
    ShCardDescriptionComponent,
    ShCardFooterComponent,
    ShCardHeaderComponent,
    ShCardTitleComponent
} from '@radix-ng/shadcn/card';
import { ShCheckboxComponent } from '@radix-ng/shadcn/checkbox';
import { ShInputDirective } from '@radix-ng/shadcn/input';
import { ShLabelDirective } from '@radix-ng/shadcn/label';
import { LucideAngularModule } from 'lucide-angular';
import { BlockToolbarComponent } from '../components/block-toolbar.component';

@Component({
    selector: 'app-dashboard-04',
    imports: [
        LucideAngularModule,
        BlockToolbarComponent,
        ShCardComponent,
        ShCardHeaderComponent,
        ShCardTitleComponent,
        ShCardDescriptionComponent,
        ShCardContentComponent,
        ShCardFooterComponent,
        ShInputDirective,
        ShButtonDirective,
        ShLabelDirective,
        ShCheckboxComponent
    ],
    templateUrl: './dashboard-04.component.html'
})
export class DashboardComponent {}
