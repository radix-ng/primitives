import { NgModule } from '@angular/core';

import {
    ShAlertDescriptionDirective,
    ShAlertDirective,
    ShAlertTitleDirective
} from './src/alert.directive';

export * from './src/alert.directive';

const alertImports = [ShAlertDirective, ShAlertTitleDirective, ShAlertDescriptionDirective];

@NgModule({
    imports: [...alertImports],
    exports: [...alertImports]
})
export class ShAlertModule {}
