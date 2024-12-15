import { ReflectionKind } from 'typedoc';

import { dasherize } from './strings';

/**
 * Returns a URL-safe anchor ID based on the reflection name and kind.
 */
export function getAnchorId(name: string, kind: ReflectionKind): string {
  const anchorId = `${dasherize(ReflectionKind[kind])}_${dasherize(name)}`;

  return anchorId;
}
