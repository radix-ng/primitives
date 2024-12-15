import { SkyManifestParentDefinition } from './base-def';

/**
 * Information about the SKY UX public API.
 * @internal
 */
export interface SkyManifestPublicApi {
  packages: Record<string, SkyManifestParentDefinition[]>;
}
