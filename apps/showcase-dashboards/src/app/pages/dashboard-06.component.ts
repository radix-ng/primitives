import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { ShBadgeDirective } from '@radix-ng/shadcn/badge';
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
import {
    TableBodyDirective,
    TableCaptionDirective,
    TableCellDirective,
    TableDirective,
    TableFooterDirective,
    TableHeadDirective,
    TableHeaderDirective,
    TableRowDirective
} from '@radix-ng/shadcn/table';
import { BlockToolbarComponent } from '../components/block-toolbar.component';

@Component({
    selector: 'app-dashboard-06',
    templateUrl: './dashboard-06.component.html',
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
        ShLabelDirective,
        ShBadgeDirective,
        TableDirective,
        TableHeaderDirective,
        TableBodyDirective,
        TableFooterDirective,
        TableRowDirective,
        TableHeadDirective,
        TableCellDirective,
        TableCaptionDirective,
        NgOptimizedImage
    ]
})
export class Dashboard06Component {}
