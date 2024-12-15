/**
 * The kind of entity exported from the public API.
 * @internal
 */
export type SkyManifestParentDefinitionKind =
    | 'class'
    | 'component'
    | 'directive'
    | 'enumeration'
    | 'function'
    | 'interface'
    | 'module'
    | 'pipe'
    | 'service'
    | 'type-alias'
    | 'variable';

/**
 * The kind of child entity exported from the public API.
 * @internal
 */
export type SkyManifestChildDefinitionKind =
    | 'class-method'
    | 'class-property'
    | 'directive-input'
    | 'directive-output'
    | 'enum-member'
    | 'interface-property';

export type SkyManifestCodeExampleLanguage = 'markup' | 'typescript';

/**
 * Information captured from JSDoc comments.
 * @internal
 */
export interface SkyManifestJsDocDefinition {
    codeExample?: string;
    codeExampleLanguage?: SkyManifestCodeExampleLanguage;
    deprecationReason?: string;
    description?: string;
    isDeprecated?: boolean;
    isPreview?: boolean;
}

/**
 * Information shared by all top-level entities exported from the public API.
 * @internal
 */
export interface SkyManifestParentDefinition extends SkyManifestJsDocDefinition {
    anchorId: string;
    children?: SkyManifestChildDefinition[];
    filePath: string;
    isInternal?: boolean;
    kind: SkyManifestParentDefinitionKind;
    name: string;
}

/**
 * Information shared by all child entities exported from the public API.
 * @internal
 */
export interface SkyManifestChildDefinition extends SkyManifestJsDocDefinition {
    kind: SkyManifestChildDefinitionKind;
    name: string;
    type: string;
}
