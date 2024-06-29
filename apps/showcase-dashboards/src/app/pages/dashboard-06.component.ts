import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';

import { ShButtonDirective } from '@radix-ng/shadcn/button';
import {
    CardContentDirective,
    CardDescriptionDirective,
    CardDirective,
    CardFooterDirective,
    CardHeaderDirective,
    CardTitleDirective
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

import { ShBadgeDirective } from '../../../../../packages/shadcn/badge/src/badge.direcitve';
import { BlockToolbarComponent } from '../components/block-toolbar.component';

@Component({
    selector: 'app-dashboard-06',
    standalone: true,
    templateUrl: './dashboard-06.component.html',
    imports: [
        BlockToolbarComponent,

        CardDirective,
        CardHeaderDirective,
        CardTitleDirective,
        CardDescriptionDirective,
        CardContentDirective,
        CardFooterDirective,

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
