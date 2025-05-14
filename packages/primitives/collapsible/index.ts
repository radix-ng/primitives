import { NgModule } from '@angular/core';
import { RdxCollapsibleContentPresenceDirective } from './src/collapsible-content-presence.directive';
import { RdxCollapsibleContentDirective } from './src/collapsible-content.directive';
import { RdxCollapsibleRootDirective } from './src/collapsible-root.directive';
import { RdxCollapsibleTriggerDirective } from './src/collapsible-trigger.directive';

export * from './src/collapsible-content-presence.directive';
export * from './src/collapsible-content.directive';
export * from './src/collapsible-root.directive';
export * from './src/collapsible-trigger.directive';

const _imports = [
    RdxCollapsibleContentDirective,
    RdxCollapsibleRootDirective,
    RdxCollapsibleTriggerDirective,
    RdxCollapsibleContentPresenceDirective
];

@NgModule({
    imports: [..._imports],
    exports: [..._imports]
})
export class RdxCollapsibleModule {}
