import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { adaptChecks } from './checks.mjs';
import { navigationKey } from './keyboard.ts';

test('only macOS WebKit Tab navigation gets native full-keyboard modifiers', () => {
    assert.equal(navigationKey('Tab', 'webkit', 'darwin'), 'Alt+Tab');
    assert.equal(navigationKey('Shift+Tab', 'webkit', 'darwin'), 'Alt+Shift+Tab');
    for (const key of ['Escape', 'Enter', 'ArrowDown', 'Tab', 'Shift+Tab']) {
        assert.equal(navigationKey(key, 'chromium', 'darwin'), key);
        assert.equal(navigationKey(key, 'firefox', 'darwin'), key);
        assert.equal(navigationKey(key, 'webkit', 'linux'), key);
    }
    assert.equal(navigationKey('Escape', 'webkit', 'darwin'), 'Escape');
});

test('explicit navigation origin preserves the checkbox focus assertion and all later checks', () => {
    const source = readFileSync(new URL('../generation-v2.spec.ts', import.meta.url), 'utf8');
    const adapted = adaptChecks(source, 0, { explicitCheckboxOrigin: true });
    assert.ok(adapted.includes('await checkbox.focus();\n    await expect(checkbox).toBeFocused();'));
    const assertions = (text) => text.split('\n').filter((line) => line.includes('expect'));
    assert.deepEqual(assertions(adapted), assertions(source));
});

test('both copied suites preserve assertion lines and their scenario counts', () => {
    for (const [file, offset, count] of [
        ['../generation-v2.spec.ts', 0, 4],
        ['../email-field/generation.spec.ts', 2, 4]
    ]) {
        const source = readFileSync(new URL(file, import.meta.url), 'utf8');
        const adapted = adaptChecks(source, offset);
        const assertions = (text) => text.split('\n').filter((line) => line.includes('expect'));
        assert.deepEqual(assertions(adapted), assertions(source));
        assert.equal((adapted.match(/\btest\('/g) ?? []).length, count);
        assert.ok(adapted.includes(`?? 4541) + ${offset}`));
        assert.ok(!adapted.includes("process.env['RADIX_GENERATION_PORT']"));
    }
});
