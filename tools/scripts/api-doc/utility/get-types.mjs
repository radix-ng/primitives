import { staticMessages } from '../constants.mjs';
import { getCommentSummary, getDeprecatedText, parameters } from '../utils.mjs';

/**
 *
 * @param {Array} typesChildren
 * @returns {{description: string, values: Array}}
 */
export const processComponentTypes = (typesChildren) => {
    const types = {
        description: staticMessages['types'],
        values: []
    };

    typesChildren.forEach((type) => {
        types.values.push({
            name: type.name,
            description: getCommentSummary(type.comment),
            type: type.type?.toString(),
            parameters: parameters(type),
            deprecated: getDeprecatedText(type)
        });
    });

    return types;
};
