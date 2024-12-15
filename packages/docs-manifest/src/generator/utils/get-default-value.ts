import { type Reflection } from 'typedoc';

export function getDefaultValue(
  reflection: Reflection & { defaultValue?: string },
  defaultValue?: string,
): string | undefined {
  defaultValue = defaultValue || reflection.defaultValue;

  // TypeDoc sometimes wraps default values in code blocks.
  if (defaultValue?.includes('```')) {
    defaultValue = defaultValue.split('\n')[1];
  }

  // TypeDoc version 0.20.x stopped auto-generating initializers for the default value
  // (and replaced them with "...") due to the complicated logic it required.
  // See: https://github.com/TypeStrong/typedoc/issues/1552
  if (defaultValue === '...') {
    defaultValue = undefined;
  }

  return defaultValue;
}
