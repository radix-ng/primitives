import { NgDocPage } from '@ng-doc/core';

import ExamplesCategory from '../ng-doc.category';
import { BadgeExampleComponent } from './examples/badge-example.component';

const CheckboxPage: NgDocPage = {
    title: `Badge`,
    mdFile: './index.md',
    category: ExamplesCategory,
    demos: {
        BadgeExampleComponent
    },
    keyword: 'CheckboxPage'
};

export default CheckboxPage;
