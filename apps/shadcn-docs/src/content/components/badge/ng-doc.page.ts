import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../ng-doc.category';
import { BadgeExampleDestructiveComponent } from './examples/badge-example-destructive.component';
import { BadgeExampleLinkComponent } from './examples/badge-example-link.component';
import { BadgeExampleSecondaryComponent } from './examples/badge-example-secondary.component';
import { BadgeExampleComponent } from './examples/badge-example.component';

const BadgePage: NgDocPage = {
    title: `Badge`,
    mdFile: './index.md',
    category: ExamplesCategory,
    demos: {
        BadgeExampleComponent,
        BadgeExampleSecondaryComponent,
        BadgeExampleDestructiveComponent,
        BadgeExampleLinkComponent
    }
};

export default BadgePage;
