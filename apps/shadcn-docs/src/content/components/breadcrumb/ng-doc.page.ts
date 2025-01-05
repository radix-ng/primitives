import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../ng-doc.category';
import { BreadcrumbCustomSeparatorExampleComponent } from './examples/breadcrumb-custom-separator-example.component';
import { BreadcrumbExampleComponent } from './examples/breadcrumb-example.component';

const BreadcrumbPage: NgDocPage = {
    title: `Breadcrumb`,
    mdFile: './index.md',
    category: ExamplesCategory,
    demos: { BreadcrumbExampleComponent, BreadcrumbCustomSeparatorExampleComponent }
};

export default BreadcrumbPage;
