import { NgModule } from '@angular/core';
import { RdxCollapsiblePanelDirective } from './src/collapsible-panel.directive';
import { RdxCollapsibleRootDirective } from './src/collapsible-root.directive';
import { RdxCollapsibleTriggerDirective } from './src/collapsible-trigger.directive';

export * from './src/collapsible-panel.directive';
export * from './src/collapsible-root.directive';
export * from './src/collapsible-trigger.directive';

const _imports = [RdxCollapsiblePanelDirective, RdxCollapsibleRootDirective, RdxCollapsibleTriggerDirective];

@NgModule({
    imports: [..._imports],
    exports: [..._imports]
})
export class RdxCollapsibleModule {}
