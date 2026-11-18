import { expect, type Locator } from '@playwright/test';

/** Check the built theme, including utility precedence over the shared components layer. */
export async function expectDemoSurface(surface: Locator, shadow: 'shadow-none' | 'shadow-lg' = 'shadow-none') {
    const result = await surface.evaluate((element, shadow) => {
        const read = (node: Element) => {
            const css = getComputedStyle(node);
            return {
                background: css.backgroundColor,
                color: css.color,
                border: css.borderTopColor,
                borderWidth: css.borderTopWidth,
                radius: css.borderTopLeftRadius,
                shadow: css.boxShadow,
                width: css.width,
                padding: css.padding
            };
        };
        const base = read(element);
        const reference = document.createElement('div');
        reference.style.backgroundColor = 'var(--card)';
        reference.style.color = 'var(--card-foreground)';
        reference.style.borderColor = 'var(--border)';
        element.after(reference);
        const tokens = read(reference);
        reference.removeAttribute('style');
        reference.className = `bg-muted border border-transparent ${shadow}`;
        const overrides = read(reference);
        const classes = element.className;
        const results = [];
        for (const className of [`${reference.className} ${classes}`, `${classes} ${reference.className}`]) {
            element.className = className;
            results.push(read(element));
        }
        element.className = classes;
        reference.remove();
        return { base, tokens, overrides, results };
    }, shadow);
    expect(result.base).toMatchObject({
        background: result.tokens.background,
        color: result.tokens.color,
        border: result.tokens.border,
        borderWidth: '1px',
        radius: '6px',
        width: '320px',
        padding: '16px'
    });
    expect(result.base.shadow).not.toBe('none');
    expect(result.overrides.background).not.toBe(result.base.background);
    expect(result.overrides.border).not.toBe(result.base.border);
    expect(result.overrides.shadow).not.toBe(result.base.shadow);
    for (const overridden of result.results) {
        expect(overridden).toMatchObject({
            background: result.overrides.background,
            border: result.overrides.border,
            shadow: result.overrides.shadow
        });
    }
}
