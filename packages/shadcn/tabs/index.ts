import { NgModule } from '@angular/core';
import {
    ShTabsContentDirective,
    ShTabsDirective,
    ShTabsListDirective,
    ShTabsTriggerDirective
} from './src/tabs.directive';

export * from './src/tabs.directive';

const tabsImports = [
    ShTabsDirective,
    ShTabsContentDirective,
    ShTabsTriggerDirective,
    ShTabsListDirective
];

@NgModule({
    imports: [...tabsImports],
    exports: [...tabsImports]
})
export class ShTabsModule {}
