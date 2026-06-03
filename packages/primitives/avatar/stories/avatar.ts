import { cn, demoAvatar } from '../../storybook/styles';
import { RdxAvatarFallbackDirective } from '../src/avatar-fallback.directive';
import { RdxAvatarImageDirective } from '../src/avatar-image.directive';
import { RdxAvatarRootDirective } from '../src/avatar-root.directive';
import { ChangeDetectionStrategy, Component } from '@angular/core';

const IMG_COLM = 'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80';
const IMG_PEDRO = 'https://images.unsplash.com/photo-1511485977113-f34c92461ad9?ixlib=rb-1.2.1&w=128&h=128&dpr=2&q=80';

const AVATAR_DIRECTIVES = [RdxAvatarRootDirective, RdxAvatarImageDirective, RdxAvatarFallbackDirective];

/**
 * Image avatars with an initials fallback shown only if the image is slow to load.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-avatar-demo',
    imports: AVATAR_DIRECTIVES,
    template: `
        <div class="flex items-center gap-4">
            <span rdxAvatarRoot [class]="cn(a.root, a.size.md)">
                <img rdxAvatarImage alt="Colm Tuite" [class]="a.image" [src]="imgColm" />
                <span rdxAvatarFallback [class]="a.fallback" [delayMs]="600">CT</span>
            </span>

            <span rdxAvatarRoot [class]="cn(a.root, a.size.md)">
                <img rdxAvatarImage alt="Pedro Duarte" [class]="a.image" [src]="imgPedro" />
                <span rdxAvatarFallback [class]="a.fallback" [delayMs]="600">PD</span>
            </span>
        </div>
    `
})
export class RdxAvatarDemoComponent {
    protected readonly cn = cn;
    protected readonly a = demoAvatar;
    protected readonly imgColm = IMG_COLM;
    protected readonly imgPedro = IMG_PEDRO;
}

/**
 * The same avatar at the three sizes from the style layer.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-avatar-sizes',
    imports: AVATAR_DIRECTIVES,
    template: `
        <div class="flex items-center gap-4">
            <span rdxAvatarRoot [class]="cn(a.root, a.size.sm)">
                <img rdxAvatarImage alt="Colm Tuite" [class]="a.image" [src]="img" />
                <span rdxAvatarFallback [class]="a.fallback">CT</span>
            </span>
            <span rdxAvatarRoot [class]="cn(a.root, a.size.md)">
                <img rdxAvatarImage alt="Colm Tuite" [class]="a.image" [src]="img" />
                <span rdxAvatarFallback [class]="a.fallback">CT</span>
            </span>
            <span rdxAvatarRoot [class]="cn(a.root, a.size.lg)">
                <img rdxAvatarImage alt="Colm Tuite" [class]="a.image" [src]="img" />
                <span rdxAvatarFallback [class]="a.fallback">CT</span>
            </span>
        </div>
    `
})
export class RdxAvatarSizesComponent {
    protected readonly cn = cn;
    protected readonly a = demoAvatar;
    protected readonly img = IMG_COLM;
}

/**
 * The fallback renders when there is no image or the image fails to load.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-avatar-fallback',
    imports: AVATAR_DIRECTIVES,
    template: `
        <div class="flex items-center gap-4">
            <!-- no image at all -->
            <span rdxAvatarRoot [class]="cn(a.root, a.size.md)">
                <span rdxAvatarFallback [class]="a.fallback">PD</span>
            </span>

            <!-- image that fails to load -->
            <span rdxAvatarRoot [class]="cn(a.root, a.size.md)">
                <img rdxAvatarImage alt="Broken" src="" [class]="a.image" />
                <span rdxAvatarFallback [class]="a.fallback">JD</span>
            </span>
        </div>
    `
})
export class RdxAvatarFallbackComponent {
    protected readonly cn = cn;
    protected readonly a = demoAvatar;
}

/**
 * `delayMs` waits before showing the fallback, so it only appears on slower
 * connections (here the image never loads, so the fallback appears after 600ms).
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-avatar-delay',
    imports: AVATAR_DIRECTIVES,
    template: `
        <span rdxAvatarRoot [class]="cn(a.root, a.size.md)">
            <img rdxAvatarImage alt="Slow" src="https://invalid.example/none.png" [class]="a.image" />
            <span rdxAvatarFallback [class]="a.fallback" [delayMs]="600">RN</span>
        </span>
    `
})
export class RdxAvatarDelayComponent {
    protected readonly cn = cn;
    protected readonly a = demoAvatar;
}
