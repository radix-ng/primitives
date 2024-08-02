import { NgModule } from '@angular/core';
import {
    ShBreadcrumbDirective,
    ShBreadcrumbEllipsisComponent,
    ShBreadcrumbItemDirective,
    ShBreadcrumbLinkDirective,
    ShBreadcrumbListDirective,
    ShBreadcrumbPageDirective,
    ShBreadcrumbSeparatorComponent
} from './src/breadcrumb.directive';

export * from './src/breadcrumb.directive';

const breadcrumbImports = [
    ShBreadcrumbDirective,
    ShBreadcrumbItemDirective,
    ShBreadcrumbEllipsisComponent,
    ShBreadcrumbLinkDirective,
    ShBreadcrumbListDirective,
    ShBreadcrumbPageDirective,
    ShBreadcrumbSeparatorComponent
];

@NgModule({
    imports: [...breadcrumbImports],
    exports: [...breadcrumbImports]
})
export class ShBreadcrumbModule {}
