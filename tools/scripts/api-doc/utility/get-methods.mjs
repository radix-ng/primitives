import { staticMessages } from '../constants.mjs';
import { getCommentSummary } from '../utils.mjs';

/**
 *
 * @param {Array} methodsChildren
 * @returns {{description: string, values: Array}}
 */
export const processComponentMethods = (methodsChildren) => {
    const methods = {
        description: staticMessages['methods'],
        values: []
    };

    methodsChildren.forEach((method) => {
        const signature = method.getAllSignatures()[0];
        methods.values.push({
            name: signature.name,
            parameters:
                signature.parameters?.map((param) => ({
                    name: param.name,
                    type: param.type.toString(),
                    description: getCommentSummary(param.comment)
                })) || [],
            description: getCommentSummary(signature.comment)
        });
    });

    return methods;
};
