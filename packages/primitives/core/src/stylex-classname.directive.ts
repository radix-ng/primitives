import { Directive, HostBinding, Input } from '@angular/core';
import stylex from '@stylexjs/stylex';

@Directive({
    selector: '[rdxStylexProps]',
    standalone: true
})
export class StylexClassnameDirective {
    @Input({ required: true }) set rdxStylexProps(stylexProps: ReturnType<typeof stylex.create>) {
        this.props = stylex.props(stylexProps['label']);
    }
    private props: ReturnType<typeof stylex.props> | undefined;
    @HostBinding('class')
    get className() {
        return this.props?.className;
    }
    get style() {
        return this.props?.style;
    }
}
