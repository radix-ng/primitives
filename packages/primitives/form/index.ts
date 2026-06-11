import { NgModule } from '@angular/core';
import { RdxFormRoot } from './src/form-root';

export * from './src/form-root';

export const _importsForm = [RdxFormRoot];

@NgModule({
    imports: [..._importsForm],
    exports: [..._importsForm]
})
export class RdxFormModule {}
