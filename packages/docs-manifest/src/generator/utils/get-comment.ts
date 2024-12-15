import {
  type Comment,
  type CommentDisplayPart,
  type CommentTag,
  DeclarationReflection,
} from 'typedoc';

import { SkyManifestCodeExampleLanguage } from '../../types/base-def';

interface SkyManifestComment {
  codeExample?: string;
  codeExampleLanguage?: SkyManifestCodeExampleLanguage;
  defaultValue?: string;
  deprecationReason?: string;
  description?: string;
  isDeprecated?: boolean;
  isInternal?: boolean;
  isPreview?: boolean;
  isRequired?: boolean;
}

const DEFAULT_CODE_EXAMPLE_LANGUAGE: SkyManifestCodeExampleLanguage = 'markup';
const ALLOWED_LANGUAGES: SkyManifestCodeExampleLanguage[] = [
  'markup',
  'typescript',
];

function getCommentTagText(parts: CommentDisplayPart[]): string | undefined {
  return (
    parts
      .map((item) => item.text)
      .join('')
      .trim() || undefined
  );
}

function getCodeExample(comment: CommentTag): {
  codeExample: string | undefined;
  codeExampleLanguage: SkyManifestCodeExampleLanguage | undefined;
} {
  let codeExample = getCommentTagText(comment.content)?.split('```')[1];
  let codeExampleLanguage: SkyManifestCodeExampleLanguage | undefined;

  if (codeExample) {
    codeExampleLanguage = DEFAULT_CODE_EXAMPLE_LANGUAGE;

    // The code example specifies a language.
    if (!codeExample.startsWith('\n')) {
      const fragments = codeExample.split('\n').map((c) => c.trim());
      const language = fragments[0] as SkyManifestCodeExampleLanguage;

      codeExample = fragments[1];

      if (ALLOWED_LANGUAGES.includes(language)) {
        codeExampleLanguage = language;
      }
    } else {
      codeExample = codeExample.trim();
    }
  }

  return { codeExample, codeExampleLanguage };
}

/**
 * Gets information about the reflection's JSDoc comment block.
 */
export function getComment(reflection: {
  name: string;
  comment?: Comment;
}): SkyManifestComment {
  let codeExample: string | undefined;
  let codeExampleLanguage: SkyManifestCodeExampleLanguage | undefined;
  let defaultValue: string | undefined;
  let deprecationReason: string | undefined;
  let description: string | undefined;
  let isDeprecated: boolean | undefined;
  let isInternal: boolean | undefined;
  let isPreview: boolean | undefined;
  let isRequired: boolean | undefined;

  let comment = reflection.comment;

  if (!comment && reflection instanceof DeclarationReflection) {
    comment = reflection
      .getAllSignatures()
      .find((signature) => signature.comment)?.comment;
  }

  if (comment) {
    isInternal = comment.modifierTags.has('@internal') ? true : undefined;

    if (comment.blockTags) {
      comment.blockTags.forEach((tag) => {
        switch (tag.tag) {
          case '@default':
          case '@defaultValue': {
            defaultValue = getCommentTagText(tag.content);
            break;
          }

          case '@deprecated': {
            isDeprecated = true;
            deprecationReason = getCommentTagText(tag.content);
            break;
          }

          case '@example': {
            const example = getCodeExample(tag);
            codeExample = example.codeExample;
            codeExampleLanguage = example.codeExampleLanguage;
            break;
          }

          case '@preview':
            isPreview = true;
            break;

          case '@required':
            isRequired = true;
            break;

          default:
            break;
        }
      });
    }

    description =
      comment.summary
        .map((item) => item.text)
        .join('')
        .trim()
        .replace(/(\r\n|\n|\r)/gm, ' ') || undefined;
  }

  return {
    codeExample,
    codeExampleLanguage,
    defaultValue,
    deprecationReason,
    description,
    isDeprecated,
    isInternal,
    isPreview,
    isRequired,
  } satisfies SkyManifestComment;
}
