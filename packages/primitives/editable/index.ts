import { RdxEditableArea } from './src/editable-area';
import { RdxEditableCancelTrigger } from './src/editable-cancel-trigger';
import { RdxEditableEditTrigger } from './src/editable-edit-trigger';
import { RdxEditableInput } from './src/editable-input';
import { RdxEditablePreview } from './src/editable-preview';
import { RdxEditableRoot } from './src/editable-root';
import { RdxEditableSubmitTrigger } from './src/editable-submit-trigger';
import { NgModule } from '@angular/core';

export * from './src/editable-area';
export * from './src/editable-cancel-trigger';
export * from './src/editable-edit-trigger';
export * from './src/editable-input';
export * from './src/editable-preview';
export * from './src/editable-root';
export * from './src/editable-submit-trigger';

const _imports = [
    RdxEditableRoot,
    RdxEditableArea,
    RdxEditablePreview,
    RdxEditableInput,
    RdxEditableEditTrigger,
    RdxEditableSubmitTrigger,
    RdxEditableCancelTrigger
];

@NgModule({
    imports: [..._imports],
    exports: [..._imports]
})
export class RdxEditableModule {}
