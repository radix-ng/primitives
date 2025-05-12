import { NgModule } from '@angular/core';
import { RdxProgressIndicatorDirective } from './src/progress-indicator.directive';
import { RdxProgressRootDirective } from './src/progress-root.directive';

export * from './src/progress-indicator.directive';
export * from './src/progress-root.directive';

export type { ProgressProps } from './src/progress-root.directive';

const _imports = [RdxProgressRootDirective, RdxProgressIndicatorDirective];

@NgModule({
    imports: [..._imports],
    exports: [..._imports]
})
export class RdxProgressModule {}
