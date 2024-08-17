import { NgModule } from '@angular/core';
import {
    ShCardComponent,
    ShCardContentComponent,
    ShCardDescriptionComponent,
    ShCardFooterComponent,
    ShCardHeaderComponent,
    ShCardTitleComponent
} from './src/card.component';

export * from './src/card.component';

const cardImports = [
    ShCardTitleComponent,
    ShCardComponent,
    ShCardContentComponent,
    ShCardFooterComponent,
    ShCardDescriptionComponent,
    ShCardHeaderComponent
];

@NgModule({
    imports: [...cardImports],
    exports: [...cardImports]
})
export class ShCardModule {}
