import { type DeclarationReflection } from 'typedoc';

import type {
  SkyManifestEnumerationDefinition,
  SkyManifestEnumerationMemberDefinition,
} from '../../types/enumeration-def';

import { formatType } from './format-type';
import { getAnchorId } from './get-anchor-id';
import { getComment } from './get-comment';

function getEnumMembers(
  reflection: DeclarationReflection,
): SkyManifestEnumerationMemberDefinition[] {
  const members: SkyManifestEnumerationMemberDefinition[] = [];

  if (reflection.children) {
    for (const child of reflection.children) {
      const {
        codeExample,
        codeExampleLanguage,
        deprecationReason,
        description,
        isDeprecated,
        isPreview,
      } = getComment(child);

      members.push({
        codeExample,
        codeExampleLanguage,
        deprecationReason,
        description,
        isDeprecated,
        isPreview,
        kind: 'enum-member',
        name: child.name,
        type: formatType(child),
      });
    }
  }

  return members;
}

export function getEnum(
  reflection: DeclarationReflection,
  filePath: string,
): SkyManifestEnumerationDefinition {
  const {
    codeExample,
    codeExampleLanguage,
    deprecationReason,
    description,
    isDeprecated,
    isInternal,
    isPreview,
  } = getComment(reflection);

  const def: SkyManifestEnumerationDefinition = {
    anchorId: getAnchorId(reflection.name, reflection.kind),
    codeExample,
    codeExampleLanguage,
    deprecationReason,
    description,
    filePath,
    isDeprecated,
    isInternal,
    isPreview,
    kind: 'enumeration',
    children: getEnumMembers(reflection),
    name: reflection.name,
  };

  return def;
}
