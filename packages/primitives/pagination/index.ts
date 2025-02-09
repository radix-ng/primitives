import { NgModule } from '@angular/core';
import { RdxPaginationEllipsisDirective } from './src/pagination-ellipsis.directive';
import { RdxPaginationFirstDirective } from './src/pagination-first.directive';
import { RdxPaginationLastDirective } from './src/pagination-last.directive';
import { RdxPaginationListItemDirective } from './src/pagination-list-item.directive';
import { RdxPaginationListDirective } from './src/pagination-list.directive';
import { RdxPaginationNextDirective } from './src/pagination-next.directive';
import { RdxPaginationPrevDirective } from './src/pagination-prev.directive';
import { RdxPaginationRootDirective } from './src/pagination-root.directive';

export * from './src/pagination-context.token';
export * from './src/pagination-ellipsis.directive';
export * from './src/pagination-first.directive';
export * from './src/pagination-last.directive';
export * from './src/pagination-list-item.directive';
export * from './src/pagination-list.directive';
export * from './src/pagination-next.directive';
export * from './src/pagination-prev.directive';
export * from './src/pagination-root.directive';

const paginationImports = [
    RdxPaginationRootDirective,
    RdxPaginationListDirective,
    RdxPaginationFirstDirective,
    RdxPaginationPrevDirective,
    RdxPaginationLastDirective,
    RdxPaginationNextDirective,
    RdxPaginationListItemDirective,
    RdxPaginationEllipsisDirective
];

@NgModule({
    imports: [...paginationImports],
    exports: [...paginationImports]
})
export class RdxPaginationModule {}
