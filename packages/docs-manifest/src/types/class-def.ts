import type { SkyManifestChildDefinition, SkyManifestParentDefinition } from './base-def';
import type { SkyManifestParameterDefinition } from './function-def';

/**
 * Information about a class exported from the public API.
 * @internal
 */
export interface SkyManifestClassDefinition extends SkyManifestParentDefinition {
    children?: (SkyManifestClassMethodDefinition | SkyManifestClassPropertyDefinition)[];
    kind: 'class' | 'module' | 'service';
    typeParameters?: string;
}

/**
 * Information about a class method.
 * @internal
 */
export interface SkyManifestClassMethodDefinition extends SkyManifestChildDefinition {
    isStatic?: boolean;
    kind: 'class-method';
    parameters?: SkyManifestParameterDefinition[];
    typeParameters?: string;
}

/**
 * Information about a class property.
 * @internal
 */
export interface SkyManifestClassPropertyDefinition extends SkyManifestChildDefinition {
    defaultValue?: string;
    isStatic?: boolean;
    kind: 'class-property';
}
