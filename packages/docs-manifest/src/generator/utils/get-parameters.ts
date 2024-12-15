import {
  DeclarationReflection,
  ParameterReflection,
  SignatureReflection,
} from 'typedoc';

import type { SkyManifestParameterDefinition } from '../../types/function-def';

import { formatType } from './format-type';
import { getComment } from './get-comment';
import { getDefaultValue } from './get-default-value';

export function getParameters(
  reflection: DeclarationReflection | SignatureReflection,
): SkyManifestParameterDefinition[] | undefined {
  let params: ParameterReflection[] | undefined;

  if (reflection instanceof SignatureReflection) {
    params = reflection.parameters;
  } else {
    params = reflection.signatures?.[0]?.parameters;
  }

  if (!params || params.length === 0) {
    return;
  }

  const paramDefinitions: SkyManifestParameterDefinition[] = [];

  for (const param of params) {
    const { defaultValue, description } = getComment(param);

    paramDefinitions.push({
      defaultValue: getDefaultValue(param, defaultValue),
      description,
      isOptional: param.flags.isOptional ? true : undefined,
      name: param.name,
      type: formatType(param),
    });
  }

  return paramDefinitions;
}
