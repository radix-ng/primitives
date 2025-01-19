import { Directive } from '@angular/core';
import { RdxMenuContentDirective } from '@radix-ng/primitives/menu';

@Directive({
    selector: '[MenuBarContent]',
    standalone: true,
    hostDirectives: [RdxMenuContentDirective]
})
export class RdxMenuBarContentDirective {}
