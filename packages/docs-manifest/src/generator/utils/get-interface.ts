import { type DeclarationReflection } from 'typedoc';

import type {
  SkyManifestInterfaceDefinition,
  SkyManifestInterfacePropertyDefinition,
} from '../../types/interface-def';

import { formatType } from './format-type';
import { getAnchorId } from './get-anchor-id';
import { getComment } from './get-comment';
import { getIndexSignatures } from './get-index-signatures';

function getInterfaceProperties(
  decl: DeclarationReflection,
): SkyManifestInterfacePropertyDefinition[] {
  const properties: SkyManifestInterfacePropertyDefinition[] = [];

  if (decl.children) {
    for (const child of decl.children) {
      const {
        codeExample,
        codeExampleLanguage,
        deprecationReason,
        description,
        isDeprecated,
        isPreview,
      } = getComment(child);

      const isOptional = child.flags.isOptional ? true : undefined;

      properties.push({
        codeExample,
        codeExampleLanguage,
        deprecationReason,
        description,
        isDeprecated,
        isOptional,
        isPreview,
        kind: 'interface-property',
        name: child.name,
        type: formatType(child),
      });
    }
  }

  return properties;
}

export function getInterface(
  decl: DeclarationReflection,
  filePath: string,
): SkyManifestInterfaceDefinition {
  const {
    codeExample,
    codeExampleLanguage,
    deprecationReason,
    description,
    isDeprecated,
    isInternal,
    isPreview,
  } = getComment(decl);

  const indexSignatures = getIndexSignatures(decl);
  const children = getInterfaceProperties(decl);

  const def: SkyManifestInterfaceDefinition = {
    anchorId: getAnchorId(decl.name, decl.kind),
    children: children.length > 0 ? children : undefined,
    codeExample,
    codeExampleLanguage,
    deprecationReason,
    description,
    filePath,
    indexSignatures,
    isDeprecated,
    isInternal,
    isPreview,
    kind: 'interface',
    name: decl.name,
  };

  return def;
}
