# Meter parity

Run `pnpm test-parity meter` for the Angular and pinned Base UI Meter fixtures in Chromium, Firefox
and WebKit. The scenarios cover reactive ranges, equal bounds, non-finite values, localized visible
and accessible text, authored ARIA, dynamic labels, and HTML and SVG geometry.

The paired suite records actual browser bounds and SVG path geometry. Angular applies automatic
linear styles to HTML Indicator hosts. SVG Indicators retain authored geometry and can use the
computed percentage. The malformed range fallback is covered by the Angular unit suite.
