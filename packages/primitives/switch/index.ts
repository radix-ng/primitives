import { NgModule } from '@angular/core';
import { RdxSwitchInputDirective } from './src/switch-input.directive';
import { RdxSwitchRootDirective } from './src/switch-root.directive';
import { RdxSwitchThumbDirective } from './src/switch-thumb.directive';

export * from './src/switch-input.directive';
export * from './src/switch-root.directive';
export * from './src/switch-thumb.directive';

const switchImports = [
    RdxSwitchRootDirective,
    RdxSwitchInputDirective,
    RdxSwitchThumbDirective
];

@NgModule({
    imports: [...switchImports],
    exports: [...switchImports]
})
export class RdxSwitchModule {}
