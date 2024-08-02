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
import { ShInputDirective } from '@radix-ng/shadcn/input';
import { ShLabelDirective } from '@radix-ng/shadcn/label';
import { BlockToolbarComponent } from '../components/block-toolbar.component';

@Component({
    selector: 'app-authentication-2',
    standalone: true,
    templateUrl: './authentication-02.component.html',
    imports: [
        BlockToolbarComponent,
        ShCardDirective,
        ShCardHeaderDirective,
        ShCardTitleDirective,
        ShCardDescriptionDirective,
        ShCardContentDirective,
        ShCardFooterDirective,
        ShInputDirective,
        ShButtonDirective,
        ShLabelDirective
    ]
})
export class Authentication02Component {}
