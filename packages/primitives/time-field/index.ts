import { NgModule } from '@angular/core';
import { RdxTimeFieldInputDirective } from './src/time-field-input.directive';
import { RdxTimeFieldRootDirective } from './src/time-field-root.directive';

export * from './src/time-field-context.token';
export * from './src/time-field-input.directive';
export * from './src/time-field-root.directive';

const _imports = [RdxTimeFieldRootDirective, RdxTimeFieldInputDirective];

@NgModule({
    imports: [..._imports],
    exports: [..._imports]
})
export class RdxTimeFieldModule {}
