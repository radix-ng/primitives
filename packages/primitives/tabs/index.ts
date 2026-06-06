import { NgModule } from '@angular/core';
import { RdxTabsIndicator } from './src/tabs-indicator';
import { RdxTabsList } from './src/tabs-list';
import { RdxTabsPanel } from './src/tabs-panel';
import { RdxTabsPanelPresence } from './src/tabs-panel-presence';
import { RdxTabsRoot } from './src/tabs-root';
import { RdxTabsTab } from './src/tabs-tab';

export * from './src/tabs-indicator';
export * from './src/tabs-list';
export * from './src/tabs-panel';
export * from './src/tabs-panel-presence';
export * from './src/tabs-root';
export * from './src/tabs-root-context';
export * from './src/tabs-tab';
export type { RdxTabsActivationDirection, RdxTabsValue } from './src/utils';

export const tabsImports = [RdxTabsRoot, RdxTabsList, RdxTabsTab, RdxTabsPanel, RdxTabsPanelPresence, RdxTabsIndicator];

@NgModule({
    imports: [...tabsImports],
    exports: [...tabsImports]
})
export class RdxTabsModule {}
