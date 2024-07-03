import { NgDocPage } from '@ng-doc/core';

import ExamplesCategory from '../ng-doc.category';
import { CheckboxExampleWithTextComponent } from './examples/checkbox-example-withtext.component';
import { CheckboxExampleComponent } from './examples/checkbox-example.component';

const CheckboxPage: NgDocPage = {
    title: `Checkbox`,
    mdFile: './index.md',
    category: ExamplesCategory,
    demos: {
        CheckboxExampleComponent,
        CheckboxExampleWithTextComponent
    },
    keyword: 'CheckboxPage'
};

export default CheckboxPage;
