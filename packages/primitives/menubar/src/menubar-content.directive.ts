import { Directive } from '@angular/core';
import { RdxMenuContentDirective } from '@radix-ng/primitives/menu';

@Directive({
    selector: '[RdxMenuBarContent]',
    hostDirectives: [RdxMenuContentDirective]
})
export class RdxMenuBarContentDirective {}
