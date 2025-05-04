import { NgModule } from '@angular/core';
import { RdxCheckboxButtonDirective } from './src/checkbox-button.directive';
import { RdxCheckboxIndicatorDirective } from './src/checkbox-indicator.directive';
import { RdxCheckboxInputDirective } from './src/checkbox-input.directive';
import { RdxCheckboxRootDirective } from './src/checkbox.directive';

export * from './src/checkbox-button.directive';
export * from './src/checkbox-indicator.directive';
export * from './src/checkbox-input.directive';
export * from './src/checkbox.directive';
export type { CheckboxState } from './src/checkbox.directive';
export * from './src/checkbox.token';

const _imports = [
    RdxCheckboxInputDirective,
    RdxCheckboxRootDirective,
    RdxCheckboxButtonDirective,
    RdxCheckboxIndicatorDirective
];

@NgModule({
    imports: [..._imports],
    exports: [..._imports]
})
export class RdxCheckboxModule {}
