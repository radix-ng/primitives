import { NgDocPage } from '@ng-doc/core';

import ExamplesCategory from '../ng-doc.category';
import { TabsExampleComponent } from './examples/tabs-example.component';

const TabsPage: NgDocPage = {
    title: `Tabs`,
    mdFile: './index.md',
    category: ExamplesCategory,
    demos: {
        TabsExampleComponent
    },
    keyword: 'TabsPage'
};

export default TabsPage;
