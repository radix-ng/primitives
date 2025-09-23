import { NgModule } from '@angular/core';
import { RdxCheckboxRootDirective } from './src/checkbox';
import { RdxCheckboxButtonDirective } from './src/checkbox-button';
import { RdxCheckboxIndicatorDirective } from './src/checkbox-indicator';
import { RdxCheckboxInputDirective } from './src/checkbox-input';

export * from './src/checkbox';
export type { CheckedState } from './src/checkbox';
export * from './src/checkbox-button';
export * from './src/checkbox-indicator';
export * from './src/checkbox-input';

export const checkboxImports = [
    RdxCheckboxInputDirective,
    RdxCheckboxRootDirective,
    RdxCheckboxButtonDirective,
    RdxCheckboxIndicatorDirective
];

@NgModule({
    imports: [...checkboxImports],
    exports: [...checkboxImports]
})
export class RdxCheckboxModule {}
