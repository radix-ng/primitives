import { ChangeDetectionStrategy, Component } from '@angular/core';
import { cn, demoAvatar } from '../../storybook/styles';
import { RdxAvatarFallbackDirective } from '../src/avatar-fallback.directive';
import { RdxAvatarImageDirective } from '../src/avatar-image.directive';
import { RdxAvatarRootDirective } from '../src/avatar-root.directive';

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
            <span [class]="cn(a.root, a.size.md)" rdxAvatarRoot>
                <img [class]="a.image" [src]="imgColm" rdxAvatarImage alt="Colm Tuite" />
                <span [class]="a.fallback" [delayMs]="600" rdxAvatarFallback>CT</span>
            </span>

            <span [class]="cn(a.root, a.size.md)" rdxAvatarRoot>
                <img [class]="a.image" [src]="imgPedro" rdxAvatarImage alt="Pedro Duarte" />
                <span [class]="a.fallback" [delayMs]="600" rdxAvatarFallback>PD</span>
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
            <span [class]="cn(a.root, a.size.sm)" rdxAvatarRoot>
                <img [class]="a.image" [src]="img" rdxAvatarImage alt="Colm Tuite" />
                <span [class]="a.fallback" rdxAvatarFallback>CT</span>
            </span>
            <span [class]="cn(a.root, a.size.md)" rdxAvatarRoot>
                <img [class]="a.image" [src]="img" rdxAvatarImage alt="Colm Tuite" />
                <span [class]="a.fallback" rdxAvatarFallback>CT</span>
            </span>
            <span [class]="cn(a.root, a.size.lg)" rdxAvatarRoot>
                <img [class]="a.image" [src]="img" rdxAvatarImage alt="Colm Tuite" />
                <span [class]="a.fallback" rdxAvatarFallback>CT</span>
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
            <span [class]="cn(a.root, a.size.md)" rdxAvatarRoot>
                <span [class]="a.fallback" rdxAvatarFallback>PD</span>
            </span>

            <!-- image that fails to load -->
            <span [class]="cn(a.root, a.size.md)" rdxAvatarRoot>
                <img [class]="a.image" rdxAvatarImage alt="Broken" src="" />
                <span [class]="a.fallback" rdxAvatarFallback>JD</span>
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
        <span [class]="cn(a.root, a.size.md)" rdxAvatarRoot>
            <img [class]="a.image" rdxAvatarImage alt="Slow" src="https://invalid.example/none.png" />
            <span [class]="a.fallback" [delayMs]="600" rdxAvatarFallback>RN</span>
        </span>
    `
})
export class RdxAvatarDelayComponent {
    protected readonly cn = cn;
    protected readonly a = demoAvatar;
}
