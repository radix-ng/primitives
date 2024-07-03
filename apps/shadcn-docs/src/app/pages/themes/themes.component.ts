import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
    ShCardContentDirective,
    ShCardDirective,
    ShCardHeaderDirective,
    ShCardTitleDirective
} from '@radix-ng/shadcn/card';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [
        RouterLink,
        ShCardDirective,
        ShCardHeaderDirective,
        ShCardTitleDirective,
        ShCardContentDirective
    ],
    templateUrl: './themes.component.html'
})
export class ThemesComponent {}
