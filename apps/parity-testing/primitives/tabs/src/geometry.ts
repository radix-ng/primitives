import type { Settings } from './contract';

export interface GeometrySettings {
    border?: boolean;
    padding?: boolean;
    listContentBox?: boolean;
    tabContentBox?: boolean;
    fractional?: boolean;
    orientation?: 'horizontal' | 'vertical';
    dir?: 'ltr' | 'rtl';
    scroll?: 'list' | 'inner';
    offsetParent?: boolean;
    frameClass?: string;
    tabClass?: string;
    translation?: { x: number; y: number; percent?: boolean; matrixX?: number; matrixY?: number };
    tabWarp?: boolean;
    zeroScale?: boolean;
}
const fixture = (geometry: GeometrySettings): Settings => ({ options: [], geometry });
export const geometryCases = {
    'geometry-border': fixture({ border: true }),
    'geometry-border-padding': fixture({ border: true, padding: true }),
    'geometry-list-content-box': fixture({ border: true, padding: true, listContentBox: true }),
    'geometry-tab-content-box': fixture({ tabContentBox: true }),
    'geometry-fractional-layout': fixture({ fractional: true }),
    'geometry-scroll-horizontal': fixture({ scroll: 'list' }),
    'geometry-scroll-horizontal-rtl': fixture({ scroll: 'list', dir: 'rtl', border: true }),
    'geometry-scroll-vertical': fixture({ scroll: 'list', orientation: 'vertical' }),
    'geometry-scroll-vertical-rtl': fixture({ scroll: 'list', orientation: 'vertical', dir: 'rtl', border: true }),
    'geometry-scale': fixture({ frameClass: '[transform:scale(1.5,0.75)]' }),
    'geometry-scale-border': fixture({ border: true, padding: true, frameClass: '[transform:scale(1.5,0.75)]' }),
    'geometry-rotate': fixture({ frameClass: '[transform:rotate(17deg)]' }),
    'geometry-flip': fixture({ frameClass: '[transform:scaleX(-1)]' }),
    'geometry-skew': fixture({ frameClass: '[transform:skewX(20deg)]' }),
    'geometry-perspective': fixture({ frameClass: '[transform:perspective(300px)_rotateY(45deg)]' }),
    'geometry-scale-zero': fixture({ frameClass: '[transform:scale(0)]', zeroScale: true }),
    'geometry-scale-x-zero': fixture({ frameClass: '[transform:scaleX(0)]', zeroScale: true }),
    'geometry-tab-translate': fixture({
        tabClass: '[transform:translate(12.5px,6.25px)]',
        translation: { x: 12.5, y: 6.25 }
    }),
    'geometry-tab-translate-percent': fixture({
        tabClass: '[translate:25%_-50%]',
        translation: { x: 0.25, y: -0.5, percent: true }
    }),
    'geometry-tab-translate-combined': fixture({
        tabClass: '[transform:translate(12px,4px)] [translate:25%_-50%]',
        translation: { x: 0.25, y: -0.5, percent: true, matrixX: 12, matrixY: 4 }
    }),
    'geometry-tab-rotate': fixture({ tabClass: '[transform:rotate(30deg)]', tabWarp: true }),
    'geometry-tab-scale': fixture({ tabClass: '[transform:scale(1.5)]', tabWarp: true }),
    'geometry-offset-parent': fixture({ offsetParent: true }),
    'geometry-offset-parent-rotate': fixture({ offsetParent: true, frameClass: '[transform:rotate(17deg)]' }),
    'geometry-inner-scroll-horizontal': fixture({ scroll: 'inner' }),
    'geometry-inner-scroll-vertical': fixture({ scroll: 'inner', orientation: 'vertical' }),
    'geometry-inner-scroll-rotate': fixture({ scroll: 'inner', frameClass: '[transform:rotate(17deg)]' }),
    'geometry-scaled-tab-translate': fixture({
        frameClass: '[transform:scale(1.5,0.75)]',
        tabClass: '[translate:25%_-50%]',
        translation: { x: 0.25, y: -0.5, percent: true }
    })
};
export type GeometryCaseName = keyof typeof geometryCases;

export function geometryModel(settings: GeometrySettings, step: number) {
    const vertical = settings.orientation === 'vertical';
    const widths = settings.fractional ? ['w-[80.25px]', 'w-[112.5px]', 'w-[64.75px]'] : ['w-20', 'w-28', 'w-16'];
    return {
        value: step === 1 ? 2 : 1,
        orientation: settings.orientation ?? 'horizontal',
        dir: settings.dir ?? 'ltr',
        frameClass: 'm-12 w-[480px] origin-top-left ' + (settings.frameClass ?? ''),
        listClass:
            'relative flex items-start ' +
            (vertical ? 'flex-col ' : '') +
            (settings.scroll === 'list'
                ? vertical
                    ? 'w-40 h-18 overflow-auto '
                    : 'w-48 h-16 overflow-auto '
                : 'w-96 h-24 ') +
            (settings.fractional ? 'gap-[7.5px] p-[12.5px] ' : 'gap-2 ' + (settings.padding ? 'px-4 py-3 ' : '')) +
            (settings.border ? 'border-4 border-border ' : '') +
            (settings.listContentBox ? 'box-content ' : ''),
        wrapperClass: settings.offsetParent
            ? 'relative ms-6 flex w-max shrink-0 gap-2 border-2 border-border p-2'
            : settings.scroll === 'inner'
              ? vertical
                  ? 'h-16 w-36 shrink-0 overflow-auto'
                  : 'h-12 w-48 shrink-0 overflow-auto'
              : null,
        rowClass: 'flex w-max gap-2 ' + (vertical ? 'flex-col' : ''),
        tabs: widths.map((width, value) => ({
            value,
            className:
                'shrink-0 h-8 ' +
                width +
                ' ' +
                (settings.tabClass ?? '') +
                (settings.tabContentBox ? ' box-content border-4 border-border p-2' : '')
        }))
    };
}
