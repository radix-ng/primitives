import { NgModule } from '@angular/core';
import { RdxToolbarButton } from './src/toolbar-button';
import { RdxToolbarGroup } from './src/toolbar-group';
import { RdxToolbarInput } from './src/toolbar-input';
import { RdxToolbarLink } from './src/toolbar-link';
import { RdxToolbarRoot } from './src/toolbar-root';
import { RdxToolbarSeparator } from './src/toolbar-separator';

export * from './src/toolbar-button';
export * from './src/toolbar-context';
export * from './src/toolbar-group';
export * from './src/toolbar-input';
export * from './src/toolbar-link';
export * from './src/toolbar-root';
export * from './src/toolbar-separator';

export const toolbarImports = [
    RdxToolbarRoot,
    RdxToolbarButton,
    RdxToolbarLink,
    RdxToolbarInput,
    RdxToolbarGroup,
    RdxToolbarSeparator
];

@NgModule({
    imports: [...toolbarImports],
    exports: [...toolbarImports]
})
export class RdxToolbarModule {}
