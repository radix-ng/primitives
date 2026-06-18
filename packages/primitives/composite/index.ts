import { NgModule } from '@angular/core';
import { RdxCompositeItem } from './src/composite-item';
import { RdxCompositeRoot } from './src/composite-root';

export * from './src/composite-item';
export * from './src/composite-root';
export * from './src/types';
export * from './src/utils';

export const compositeImports = [RdxCompositeRoot, RdxCompositeItem];

@NgModule({
    imports: [...compositeImports],
    exports: [...compositeImports]
})
export class RdxCompositeModule {}
