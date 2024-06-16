import { create } from '@storybook/theming/create';

export default create({
    base: 'light',
    brandTitle: 'Radix Angular',
    brandUrl: 'https://github.com/radix-ng/primitives',
    brandTarget: '_self',

    colorPrimary: '#272E35',
    colorSecondary: '#272E35',

    fontBase: '"Inter", sans-serif',

    appBg: '#ffffff',
    appContentBg: '#ffffff',
    appBorderColor: '#EAEDF0',
    appBorderRadius: 8,

    textColor: '#272E35',
    textInverseColor: '#ffffff',

    inputBg: '#ffffff',
    inputBorder: '#CFD6DD',
    inputTextColor: '#272E35',
    inputBorderRadius: 8
});
