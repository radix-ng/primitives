import { ConnectedPosition } from '@angular/cdk/overlay';
import { computed, Directive, inject, input, TemplateRef } from '@angular/core';
import { RdxTooltipContentToken } from './tooltip-content.token';
import { RdxTooltipRootDirective } from './tooltip-root.directive';
import { RdxTooltipAlign, RdxTooltipSide } from './tooltip.config';
import { POSITION_MAP } from './tooltip.constants';

@Directive({
    selector: '[rdxTooltipContent]',
    standalone: true,
    host: {
        //'attr.data-state': 'delayed-open',
        //'[attr.data-side]': 'side()',
        //'[attr.data-align]': 'align()'
    },
    providers: [{ provide: RdxTooltipContentToken, useExisting: RdxTooltipContentDirective }]
})
export class RdxTooltipContentDirective {
    private readonly tooltipRoot = inject(RdxTooltipRootDirective);
    readonly templateRef = inject(TemplateRef);
    side = input<RdxTooltipSide>(RdxTooltipSide.Top);
    sideOffset = input<number>(0);
    align = input<RdxTooltipAlign>(RdxTooltipAlign.Center);
    alignOffset = input<number>(0);

    position = computed<ConnectedPosition>(() => {
        const side = this.side();
        const align = this.align();
        const sideOffset = this.sideOffset();
        // todo: add align offset
        const alignOffset = this.alignOffset();

        const positionCode = `${side}${align[0].toUpperCase() + align.slice(1)}`;

        const position = POSITION_MAP[positionCode] ?? POSITION_MAP['topCenter'];

        if (sideOffset > 0) {
            let xFactor = 0;
            let yFactor = 0;

            switch (side) {
                case RdxTooltipSide.Top:
                    yFactor = -1;
                    break;
                case RdxTooltipSide.Bottom:
                    yFactor = 1;
                    break;
                case RdxTooltipSide.Left:
                    xFactor = -1;
                    break;
                case RdxTooltipSide.Right:
                    xFactor = 1;
                    break;
            }

            position.offsetX = xFactor * sideOffset;
            position.offsetY = yFactor * sideOffset;
        }

        return position;
    });
}
