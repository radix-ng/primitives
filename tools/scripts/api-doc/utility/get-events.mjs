import { staticMessages } from '../constants.mjs';
import { getCommentSummary, getDeprecatedText } from '../utils.mjs';

/**
 *
 * @param {Array} eventsChildren
 * @returns {{description: string, values: Array}}
 */
export const processComponentEvents = (eventsChildren) => {
    const events = {
        description: staticMessages['events'],
        values: []
    };

    eventsChildren.forEach((event) => {
        events.values.push({
            name: event.name,
            description: getCommentSummary(event.comment),
            props: event.children?.map((child) => ({
                name: child.name,
                optional: child.flags?.isOptional,
                readonly: child.flags?.isReadonly,
                type: child.type?.toString(),
                description: getCommentSummary(child.comment),
                deprecated: getDeprecatedText(child)
            }))
        });
    });

    return events;
};
