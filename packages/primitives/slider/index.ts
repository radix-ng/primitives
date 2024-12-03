import { NgModule } from '@angular/core';
import { RdxSliderRangeComponent } from './src/slider-range.component';
import { RdxSliderRootComponent } from './src/slider-root.component';
import { RdxSliderThumbComponent } from './src/slider-thumb.component';
import { RdxSliderTrackComponent } from './src/slider-track.component';

export * from './src/slider-horizontal.component';
export * from './src/slider-impl.directive';
export * from './src/slider-range.component';
export * from './src/slider-root.component';
export * from './src/slider-thumb-impl.directive';
export * from './src/slider-thumb.component';
export * from './src/slider-track.component';
export * from './src/slider-vertical.component';

const _imports = [RdxSliderRootComponent, RdxSliderTrackComponent, RdxSliderRangeComponent, RdxSliderThumbComponent];

@NgModule({
    imports: [..._imports],
    exports: [..._imports]
})
export class RdxSliderModule {}
