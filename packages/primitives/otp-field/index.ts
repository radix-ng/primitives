import { NgModule } from '@angular/core';
import { RdxOtpFieldInput } from './src/otp-field-input';
import { RdxOtpFieldRoot } from './src/otp-field-root';
import { RdxOtpFieldSeparator } from './src/otp-field-separator';

export * from './src/otp-field-context';
export * from './src/otp-field-input';
export * from './src/otp-field-root';
export * from './src/otp-field-separator';
export * from './src/types';

const _imports = [RdxOtpFieldRoot, RdxOtpFieldInput, RdxOtpFieldSeparator];

@NgModule({
    imports: [..._imports],
    exports: [..._imports]
})
export class RdxOtpFieldModule {}
