import {
  ArrayType,
  DeclarationReflection,
  Reflection,
  ReflectionType,
  SomeType,
  UnionType,
} from 'typedoc';

import { formatTypeCustom } from './format-type-custom';
import { getNearestProjectReflection } from './reflections';
import { remapLambdaNames } from './remap-lambda-names';

/**
 * Whether a type needs custom formatting. TypeDoc returns an expressive string
 * representation of all types except for its ReflectionType, which will output
 * either "Function" or "Object". This function checks if a type is a
 * ReflectionType or if its a type that might have a ReflectionType nested
 * within it.
 */
function needsCustomFormatting(type: SomeType): boolean {
  return !!(
    type instanceof ReflectionType ||
    (type instanceof UnionType &&
      type.types.find(
        (t) =>
          t instanceof ReflectionType ||
          (t instanceof ArrayType && t.elementType instanceof ReflectionType),
      )) ||
    (type instanceof ArrayType && type.elementType instanceof ReflectionType)
  );
}

/**
 * Returns a string representation of a reflection's type.
 */
export function formatType(
  reflection: Reflection & {
    type?: SomeType;
  },
): string {
  let type = reflection.type;

  // If the type has signatures, it's type information is stored there.
  if (!type && reflection instanceof DeclarationReflection) {
    type =
      reflection.type ??
      reflection.getAllSignatures().find((signature) => signature.type)?.type;
  }

  if (!type) {
    console.warn(
      `  [!] The type for the reflection \`${reflection.name}\` is not ` +
        'defined. Defaulting to `unknown`.',
    );

    return 'unknown';
  }

  // First, format the type using TypeDoc's default formatter.
  let formatted = type.toString();

  if (needsCustomFormatting(type)) {
    const customFormatted = formatTypeCustom(reflection.type);
    console.warn(
      `  [!] TypeDoc produced \`${formatted}\` but we want a more expressive type for \`${reflection.name}\`. ` +
        `Created:
      \`\`\`
      ${customFormatted}
      \`\`\`
`,
    );

    formatted = customFormatted;
  }

  // Remap lambda names to their original names.
  formatted = remapLambdaNames(
    formatted,
    getNearestProjectReflection(reflection),
  );

  return formatted;
}
