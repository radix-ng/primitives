import { NgModule } from '@angular/core';
import {
    ShTypographyH1Directive,
    ShTypographyH2Directive,
    ShTypographyListDirective
} from './src/typography.directive';

export * from './src/typography.directive';

const importsTypography = [
    ShTypographyH1Directive,
    ShTypographyH2Directive,
    ShTypographyListDirective
];
@NgModule({
    imports: [...importsTypography],
    exports: [...importsTypography]
})
export class ShTypographyModule {}
