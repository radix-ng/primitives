import '@angular/compiler';
import { NgModule, provideZonelessChangeDetection } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import '@testing-library/jest-dom/vitest';
import { toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

@NgModule({
    providers: [provideZonelessChangeDetection()]
})
class TestModule {}

getTestBed().initTestEnvironment([BrowserTestingModule, TestModule], platformBrowserTesting(), {
    errorOnUnknownElements: true,
    errorOnUnknownProperties: true
});

expect.extend(toHaveNoViolations);

// jsdom doesn't implement layout, so `Element.prototype.scrollIntoView` is missing. Several primitives
// call it from an `afterRenderEffect` (e.g. keeping the highlighted combobox item in view); without a
// stub that throws mid-render, destabilising change detection. Provide a no-op so those effects run.
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
}

globalThis.xdescribe = describe.skip;
globalThis.xit = it.skip;
