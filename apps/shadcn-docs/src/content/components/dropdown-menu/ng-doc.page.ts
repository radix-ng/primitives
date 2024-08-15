import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../ng-doc.category';
import { DropdownExampleCheckboxComponent } from './examples/dropdown-example-checkbox.component';
import { DropdownExampleComponent } from './examples/dropdown-example.component';

const DropdownMenuPage: NgDocPage = {
    title: `DropdownMenu [In progress]`,
    mdFile: './index.md',
    category: ExamplesCategory,
    demos: {
        DropdownExampleComponent,
        DropdownExampleCheckboxComponent
    },
    keyword: 'DropdownMenuPage'
};

export default DropdownMenuPage;
