import {
  SkyManifestClassMethodDefinition,
  SkyManifestClassPropertyDefinition,
} from '../../types/class-def';
import type { SkyManifestPipeDefinition } from '../../types/pipe-def';
import type { DeclarationReflectionWithDecorators } from '../types/declaration-reflection-with-decorators';

import { getAnchorId } from './get-anchor-id';
import { getClass } from './get-class';
import { remapLambdaName } from './remap-lambda-names';

export function getPipe(
  decl: DeclarationReflectionWithDecorators,
  filePath: string,
): SkyManifestPipeDefinition {
  const reflection = getClass(decl, 'class', filePath);

  const pipeName = remapLambdaName(decl);
  const templateBindingName = decl.decorators?.[0]?.arguments?.[
    'name'
  ] as string;

  let children:
    | (SkyManifestClassPropertyDefinition | SkyManifestClassMethodDefinition)[]
    | undefined = reflection.children;

  /* istanbul ignore if: safety check */
  if (!children) {
    children = [];
  }

  const pipe: SkyManifestPipeDefinition = {
    ...reflection,
    anchorId: getAnchorId(pipeName, decl.kind),
    children,
    kind: 'pipe',
    name: pipeName,
    templateBindingName,
  };

  return pipe;
}
