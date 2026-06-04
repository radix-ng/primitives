import { NgModule } from '@angular/core';
import { RdxMeterIndicatorDirective } from './src/meter-indicator.directive';
import { RdxMeterLabelDirective } from './src/meter-label.directive';
import { RdxMeterRootDirective } from './src/meter-root.directive';
import { RdxMeterTrackDirective } from './src/meter-track.directive';
import { RdxMeterValueDirective } from './src/meter-value.directive';

export * from './src/meter-indicator.directive';
export * from './src/meter-label.directive';
export * from './src/meter-root.directive';
export * from './src/meter-track.directive';
export * from './src/meter-value.directive';

export type { MeterProps, MeterValueFormatter } from './src/meter-root.directive';

const _imports = [
    RdxMeterRootDirective,
    RdxMeterLabelDirective,
    RdxMeterValueDirective,
    RdxMeterTrackDirective,
    RdxMeterIndicatorDirective
];

@NgModule({
    imports: [..._imports],
    exports: [..._imports]
})
export class RdxMeterModule {}
