import { setCompodocJson } from '@storybook/addon-docs/angular';
import docJson from '../documentation.json';

export default {
    init() {
        const docToCleanup = [...docJson.components, ...docJson.directives];

        for (const doc of docToCleanup) {
            doc.propertiesClass = [];
            doc.methodsClass = [];
        }

        setCompodocJson(docJson);
    }
};
