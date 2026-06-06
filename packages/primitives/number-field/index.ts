import { NgModule } from '@angular/core';
import { RdxNumberFieldDecrement } from './src/number-field-decrement';
import { RdxNumberFieldGroup } from './src/number-field-group';
import { RdxNumberFieldHiddenInput } from './src/number-field-hidden-input';
import { RdxNumberFieldIncrement } from './src/number-field-increment';
import { RdxNumberFieldInput } from './src/number-field-input';
import { RdxNumberFieldRoot } from './src/number-field-root';
import { RdxNumberFieldScrubArea } from './src/number-field-scrub-area';
import { RdxNumberFieldScrubAreaCursor } from './src/number-field-scrub-area-cursor';

export * from './src/number-field-button';
export * from './src/number-field-context';
export * from './src/number-field-decrement';
export * from './src/number-field-group';
export * from './src/number-field-hidden-input';
export * from './src/number-field-increment';
export * from './src/number-field-input';
export * from './src/number-field-root';
export * from './src/number-field-scrub-area';
export * from './src/number-field-scrub-area-context';
export * from './src/number-field-scrub-area-cursor';
export * from './src/number-field.utils';
export * from './src/types';

const _imports = [
    RdxNumberFieldRoot,
    RdxNumberFieldGroup,
    RdxNumberFieldInput,
    RdxNumberFieldHiddenInput,
    RdxNumberFieldIncrement,
    RdxNumberFieldDecrement,
    RdxNumberFieldScrubArea,
    RdxNumberFieldScrubAreaCursor
];

@NgModule({
    imports: [..._imports],
    exports: [..._imports]
})
export class RdxNumberFieldModule {}
