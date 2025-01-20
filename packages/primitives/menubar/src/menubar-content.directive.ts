import { Directive } from '@angular/core';
import { RdxMenuContentDirective } from '@radix-ng/primitives/menu';

@Directive({
    selector: '[MenuBarContent]',
    hostDirectives: [RdxMenuContentDirective]
})
export class RdxMenuBarContentDirective {}
