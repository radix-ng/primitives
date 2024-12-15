import { type DeclarationReflection } from 'typedoc';

import type { SkyManifestVariableDefinition } from '../../types/variable-def';

import { formatType } from './format-type';
import { getAnchorId } from './get-anchor-id';
import { getComment } from './get-comment';

export function getVariable(reflection: DeclarationReflection, filePath: string): SkyManifestVariableDefinition {
    const { codeExample, codeExampleLanguage, deprecationReason, description, isDeprecated, isInternal, isPreview } =
        getComment(reflection);

    const def: SkyManifestVariableDefinition = {
        anchorId: getAnchorId(reflection.name, reflection.kind),
        codeExample,
        codeExampleLanguage,
        deprecationReason,
        description,
        filePath,
        isDeprecated,
        isInternal,

        isPreview,
        kind: 'variable',
        name: reflection.name,
        type: formatType(reflection)
    };

    return def;
}
