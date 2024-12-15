import { type DeclarationReflection, IndexedAccessType, QueryType, TupleType, TypeOperatorType } from 'typedoc';

import type { SkyManifestTypeAliasDefinition } from '../../types/type-alias-def';

import { formatType } from './format-type';
import { getAnchorId } from './get-anchor-id';
import { getComment } from './get-comment';

/**
 * Gets the formatted type for a const assertion union.
 * @example
 * ```
 * const FOO = ['a', 'b', 'c'] as const;
 * type Foo = (typeof FOO)[number];
 *
 * // Returns: "'a' | 'b' | 'c'"
 * ```
 */
function formatConstAssertionUnionType(reflection: DeclarationReflection): string | undefined {
    if (reflection.type instanceof IndexedAccessType && reflection.type.objectType instanceof QueryType) {
        const reference = reflection.parent?.getChildByName(reflection.type.objectType.queryType.name);

        if (
            reference &&
            reference.isDeclaration() &&
            reference.type instanceof TypeOperatorType &&
            reference.type.target instanceof TupleType
        ) {
            return formatType(reference);
        }
    }

    return;
}

export function getTypeAlias(reflection: DeclarationReflection, filePath: string): SkyManifestTypeAliasDefinition {
    const { codeExample, codeExampleLanguage, deprecationReason, description, isDeprecated, isInternal, isPreview } =
        getComment(reflection);

    const formattedType = formatConstAssertionUnionType(reflection) ?? formatType(reflection);

    const def: SkyManifestTypeAliasDefinition = {
        anchorId: getAnchorId(reflection.name, reflection.kind),
        codeExample,
        codeExampleLanguage,
        deprecationReason,
        description,
        filePath,
        isDeprecated,
        isInternal,
        isPreview,
        kind: 'type-alias',
        name: reflection.name,
        type: formattedType
    };

    return def;
}
