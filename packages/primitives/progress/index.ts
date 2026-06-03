import { RdxProgressIndicatorDirective } from './src/progress-indicator.directive';
import { RdxProgressLabelDirective } from './src/progress-label.directive';
import { RdxProgressRootDirective } from './src/progress-root.directive';
import { RdxProgressTrackDirective } from './src/progress-track.directive';
import { RdxProgressValueDirective } from './src/progress-value.directive';
import { NgModule } from '@angular/core';

export * from './src/progress-indicator.directive';
export * from './src/progress-label.directive';
export type { ProgressProps, ProgressState, ProgressValueFormatter } from './src/progress-root.directive';
export * from './src/progress-root.directive';
export * from './src/progress-track.directive';
export * from './src/progress-value.directive';

const _imports = [
    RdxProgressRootDirective,
    RdxProgressLabelDirective,
    RdxProgressValueDirective,
    RdxProgressTrackDirective,
    RdxProgressIndicatorDirective
];

@NgModule({
    imports: [..._imports],
    exports: [..._imports]
})
export class RdxProgressModule {}
