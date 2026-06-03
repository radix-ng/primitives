import { RdxFormRoot } from './src/form-root';
import { NgModule } from '@angular/core';

export * from './src/form-root';

export const _importsForm = [RdxFormRoot];

@NgModule({
    imports: [..._importsForm],
    exports: [..._importsForm]
})
export class RdxFormModule {}
