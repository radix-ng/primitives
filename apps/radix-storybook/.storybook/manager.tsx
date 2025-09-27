import { addons } from 'storybook/manager-api';

addons.setConfig({
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
