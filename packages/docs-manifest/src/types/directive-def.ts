import type { SkyManifestChildDefinition, SkyManifestParentDefinition } from './base-def';

/**
 * Information about a directive or component exported from the public API.
 * @internal
 */
export interface SkyManifestDirectiveDefinition extends SkyManifestParentDefinition {
    children?: (SkyManifestDirectiveInputDefinition | SkyManifestDirectiveOutputDefinition)[];
    kind: 'directive' | 'component';
    selector?: string;
}

/**
 * Information about a directive input property.
 * @internal
 */
export interface SkyManifestDirectiveInputDefinition extends SkyManifestChildDefinition {
    defaultValue?: string;
    isRequired?: boolean;
    kind: 'directive-input';
}

/**
 * Information about a directive input property.
 * @internal
 */
export interface SkyManifestDirectiveOutputDefinition extends SkyManifestChildDefinition {
    kind: 'directive-output';
}
