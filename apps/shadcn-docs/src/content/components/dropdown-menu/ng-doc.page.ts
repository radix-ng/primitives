import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../ng-doc.category';
import { DropdownExampleComponent } from './examples/dropdown-example.component';

const DropdownMenuPage: NgDocPage = {
    title: `DropdownMenu [In progress]`,
    mdFile: './index.md',
    category: ExamplesCategory,
    demos: {
        DropdownExampleComponent
    },
    keyword: 'DropdownMenuPage'
};

export default DropdownMenuPage;
