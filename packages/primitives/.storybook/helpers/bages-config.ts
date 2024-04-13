import { BadgesConfig } from '@geometricpanda/storybook-addon-badges';

export enum BADGE {
    BETA,
    PREVIEW,
    UPDATED,
    SOON
}

export const badgesConfig: BadgesConfig = {
    [BADGE.BETA]: {
        styles: {
            backgroundColor: 'color(display-p3 1 1 1/0.8)',
            color: 'gray',
            borderColor: 'color(display-p3 0.008 0.008 0.165/0.15)'
        },
        title: 'Beta'
    },
    [BADGE.PREVIEW]: {
        styles: {
            backgroundColor: 'color(display-p3 1 1 1/0.8)',
            color: 'gray',
            borderColor: 'color(display-p3 0.008 0.008 0.165/0.15)'
        },
        title: 'Preview'
    },
    [BADGE.UPDATED]: {
        styles: {
            backgroundColor: 'color(display-p3 1 1 1/0.8)',
            color: 'gray',
            borderColor: 'color(display-p3 0.008 0.008 0.165/0.15)'
        },
        title: 'Updated'
    },
    [BADGE.SOON]: {
        styles: {
            backgroundColor: 'color(display-p3 1 1 1/0.8)',
            color: 'gray',
            borderColor: 'color(display-p3 0.008 0.008 0.165/0.15)'
        },
        title: 'Soon'
    }
};
