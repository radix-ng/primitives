import { NgModule } from '@angular/core';
import { RdxHoverCardAnchorDirective } from './src/hover-card-anchor.directive';
import { RdxHoverCardArrowDirective } from './src/hover-card-arrow.directive';
import { RdxHoverCardCloseDirective } from './src/hover-card-close.directive';
import { RdxHoverCardContentAttributesComponent } from './src/hover-card-content-attributes.component';
import { RdxHoverCardContentDirective } from './src/hover-card-content.directive';
import { RdxHoverCardRootDirective } from './src/hover-card-root.directive';
import { RdxHoverCardTriggerDirective } from './src/hover-card-trigger.directive';

export * from './src/hover-card-anchor.directive';
export * from './src/hover-card-arrow.directive';
export * from './src/hover-card-close.directive';
export * from './src/hover-card-content-attributes.component';
export * from './src/hover-card-content.directive';
export * from './src/hover-card-root.directive';
export * from './src/hover-card-trigger.directive';

const _imports = [
    RdxHoverCardArrowDirective,
    RdxHoverCardCloseDirective,
    RdxHoverCardContentDirective,
    RdxHoverCardTriggerDirective,
    RdxHoverCardRootDirective,
    RdxHoverCardAnchorDirective,
    RdxHoverCardContentAttributesComponent
];

@NgModule({
    imports: [..._imports],
    exports: [..._imports]
})
export class RdxHoverCardModule {}
