import { transformOrigin } from '../src/utils';

// ADR 0002 regression coverage (Codex review finding): `transformOrigin` used to treat any off-center
// arrow (`centerOffset !== 0`) the same as "no arrow at all" and fall back to an alignment-based
// origin. That was harmless while the arrow itself was hidden whenever off-center; now that
// `RdxPopperArrow` keeps it visible (ADR 0002), the transform-origin must keep tracking the arrow's
// real (off-center) tip — only a genuinely arrow-less popup should use the alignment fallback
// (mirrors Base UI's `!arrowEl` check).
describe('transformOrigin middleware (ADR 0002)', () => {
    const rects = { floating: { width: 200, height: 80 } };

    function run(middlewareData: Record<string, unknown>, placement = 'bottom') {
        const middleware = transformOrigin({ arrowWidth: 10, arrowHeight: 5 });
        return (middleware.fn as any)({ placement, rects, middlewareData });
    }

    it('tracks the arrow tip when it is off-center (uncentered, still visible)', () => {
        const result = run({ arrow: { x: 5, y: 0, centerOffset: 8 } });

        // arrowXCenter = x (5) + arrowWidth/2 (5) = 10; y = -arrowHeight (5).
        expect(result.data).toEqual({ x: '10px', y: '-5px' });
    });

    it('tracks the arrow tip when it is centered', () => {
        const result = run({ arrow: { x: 95, y: 0, centerOffset: 0 } });

        expect(result.data).toEqual({ x: '100px', y: '-5px' });
    });

    it('falls back to an alignment-based origin only when there is no arrow at all', () => {
        const result = run({}, 'bottom-start');

        // No `middlewareData.arrow` (no RdxPopperArrow content child) — Base UI's `!arrowEl` case.
        expect(result.data).toEqual({ x: '0%', y: '0px' });
    });
});
