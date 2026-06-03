import '@analogjs/vite-plugin-angular/setup-vitest';
import '@angular/compiler';
import { NgModule, provideZoneChangeDetection } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import '@testing-library/jest-dom/vitest';
import { toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

@NgModule({
    providers: [provideZoneChangeDetection()]
})
class TestModule {}

getTestBed().initTestEnvironment([BrowserTestingModule, TestModule], platformBrowserTesting(), {
    errorOnUnknownElements: true,
    errorOnUnknownProperties: true
});

expect.extend(toHaveNoViolations);

globalThis.xdescribe = describe.skip;
globalThis.xit = it.skip;
