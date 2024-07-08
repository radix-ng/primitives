import { NgDocPage } from '@ng-doc/core';

import ExamplesCategory from '../ng-doc.category';
import { InputExampleComponent } from './examples/input-example.component';
import { InputFileExampleComponent } from './examples/input-file-example.component';
import { InputWithButtonExampleComponent } from './examples/input-with-button-example.component';
import { InputWithLabelExampleComponent } from './examples/input-with-label-example.component';

const InputPage: NgDocPage = {
    title: `Input`,
    mdFile: './index.md',
    category: ExamplesCategory,
    demos: {
        InputExampleComponent,
        InputFileExampleComponent,
        InputWithLabelExampleComponent,
        InputWithButtonExampleComponent
    },
    keyword: 'InputPage'
};

export default InputPage;
