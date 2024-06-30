import { NgDocPage } from '@ng-doc/core';

import ExamplesCategory from '../ng-doc.category';
import { ButtonExampleOutlineComponent } from './examples/button-example-outline.component';
import { ButtonExampleSecondaryComponent } from './examples/button-example-secondary.component';
import { ButtonExampleComponent } from './examples/button-example.component';

const ButtonPage: NgDocPage = {
    title: `Button`,
    mdFile: './index.md',
    category: ExamplesCategory,
    demos: {
        ButtonExampleComponent,
        ButtonExampleSecondaryComponent,
        ButtonExampleOutlineComponent
    },
    keyword: 'ButtonPage'
};

export default ButtonPage;
