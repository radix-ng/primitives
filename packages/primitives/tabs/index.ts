import { NgModule } from '@angular/core';
import { RdxTabsContentDirective } from './src/tabs-content.directive';
import { RdxTabsContextService } from './src/tabs-context.service';
import { RdxTabsListDirective } from './src/tabs-list.directive';
import { RdxTabsRootDirective } from './src/tabs-root.directive';
import { RdxTabsTriggerDirective } from './src/tabs-trigger.directive';

export * from './src/tabs-content.directive';
export * from './src/tabs-context.service';
export * from './src/tabs-list.directive';
export * from './src/tabs-root.directive';
export * from './src/tabs-trigger.directive';

const tabsImports = [
    RdxTabsRootDirective,
    RdxTabsContentDirective,
    RdxTabsListDirective,
    RdxTabsTriggerDirective
];

@NgModule({
    imports: [...tabsImports],
    exports: [...tabsImports],
    providers: [RdxTabsContextService]
})
export class RdxTabsModule {}
