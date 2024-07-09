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
import { ShTabsModule } from '@radix-ng/shadcn/tabs';

@Component({
    standalone: true,
    imports: [
        ShInputDirective,
        ShTabsModule,
        ShCardDirective,
        ShCardHeaderDirective,
        ShCardTitleDirective,
        ShCardDescriptionDirective,
        ShCardContentDirective,
        ShLabelDirective,
        ShCardFooterDirective,
        ShButtonDirective
    ],
    templateUrl: './tabs-example.component.html'
})
export class TabsExampleComponent {}
