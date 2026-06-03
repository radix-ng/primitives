import { RdxScrollAreaContent } from './src/scroll-area-content';
import { RdxScrollAreaCorner } from './src/scroll-area-corner';
import { RdxScrollAreaRoot } from './src/scroll-area-root';
import { RdxScrollAreaScrollbar } from './src/scroll-area-scrollbar';
import { RdxScrollAreaThumb } from './src/scroll-area-thumb';
import { RdxScrollAreaViewport } from './src/scroll-area-viewport';
import { NgModule } from '@angular/core';

export * from './src/scroll-area-content';
export * from './src/scroll-area-corner';
export * from './src/scroll-area-root';
export * from './src/scroll-area-scrollbar';
export * from './src/scroll-area-thumb';
export * from './src/scroll-area-viewport';

const _imports = [
    RdxScrollAreaRoot,
    RdxScrollAreaViewport,
    RdxScrollAreaContent,
    RdxScrollAreaScrollbar,
    RdxScrollAreaThumb,
    RdxScrollAreaCorner
];

@NgModule({
    imports: [..._imports],
    exports: [..._imports]
})
export class RdxScrollAreaModule {}
