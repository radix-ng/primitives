import { RdxSwitchInput } from './src/switch-input';
import { RdxSwitchRoot } from './src/switch-root';
import { RdxSwitchThumb } from './src/switch-thumb';
import { NgModule } from '@angular/core';

export * from './src/switch-context';
export * from './src/switch-input';
export * from './src/switch-root';
export * from './src/switch-thumb';

export const switchImports = [RdxSwitchRoot, RdxSwitchInput, RdxSwitchThumb];

@NgModule({
    imports: [...switchImports],
    exports: [...switchImports]
})
export class RdxSwitchModule {}
