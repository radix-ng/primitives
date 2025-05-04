import { NgModule } from '@angular/core';
import { RdxDateFieldInputDirective } from './src/date-field-input.directive';
import { RdxDateFieldRootDirective } from './src/date-field-root.directive';

export * from './src/date-field-context.token';
export * from './src/date-field-input.directive';
export * from './src/date-field-root.directive';

const _imports = [RdxDateFieldRootDirective, RdxDateFieldInputDirective];

@NgModule({
    imports: [..._imports],
    exports: [..._imports]
})
export class RdxDateFieldModule {}
