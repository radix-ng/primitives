import { RdxCheckboxButtonDirective } from './src/checkbox-button';
import { RdxCheckboxGroupDirective } from './src/checkbox-group';
import { RdxCheckboxIndicatorDirective } from './src/checkbox-indicator';
import { RdxCheckboxInputDirective } from './src/checkbox-input';
import { RdxCheckboxRootDirective } from './src/checkbox-root';
import { NgModule } from '@angular/core';

export * from './src/checkbox-button';
export * from './src/checkbox-group';
export * from './src/checkbox-indicator';
export * from './src/checkbox-input';
export type { CheckedState } from './src/checkbox-root';
export * from './src/checkbox-root';

export const checkboxImports = [
    RdxCheckboxInputDirective,
    RdxCheckboxRootDirective,
    RdxCheckboxButtonDirective,
    RdxCheckboxIndicatorDirective,
    RdxCheckboxGroupDirective
];

@NgModule({
    imports: [...checkboxImports],
    exports: [...checkboxImports]
})
export class RdxCheckboxModule {}
