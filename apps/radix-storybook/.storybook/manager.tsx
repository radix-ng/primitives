import { addons } from '@storybook/manager-api';

import rdxTheme from './rdxTheme';

addons.setConfig({
    theme: rdxTheme,
    sidebar: {
        renderLabel: ({ name }) => {
            const statusRegex = /\[([^)]+)]/gi;
            const [statusMatch, statusType] = statusRegex.exec(name) || [];

            if (statusMatch) {
                return name.replace(statusMatch, '').trim() + ' ' + statusMatch;
            }

            return name;
        }
    }
});
