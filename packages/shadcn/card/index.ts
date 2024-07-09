import { NgModule } from '@angular/core';

import {
    ShCardContentDirective,
    ShCardDescriptionDirective,
    ShCardDirective,
    ShCardFooterDirective,
    ShCardHeaderDirective,
    ShCardTitleDirective
} from './src/card.component';

export * from './src/card.component';

const cardImports = [
    ShCardTitleDirective,
    ShCardDirective,
    ShCardContentDirective,
    ShCardFooterDirective,
    ShCardDescriptionDirective,
    ShCardHeaderDirective
];

@NgModule({
    imports: [...cardImports],
    exports: [...cardImports]
})
export class ShCardModule {}
