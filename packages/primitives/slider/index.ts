import { NgModule } from '@angular/core';
import { RdxSliderControl } from './src/slider-control';
import { RdxSliderIndicator } from './src/slider-indicator';
import { RdxSliderRoot } from './src/slider-root';
import { RdxSliderThumb } from './src/slider-thumb';
import { RdxSliderThumbInput } from './src/slider-thumb-input';
import { RdxSliderTrack } from './src/slider-track';
import { RdxSliderValue } from './src/slider-value';

export * from './src/slider-context';
export * from './src/slider-control';
export * from './src/slider-indicator';
export * from './src/slider-root';
export * from './src/slider-thumb';
export * from './src/slider-thumb-input';
export * from './src/slider-track';
export * from './src/slider-value';
export * from './src/slider.utils';

const _imports = [
    RdxSliderRoot,
    RdxSliderControl,
    RdxSliderTrack,
    RdxSliderIndicator,
    RdxSliderThumb,
    RdxSliderThumbInput,
    RdxSliderValue
];

@NgModule({
    imports: [..._imports],
    exports: [..._imports]
})
export class RdxSliderModule {}
