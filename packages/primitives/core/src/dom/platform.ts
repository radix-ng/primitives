/**
 * Static platform detection, evaluated once at module load — the single place this library is allowed
 * to sniff the browser engine, the OS, or the test environment.
 *
 * Everything is derived from `navigator` (plus one CSS feature probe) and is **SSR-safe**: with no
 * `navigator` / `CSS` every flag is `false`, so server rendering picks the neutral branch. Scope is
 * deliberately limited to traits that cannot change at runtime; dynamic capabilities (pointer type,
 * hover, reduced motion) are *not* platform traits — read those per event or via a media query.
 *
 * Pick the most precise group for the quirk you are working around:
 *
 * - `engine.*` — rendering-engine bugs (CSS, layout, focus, IME timing).
 * - `os.*` — OS-specific behavior (keyboard shortcuts, overlay scrollbars, native UI).
 * - `screenReader.*` — assistive-technology workarounds.
 * - `env.*` — test-environment gating.
 *
 * ```ts
 * import { rdxPlatform } from '@radix-ng/primitives/core';
 *
 * if (rdxPlatform.engine.webkit) { ... }
 * if (rdxPlatform.os.ios) { ... }
 * ```
 */

/** Rendering engine the document is running in. Mutually exclusive by construction. */
export interface RdxPlatformEngine {
    /** WebKit: Safari and every iOS browser (Chrome/Firefox on iOS included), GNOME Web. */
    readonly webkit: boolean;
    /** Gecko: Firefox on desktop and Android (Firefox on iOS is WebKit). */
    readonly gecko: boolean;
    /** Blink: Chrome, Edge, Opera, Brave and other Chromium-based browsers. */
    readonly blink: boolean;
}

/** Operating system the document is running on. */
export interface RdxPlatformOs {
    /** iPhone, iPad (including iPadOS 13+, which reports as macOS), iPod. */
    readonly ios: boolean;
    /** Android phones, tablets and embedded Android browsers. */
    readonly android: boolean;
    /** macOS desktop. Excludes iPadOS, which also reports `MacIntel`. */
    readonly mac: boolean;
    /** Windows desktop. */
    readonly windows: boolean;
    /** Linux desktop, including Chrome OS. */
    readonly linux: boolean;
    /** Any Apple OS (`mac || ios`). */
    readonly apple: boolean;
}

/** Assistive technology that *may* be running. Actual activation is not detectable. */
export interface RdxPlatformScreenReader {
    /**
     * The user *may* be using VoiceOver — it is the system screen reader on every Apple platform and
     * works with every browser there, so this is purely an OS check. Gate engine-specific quirks at
     * the call site.
     */
    readonly voiceOver: boolean;
}

/** Environment the code is executing in. */
export interface RdxPlatformEnv {
    /** Running under jsdom or happy-dom (the unit-test environments). */
    readonly jsdom: boolean;
}

/** The full set of platform flags exposed as {@link rdxPlatform}. */
export interface RdxPlatformFlags {
    readonly engine: RdxPlatformEngine;
    readonly os: RdxPlatformOs;
    readonly screenReader: RdxPlatformScreenReader;
    readonly env: RdxPlatformEnv;
}

/** Raw readings {@link rdxPlatform} is derived from. Split out so the derivation itself is testable. */
export interface RdxPlatformSource {
    /** `navigator.userAgent` (empty string when there is no `navigator`); matched case-insensitively. */
    readonly userAgent: string;
    /** `navigator.platform` (empty string when there is no `navigator`); matched case-insensitively. */
    readonly platform: string;
    /** `navigator.maxTouchPoints` (0 when there is no `navigator`). */
    readonly maxTouchPoints: number;
    /**
     * Whether `CSS.supports('-webkit-backdrop-filter: none')` holds — the WebKit probe. Blink forked
     * from WebKit in 2013 and only ships the unprefixed property, so this separates the two engines
     * without a user-agent string.
     */
    readonly webkitBackdropFilter: boolean;
}

/**
 * Derives the platform flags from raw readings.
 *
 * @internal Exported for unit tests; application code should read {@link rdxPlatform}.
 */
export function derivePlatform(source: RdxPlatformSource): RdxPlatformFlags {
    const { maxTouchPoints, webkitBackdropFilter } = source;
    const userAgent = source.userAgent.toLowerCase();
    const platform = source.platform.toLowerCase();

    // A CSS probe rather than a UA match: Safari's UA is imitated by Chrome ("… Safari/537.36") and by
    // jsdom ("AppleWebKit/537.36 … jsdom"), while the prefixed backdrop-filter is WebKit-only.
    const webkit = webkitBackdropFilter;
    // Anchored to `!webkit` so the engines stay mutually exclusive: Firefox on iOS is a WebKit browser
    // (its marker is `fxios`, not `firefox`), and Chrome on iOS is WebKit too (`crios`, but `chrome`
    // does appear in its UA).
    const gecko = !webkit && userAgent.includes('firefox');
    // Every Chromium browser ships `Chrome/` or `Chromium/`; the shared `chrom` prefix covers Chrome,
    // Edge, Opera, Brave. A positive match also keeps this `false` on the server (empty UA).
    const blink = !webkit && userAgent.includes('chrom');

    // `navigator.platform` is deprecated but universally supported and, unlike the UA string, is not
    // spoofed by the reduced-UA effort. It reads `iPhone` / `iPad` / `iPod` on iOS Safari and `iOS` via
    // `userAgentData`; iPadOS 13+ reports `MacIntel`, disambiguated by touch points. The UA fallback
    // covers embedded web views that leave `platform` empty.
    const ios =
        /^i(os$|p)/.test(platform) ||
        (platform === 'macintel' && maxTouchPoints > 1) ||
        /ip(ad|hone|od)/.test(userAgent);
    const android = platform === 'android' || userAgent.includes('android');
    const mac = !ios && platform.startsWith('mac');
    const windows = platform.startsWith('win');
    const linux = !android && /^(linux|chrome os)/.test(platform);
    const apple = mac || ios;

    return {
        engine: { webkit, gecko, blink },
        os: { ios, android, mac, windows, linux, apple },
        screenReader: { voiceOver: apple },
        env: { jsdom: /jsdom|happydom/.test(userAgent) }
    };
}

/** Reads `navigator` / `CSS` defensively — all zero values when either is missing (SSR, workers). */
function readPlatformSource(): RdxPlatformSource {
    const nav = typeof navigator === 'undefined' ? undefined : navigator;
    return {
        userAgent: nav?.userAgent ?? '',
        platform: nav?.platform ?? '',
        maxTouchPoints: nav?.maxTouchPoints ?? 0,
        webkitBackdropFilter: typeof CSS !== 'undefined' && CSS.supports?.('-webkit-backdrop-filter:none') === true
    };
}

/**
 * Platform flags for the current document. See the module docs for what belongs here and what does not.
 */
export const rdxPlatform: RdxPlatformFlags = derivePlatform(readPlatformSource());
