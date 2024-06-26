import { Component } from '@angular/core';

import { ShButtonDirective } from '@radix-ng/shadcn/button';
import { ShInputDirective } from '@radix-ng/shadcn/input';
import { ShLabelDirective } from '@radix-ng/shadcn/label';

import {
    CardContentDirective,
    CardDescriptionDirective,
    CardDirective,
    CardFooterDirective,
    CardHeaderDirective,
    CardTitleDirective
} from '../components/ui/card.component';

@Component({
    selector: 'app-authentication-2',
    standalone: true,
    templateUrl: './authentication-02.component.html',
    imports: [
        CardDirective,
        CardHeaderDirective,
        CardTitleDirective,
        CardDescriptionDirective,
        CardContentDirective,
        CardFooterDirective,

        ShInputDirective,
        ShButtonDirective,
        ShLabelDirective
    ]
})
export class Authentication02Component {}
