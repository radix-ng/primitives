import assert from 'node:assert/strict';

/** Adapt copies only; keep every assertion and non-navigation key from the historical checks. */
export function adaptChecks(source, offset, { explicitCheckboxOrigin = false } = {}) {
    assert.ok(source.includes("from '@playwright/test'"));
    assert.ok(source.includes("process.env['RADIX_GENERATION_PORT']"));
    let converted = source
        .replace(/async \(\{\s*page\s*\}\)/g, 'async ({ page, browserName })')
        .replaceAll('page.keyboard.press(', 'pressKey(page, browserName, ')
        .replace(
            /Number\(process\.env\['RADIX_GENERATION_PORT'\] \?\? \d+\)/g,
            `Number(process.env['RADIX_MATRIX_PORT'] ?? 4541) + ${offset}`
        );
    if (explicitCheckboxOrigin) {
        const assertion = '    await expect(checkbox).toBeFocused();';
        assert.ok(converted.includes(assertion));
        converted = converted.replace(assertion, `    await checkbox.focus();\n${assertion}`);
    }
    assert.ok(!converted.includes('page.keyboard.press('));
    assert.equal((converted.match(/\bexpect\b/g) ?? []).length, (source.match(/\bexpect\b/g) ?? []).length);
    return `import { pressKey } from './keyboard';\n${converted}`;
}
