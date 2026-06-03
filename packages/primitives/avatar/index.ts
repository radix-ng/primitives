import { RdxAvatarFallbackDirective } from './src/avatar-fallback.directive';
import { RdxAvatarImageDirective } from './src/avatar-image.directive';
import { RdxAvatarRootDirective } from './src/avatar-root.directive';
import { NgModule } from '@angular/core';

export * from './src/avatar.config';
export * from './src/avatar-context.token';
export * from './src/avatar-fallback.directive';
export * from './src/avatar-image.directive';
export * from './src/avatar-root.directive';
export type { HTMLAttributeReferrerPolicy, RdxImageLoadingStatus } from './src/types';

const _imports = [RdxAvatarRootDirective, RdxAvatarFallbackDirective, RdxAvatarImageDirective];

@NgModule({
    imports: [..._imports],
    exports: [..._imports]
})
export class RdxAvatarModule {}
