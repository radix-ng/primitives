// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { derivePlatform, rdxPlatform, RdxPlatformSource } from '../src/dom/platform';

/** Builds a source from a real-world user-agent fixture; unspecified fields take neutral values. */
function source(overrides: Partial<RdxPlatformSource>): RdxPlatformSource {
    return { userAgent: '', platform: '', maxTouchPoints: 0, webkitBackdropFilter: false, ...overrides };
}

const SAFARI_MAC = source({
    userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
    platform: 'MacIntel',
    webkitBackdropFilter: true
});

const SAFARI_IPHONE = source({
    userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
    platform: 'iPhone',
    maxTouchPoints: 5,
    webkitBackdropFilter: true
});

/** iPadOS 13+ sends the desktop Safari UA and reports `MacIntel` — only touch points give it away. */
const SAFARI_IPAD = source({
    userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
    platform: 'MacIntel',
    maxTouchPoints: 5,
    webkitBackdropFilter: true
});

const CHROME_MAC = source({
    userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    platform: 'MacIntel'
});

const CHROME_ANDROID = source({
    userAgent:
        'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
    platform: 'Linux armv81',
    maxTouchPoints: 5
});

const EDGE_WINDOWS = source({
    userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
    platform: 'Win32'
});

const FIREFOX_WINDOWS = source({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
    platform: 'Win32'
});

/** Firefox on iOS is a WebKit browser wearing an `FxiOS` badge — it must not be classified as Gecko. */
const FIREFOX_IOS = source({
    userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/124.0 Mobile/15E148 Safari/605.1.15',
    platform: 'iPhone',
    maxTouchPoints: 5,
    webkitBackdropFilter: true
});

/** Chrome on iOS (`CriOS`) is WebKit too, even though `chrom` appears in its UA. */
const CHROME_IOS = source({
    userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/124.0.6367.111 Mobile/15E148 Safari/604.1',
    platform: 'iPhone',
    maxTouchPoints: 5,
    webkitBackdropFilter: true
});

const CHROME_OS = source({
    userAgent:
        'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    platform: 'Linux x86_64'
});

const JSDOM = source({
    userAgent: 'Mozilla/5.0 (darwin) AppleWebKit/537.36 (KHTML, like Gecko) jsdom/26.1.0'
});

/** No `navigator` at all — the shape `readPlatformSource()` produces while server rendering. */
const SERVER = source({});

describe('derivePlatform', () => {
    describe('engine', () => {
        it('classifies WebKit by the prefixed backdrop-filter, not the user agent', () => {
            expect(derivePlatform(SAFARI_MAC).engine).toEqual({ webkit: true, gecko: false, blink: false });
            // Both fake a `Safari` token, so a UA match would misfire here.
            expect(derivePlatform(CHROME_MAC).engine.webkit).toBe(false);
            expect(derivePlatform(JSDOM).engine.webkit).toBe(false);
        });

        it('classifies Blink for every Chromium browser', () => {
            expect(derivePlatform(CHROME_MAC).engine).toEqual({ webkit: false, gecko: false, blink: true });
            expect(derivePlatform(EDGE_WINDOWS).engine.blink).toBe(true);
            expect(derivePlatform(CHROME_ANDROID).engine.blink).toBe(true);
        });

        it('classifies Gecko only for real Firefox, not its iOS build', () => {
            expect(derivePlatform(FIREFOX_WINDOWS).engine).toEqual({ webkit: false, gecko: true, blink: false });
            expect(derivePlatform(FIREFOX_IOS).engine).toEqual({ webkit: true, gecko: false, blink: false });
        });

        it('keeps iOS Chrome on WebKit despite the `chrom` token', () => {
            expect(derivePlatform(CHROME_IOS).engine).toEqual({ webkit: true, gecko: false, blink: false });
        });

        it('reports no engine on the server', () => {
            expect(derivePlatform(SERVER).engine).toEqual({ webkit: false, gecko: false, blink: false });
        });
    });

    describe('os', () => {
        it('detects macOS without claiming iOS', () => {
            expect(derivePlatform(SAFARI_MAC).os).toEqual({
                ios: false,
                android: false,
                mac: true,
                windows: false,
                linux: false,
                apple: true
            });
        });

        it('detects iPhone', () => {
            const os = derivePlatform(SAFARI_IPHONE).os;
            expect(os.ios).toBe(true);
            expect(os.mac).toBe(false);
            expect(os.apple).toBe(true);
        });

        it('detects touch-capable `MacIntel` (iPadOS 13+) as iOS rather than macOS', () => {
            const os = derivePlatform(SAFARI_IPAD).os;
            expect(os.ios).toBe(true);
            expect(os.mac).toBe(false);
        });

        it('detects Android and does not also report Linux', () => {
            const os = derivePlatform(CHROME_ANDROID).os;
            expect(os.android).toBe(true);
            expect(os.linux).toBe(false);
        });

        it('detects Windows and Chrome OS / Linux', () => {
            expect(derivePlatform(EDGE_WINDOWS).os.windows).toBe(true);
            expect(derivePlatform(CHROME_OS).os.linux).toBe(true);
        });

        it('falls back to the user agent when `navigator.platform` is empty (web views)', () => {
            const os = derivePlatform(
                source({ userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15' })
            ).os;
            expect(os.ios).toBe(true);
        });

        it('reports no OS on the server', () => {
            expect(derivePlatform(SERVER).os).toEqual({
                ios: false,
                android: false,
                mac: false,
                windows: false,
                linux: false,
                apple: false
            });
        });
    });

    it('flags VoiceOver on every Apple platform only', () => {
        expect(derivePlatform(SAFARI_MAC).screenReader.voiceOver).toBe(true);
        expect(derivePlatform(SAFARI_IPHONE).screenReader.voiceOver).toBe(true);
        expect(derivePlatform(CHROME_ANDROID).screenReader.voiceOver).toBe(false);
        expect(derivePlatform(SERVER).screenReader.voiceOver).toBe(false);
    });

    it('flags the jsdom / happy-dom test environments', () => {
        expect(derivePlatform(JSDOM).env.jsdom).toBe(true);
        expect(derivePlatform(SAFARI_MAC).env.jsdom).toBe(false);
        expect(derivePlatform(SERVER).env.jsdom).toBe(false);
    });
});

describe('rdxPlatform', () => {
    it('reads the live environment as jsdom, never as WebKit', () => {
        // WebKit-only branches (the scroll-lock pinch-zoom bail-out, the 5ms IME guard, the
        // number-field pointer-lock opt-out) must stay off in the unit suite.
        expect(rdxPlatform.env.jsdom).toBe(true);
        expect(rdxPlatform.engine.webkit).toBe(false);
    });
});
