import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../ng-doc.category';
import { AccordionExampleComponent } from './examples/accordion-example.component';

const AccordionPage: NgDocPage = {
    title: `Accordion`,
    mdFile: './index.md',
    category: ExamplesCategory,
    demos: {
        AccordionExampleComponent
    }
};

export default AccordionPage;
