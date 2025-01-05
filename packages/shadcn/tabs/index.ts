import { NgModule } from '@angular/core';
import {
    ShTabsContentComponent,
    ShTabsDirective,
    ShTabsListDirective,
    ShTabsTriggerDirective
} from './src/tabs.directive';

export * from './src/tabs.directive';

const tabsImports = [
    ShTabsDirective,
    ShTabsContentComponent,
    ShTabsTriggerDirective,
    ShTabsListDirective
];

@NgModule({
    imports: [...tabsImports],
    exports: [...tabsImports]
})
export class ShTabsModule {}
