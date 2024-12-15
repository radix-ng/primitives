import type { SkyManifestChildDefinition, SkyManifestParentDefinition } from './base-def';

/**
 * Information about an enumeration exported from the public API.
 * @internal
 */
export interface SkyManifestEnumerationDefinition extends SkyManifestParentDefinition {
    children: SkyManifestEnumerationMemberDefinition[];
}

/**
 * Information about an enumeration member.
 * @internal
 */
export interface SkyManifestEnumerationMemberDefinition extends SkyManifestChildDefinition {
    kind: 'enum-member';
}
