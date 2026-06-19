import { NgModule } from '@angular/core';
import { RdxCompositeItem } from './src/composite-item';
import { RdxCompositeList } from './src/composite-list';
import { RdxCompositeListItem } from './src/composite-list-item';
import { RdxCompositeRoot } from './src/composite-root';

export * from './src/composite-item';
export * from './src/composite-list';
export * from './src/composite-list-item';
export * from './src/composite-root';
export * from './src/types';
export * from './src/utils';

export const compositeImports = [RdxCompositeList, RdxCompositeListItem, RdxCompositeRoot, RdxCompositeItem];

@NgModule({
    imports: [...compositeImports],
    exports: [...compositeImports]
})
export class RdxCompositeModule {}
