import { NgModule } from '@angular/core';
import { RdxToolbarButtonDirective } from './src/toolbar-button.directive';
import { RdxToolbarLinkDirective } from './src/toolbar-link.directive';
import { RdxToolbarRootDirective } from './src/toolbar-root.directive';
import { RdxToolbarSeparatorDirective } from './src/toolbar-separator.directive';
import { RdxToolbarToggleGroupDirective } from './src/toolbar-toggle-group.directive';
import { RdxToolbarToggleItemDirective } from './src/toolbar-toggle-item.directive';

export * from './src/toolbar-button.directive';
export * from './src/toolbar-link.directive';
export * from './src/toolbar-root.directive';
export * from './src/toolbar-root.token';
export * from './src/toolbar-separator.directive';
export * from './src/toolbar-toggle-group.directive';
export * from './src/toolbar-toggle-item.directive';

const _imports = [
    RdxToolbarRootDirective,
    RdxToolbarButtonDirective,
    RdxToolbarLinkDirective,
    RdxToolbarToggleGroupDirective,
    RdxToolbarToggleItemDirective,
    RdxToolbarSeparatorDirective
];

@NgModule({
    imports: [..._imports],
    exports: [..._imports]
})
export class RdxToolbarModule {}
