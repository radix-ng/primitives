import type { SkyManifestParentDefinition } from './base-def';

/**
 * Information about a type alias exported from the public API.
 * @internal
 */
export interface SkyManifestTypeAliasDefinition extends SkyManifestParentDefinition {
    kind: 'type-alias';
    type: string;
}
