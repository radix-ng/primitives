import type {
  SkyManifestChildDefinition,
  SkyManifestJsDocDefinition,
  SkyManifestParentDefinition,
} from './base-def';
import type { SkyManifestParameterDefinition } from './function-def';

/**
 * Information about an interface exported from the public API.
 * @internal
 */
export interface SkyManifestInterfaceDefinition
  extends SkyManifestParentDefinition {
  children?: SkyManifestInterfacePropertyDefinition[];
  indexSignatures?: SkyManifestIndexSignatureDefinition[];
  kind: 'interface';
}

/**
 * Information about an interface exported from the public API.
 * @internal
 */
export interface SkyManifestInterfacePropertyDefinition
  extends SkyManifestChildDefinition {
  isOptional?: boolean;
  kind: 'interface-property';
}

/**
 * Information about an object's index signature.
 * @internal
 */
export interface SkyManifestIndexSignatureDefinition
  extends SkyManifestJsDocDefinition {
  name: string;
  parameters: SkyManifestParameterDefinition[];
  type: string;
}
