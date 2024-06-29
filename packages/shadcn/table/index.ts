import { NgModule } from '@angular/core';

import {
    TableBodyDirective,
    TableCaptionDirective,
    TableCellDirective,
    TableDirective,
    TableFooterDirective,
    TableHeadDirective,
    TableHeaderDirective,
    TableRowDirective
} from './src/table.component';

export * from './src/table.component';

@NgModule({
    imports: [
        TableDirective,
        TableHeaderDirective,
        TableBodyDirective,
        TableFooterDirective,
        TableRowDirective,
        TableHeadDirective,
        TableCellDirective,
        TableCaptionDirective
    ]
})
export class ShTableModule {}
