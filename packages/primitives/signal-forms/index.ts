import { NgModule } from '@angular/core';
import { RdxSignalField } from './src/signal-field';
import { RdxSignalForm } from './src/signal-form';

export * from './src/signal-field';
export * from './src/signal-form';

export const _importsSignalForms = [RdxSignalField, RdxSignalForm];

@NgModule({
    imports: [..._importsSignalForms],
    exports: [..._importsSignalForms]
})
export class RdxSignalFormsModule {}
