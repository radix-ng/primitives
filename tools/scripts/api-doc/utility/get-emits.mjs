import { staticMessages } from '../constants.mjs';
import { extractParameter, getCommentSummary, getDeprecatedText } from '../utils.mjs';

/**
 *
 * @param {Array} emitsChildren
 * @returns {{description: string, values: Array}}
 */
export const processComponentEmits = (emitsChildren) => {
    const emits = {
        description: staticMessages['emits'],
        values: []
    };

    emitsChildren.forEach((emitter) => {
        const paramName = extractParameter(emitter)?.includes('Event') ? 'event' : 'value';

        emits.values.push({
            name: emitter.name,
            parameters: [
                {
                    name: paramName,
                    type: extractParameter(emitter)
                }
            ],
            description: getCommentSummary(emitter.comment),
            deprecated: getDeprecatedText(emitter)
        });
    });

    return emits;
};
