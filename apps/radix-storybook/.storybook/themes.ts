import { create } from 'storybook/theming';

// Logo SVG bundled as a data URL so no public-folder dep is needed.
// Text is embedded directly in the SVG (img src can't use page-loaded fonts, so system-ui is used).
// "Radix" gets font-weight 800, "Angular" gets 400 — visually matches the brand.
const logo = (fill: string) => {
    const svg = [
        // width/height are 1.2× the viewBox dimensions — the browser maps viewBox → width×height,
        // scaling all content (icon + text) up by 20% while preserving aspect ratio.
        `<svg width="202" height="29" viewBox="0 0 168 24" xmlns="http://www.w3.org/2000/svg">`,
        // Icon path — original viewBox 0 0 24 24
        `<path fill="${fill}" fill-rule="evenodd" clip-rule="evenodd" d="M11.576 2.00343L3 6.28335L3.02794 16.4367L3.02533 16.4391L3.02794 16.4379L3.02795 16.4408L3.03419 16.4352C5.58784 15.3254 7.85549 13.3817 9.4478 10.6971L9.45551 10.6902L9.45806 10.6798C11.047 7.99289 11.7245 4.96369 11.5773 2.01016L11.5794 2.00173L11.577 2.00294L11.5768 2L11.576 2.00343ZM12.424 2.00343L21 6.28335L20.9721 16.4367L20.9747 16.4391L20.9721 16.4379L20.972 16.4408L20.9658 16.4352C18.4122 15.3254 16.1445 13.3817 14.5522 10.6971L14.5445 10.6902L14.5419 10.6798C12.953 7.99289 12.2755 4.96369 12.4227 2.01016L12.4206 2.00173L12.423 2.00294L12.4232 2L12.424 2.00343ZM12.0978 22.25L3.79429 17.3315L3.79085 17.3325L3.79328 17.3309L3.79085 17.3295L3.79922 17.327C6.13674 15.7832 8.99744 14.8743 12.0874 14.8723L12.0978 14.8692L12.1082 14.8723C15.1981 14.8743 18.0588 15.7832 20.3963 17.327L20.4048 17.3295L20.4023 17.3309L20.4047 17.3325L20.4013 17.3315L12.0978 22.25Z"/>`,
        // Brand text — y=19 centers ~14px cap height (72% of 20px) in a 24-unit tall SVG
        `<text x="30" y="19" fill="${fill}" font-family="system-ui,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif" font-size="20" letter-spacing="-0.01em">`,
        `<tspan font-weight="800">Radix</tspan>`,
        `<tspan font-weight="400"> Angular</tspan>`,
        `</text>`,
        `</svg>`
    ].join('');
    return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Colors are hex approximations of the oklch tokens in tailwind.css:
//   light foreground oklch(14.5% 1% 264) ≈ #18181f   border oklch(90% 1% 264) ≈ #e2e2ea
//   dark  foreground oklch(96% 0.5% 264) ≈ #f3f3f7   border oklch(30% 1% 264) ≈ #3b3b49

const base = {
    // Empty string keeps img decorative (text is in the SVG) and hides the separate title span.
    brandTitle: '',
    brandUrl: 'https://github.com/radix-ng/primitives',
    brandTarget: '_blank',
    fontBase: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    fontCode: "'JetBrains Mono', 'Roboto Mono', Consolas, Menlo, Monaco, monospace"
};

export const light = create({
    ...base,
    base: 'light',
    brandImage: logo('#18181f'),

    appBg: '#f4f4f8',
    appContentBg: '#ffffff',
    appPreviewBg: '#ffffff',
    appBorderColor: '#e2e2ea',
    appBorderRadius: 8,

    textColor: '#18181f',
    textMutedColor: '#67677a',

    colorPrimary: '#18181f',
    colorSecondary: '#18181f',

    barBg: '#f4f4f8',
    barTextColor: '#67677a',
    barSelectedColor: '#18181f',
    barHoverColor: '#18181f',

    inputBg: '#ffffff',
    inputBorder: '#e2e2ea',
    inputTextColor: '#18181f',
    inputBorderRadius: 6,

    booleanBg: '#e2e2ea',
    booleanSelectedBg: '#18181f'
});

export const dark = create({
    ...base,
    base: 'dark',
    brandImage: logo('#f3f3f7'),

    appBg: '#202028',
    appContentBg: '#18181f',
    appPreviewBg: '#18181f',
    appBorderColor: '#3b3b49',
    appBorderRadius: 8,

    textColor: '#f3f3f7',
    textMutedColor: '#a0a0b0',

    colorPrimary: '#f3f3f7',
    colorSecondary: '#f3f3f7',

    barBg: '#202028',
    barTextColor: '#a0a0b0',
    barSelectedColor: '#f3f3f7',
    barHoverColor: '#f3f3f7',

    inputBg: '#202028',
    inputBorder: '#3b3b49',
    inputTextColor: '#f3f3f7',
    inputBorderRadius: 6,

    booleanBg: '#3b3b49',
    booleanSelectedBg: '#f3f3f7'
});
