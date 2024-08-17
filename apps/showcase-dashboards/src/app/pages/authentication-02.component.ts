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
import { ShInputDirective } from '@radix-ng/shadcn/input';
import { ShLabelDirective } from '@radix-ng/shadcn/label';
import { BlockToolbarComponent } from '../components/block-toolbar.component';

@Component({
    selector: 'app-authentication-2',
    standalone: true,
    templateUrl: './authentication-02.component.html',
    imports: [
        BlockToolbarComponent,
        ShCardComponent,
        ShCardHeaderComponent,
        ShCardTitleComponent,
        ShCardDescriptionComponent,
        ShCardContentComponent,
        ShCardFooterComponent,
        ShInputDirective,
        ShButtonDirective,
        ShLabelDirective
    ]
})
export class Authentication02Component {}
