import { NgModule } from '@angular/core';
import { RdxNumberFieldDecrementDirective } from './src/number-field-decrement.directive';
import { RdxNumberFieldIncrementDirective } from './src/number-field-increment.directive';
import { RdxNumberFieldInputDirective } from './src/number-field-input.directive';
import { RdxNumberFieldRootDirective } from './src/number-field-root.directive';

export * from './src/number-field-context.token';
export * from './src/number-field-decrement.directive';
export * from './src/number-field-increment.directive';
export * from './src/number-field-input.directive';
export * from './src/number-field-root.directive';
export * from './src/types';
export * from './src/utils';

const _imports = [
    RdxNumberFieldRootDirective,
    RdxNumberFieldInputDirective,
    RdxNumberFieldIncrementDirective,
    RdxNumberFieldDecrementDirective
];

@NgModule({
    imports: [..._imports],
    exports: [..._imports]
})
export class RdxNumberFieldModule {}
