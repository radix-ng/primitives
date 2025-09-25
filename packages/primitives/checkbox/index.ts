import { NgModule } from '@angular/core';
import { RdxCheckboxButtonDirective } from './src/checkbox-button';
import { RdxCheckboxIndicatorDirective } from './src/checkbox-indicator';
import { RdxCheckboxIndicatorPresenceDirective } from './src/checkbox-indicator-presence';
import { RdxCheckboxInputDirective } from './src/checkbox-input';
import { RdxCheckboxRootDirective } from './src/checkbox-root';

export * from './src/checkbox-button';
export * from './src/checkbox-indicator';
export * from './src/checkbox-indicator-presence';
export * from './src/checkbox-input';
export * from './src/checkbox-root';
export type { CheckedState } from './src/checkbox-root';

export const checkboxImports = [
    RdxCheckboxInputDirective,
    RdxCheckboxRootDirective,
    RdxCheckboxButtonDirective,
    RdxCheckboxIndicatorDirective,
    RdxCheckboxIndicatorPresenceDirective
];

@NgModule({
    imports: [...checkboxImports],
    exports: [...checkboxImports]
})
export class RdxCheckboxModule {}
